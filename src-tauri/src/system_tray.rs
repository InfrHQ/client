use tauri::{CustomMenuItem, SystemTrayMenuItem, SystemTrayMenu};

pub fn create_running_job_system_tray(app: tauri::AppHandle)  {

    // Update the system tray icon
    app.tray_handle()
        .set_icon(tauri::Icon::File(
            app.path_resolver()
                .resolve_resource("tray/icon.png")
                .unwrap(),
        ))
        .unwrap();

    let pause = CustomMenuItem::new("pause_bg".to_string(), "Pause Recorder");
    let dashboard = CustomMenuItem::new("launch_dashboard".to_string(), "Dashboard");
    let search = CustomMenuItem::new("launch_search".to_string(), "Search");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let star = CustomMenuItem::new("star".to_string(), "Star");
    let tray_menu = SystemTrayMenu::new()
        .add_item(pause)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(dashboard)
        .add_item(search)
        .add_item(star)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    app.tray_handle().set_menu(tray_menu).unwrap();

}

pub fn create_not_running_job_system_tray(app: tauri::AppHandle) {

    // Update the system tray icon
    app.tray_handle()
        .set_icon(tauri::Icon::File(
            app.path_resolver()
                .resolve_resource("tray/icon_cancel.png")
                .unwrap(),
        ))
        .unwrap();

    let resume = CustomMenuItem::new("resume_bg".to_string(), "Resume Recorder");
    let dashboard = CustomMenuItem::new("launch_dashboard".to_string(), "Dashboard");
    let search = CustomMenuItem::new("launch_search".to_string(), "Search");
    let quit  = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(resume)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(dashboard)
        .add_item(search)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    app.tray_handle().set_menu(tray_menu).unwrap();
}

