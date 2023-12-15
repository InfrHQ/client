// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::Manager;

// System tray attributes
use tauri::{SystemTray, SystemTrayEvent};
mod system_tray;
use futures::executor;

// Screenshot
pub mod cron;
pub mod mac_commands;
pub mod screenshot;
pub mod store;
pub mod utils;

// Background runner
use crate::cron::BackgroundJob;

// Search bar
#[allow(unused_imports)]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
mod ns_panel;

// Permissions
pub mod permission;

// Preferences
pub mod preference;

// pub mod db_connection;
pub mod db_diesel;

fn main() {
    
    // Main
    tauri::Builder::default()
        .system_tray(SystemTray::new())
        .on_system_tray_event(|_app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a left click");
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                println!("system tray menu item clicked: {}", id);
                if id == "quit" {
                    std::process::exit(0);
                }
                if id == "star" {
                    let job = _app.state::<Arc<Mutex<BackgroundJob>>>();
                    let mut _job = job.lock().unwrap();
                    _job.star_next_run();
                }
                if id == "launch_dashboard" {
                    let window = _app.get_window("main").unwrap();
                    window.show().unwrap();
                }
                if id == "launch_search" {
                    let window = _app.get_window("search").unwrap();
                    window.show().unwrap();
                }
                if id == "pause_bg" {
                    let job = _app.state::<Arc<Mutex<BackgroundJob>>>();
                    let _ = executor::block_on(stop_background(job, _app.clone()));
                }
                if id == "resume_bg" {
                    let job: tauri::State<'_, Arc<Mutex<BackgroundJob>>> =
                        _app.state::<Arc<Mutex<BackgroundJob>>>();
                    let storage: tauri::State<'_, Arc<Mutex<store::Store>>> =
                        _app.state::<Arc<Mutex<store::Store>>>();
                    let _ = executor::block_on(start_background(job,storage ,_app.clone()));
                }
            }
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let window_label = event.window().label(); // get the label of the window

                match window_label {
                    "main" => {
                        #[cfg(not(target_os = "macos"))]
                        {
                            event.window().hide().unwrap();
                        }

                        #[cfg(target_os = "macos")]
                        {
                            tauri::AppHandle::hide(&event.window().app_handle()).unwrap();
                        }
                        api.prevent_close(); // prevent the application from exiting
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .setup(move |app: &mut tauri::App| {
            
            // Set up storage
            let app_dir = app
            .path_resolver()
            .app_data_dir()
            .expect("failed to resolve app dir");
            let storage_open = store::Store::new(app_dir);
            let storage = Arc::new(Mutex::new(storage_open));
            app.manage(storage.clone());
            
            // Setup background runner
            let shared_background_job = Arc::new(Mutex::new(BackgroundJob::new(app.state::<Arc<Mutex<store::Store>>>())));
            let job = shared_background_job.clone();
            app.manage(job);

            // Dev preferences
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }

            // Setup search bar
            let hotkey = preference::get_search_hotkey(app.state::<Arc<Mutex<store::Store>>>());
            let window = app.get_window("search").unwrap();
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(10.0))
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            ns_panel::init_ns_panel(app.app_handle(), window, &hotkey.unwrap());

            // Setup system tray
            system_tray::create_not_running_job_system_tray(app.app_handle());

            // Check for updates
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                match tauri::updater::builder(handle).check().await {
                    Ok(update) => {
                        if update.is_update_available() {
                            update.download_and_install().await.unwrap();
                        }
                    }
                    Err(e) => {
                        println!("failed to get update: {}", e);
                    }
                }
            });

            // Handle preferences
            let temp_storage = storage.clone();
            let dock_value = temp_storage.lock().unwrap().get_key("dock_icon");
            let _ = preference::handle_dock_icon_on_setup(app, dock_value);

            // Handle on login launch
            let temp_storage: Arc<Mutex<store::Store>> = storage.clone();
            let launch_on_login_value = temp_storage.lock().unwrap().get_key("launch_on_login");
            let _ = preference::handle_launch_on_login(launch_on_login_value);
            
            Ok(())
        })
        .manage(ns_panel::State::default())
        .invoke_handler(tauri::generate_handler![
            check_permission,
            store::set_data,
            store::get_data,
            start_background,
            stop_background,
            background_is_running,
            update_variables,
            ns_panel::show_app,
            ns_panel::hide_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


// Permissions
#[tauri::command]
async fn check_permission(check_permission_name: String) -> i32 {
    let permission_name = check_permission_name.as_str();

    let permission = match permission_name {
        "applescript" => permission::applescript(),
        "google_chrome_url" => permission::google_chrome_url(),
        "google_chrome_html" => permission::google_chrome_html(),
        "brave_browser_url" => permission::brave_browser_url(),
        "brave_browser_html" => permission::brave_browser_html(),
        "safari_url" => permission::safari_url(),
        "safari_html" => permission::safari_html(),
        "screen" => permission::screen(),
        _ => 400,
    };

    permission
}

// Background runner
// Add a background_start & background_stop command
#[tauri::command]
async fn start_background(
    job: tauri::State<'_, Arc<Mutex<BackgroundJob>>>,
    storage: tauri::State<'_, Arc<Mutex<store::Store>>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let mut job = job.lock().unwrap();
    job.update_server_credentials(storage.clone());
    job.update_variables(storage);
    // If already running, return
    if job.is_running() {
        return Ok(());
    }
    job.start();

    // Update the system tray
    system_tray::create_running_job_system_tray(app);

    println!("Background job started.");
    Ok(())
}

#[tauri::command]
async fn stop_background(
    job: tauri::State<'_, Arc<Mutex<BackgroundJob>>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let mut job = job.lock().unwrap();
    job.stop();

    // Update the system tray
    system_tray::create_not_running_job_system_tray(app);

    println!("Background job stopped.");
    Ok(())
}

#[tauri::command]
async fn background_is_running(
    job: tauri::State<'_, Arc<Mutex<BackgroundJob>>>,
) -> Result<bool, String> {
    let job = job.lock().unwrap();
    Ok(job.is_running())
}

#[tauri::command]
async fn update_variables(
    job: tauri::State<'_, Arc<Mutex<BackgroundJob>>>,
    storage: tauri::State<'_, Arc<Mutex<store::Store>>>
) -> Result<bool, String> {
    let mut job = job.lock().unwrap();
    job.update_variables(storage);
    Ok(true)
}
