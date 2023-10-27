use auto_launch::AutoLaunchBuilder;
use crate::store;
use std::sync::{Arc, Mutex};
/* 
DOCK ICON
*/
pub fn handle_dock_icon_on_setup(app: &mut tauri::App, value: Option<String>) -> Result<(), String> {
    match value {
        Some(value) => {
            if value == "false" {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
                Ok(())
            } else {
                app.set_activation_policy(tauri::ActivationPolicy::Regular);
                Ok(())
            }
        },
        None => {
            app.set_activation_policy(tauri::ActivationPolicy::Regular);
            Ok(())
        },
    }
}


/* 
ON LOGIN LAUNCH
*/
pub fn handle_launch_on_login(value: Option<String>) -> Result<(), String> {
    match value {
        Some(value) => {
            if value == "false" {
                launch_on_login(false);
                Ok(())
            } else {
                launch_on_login(true);
                Ok(())
            }
        },
        None => {
            launch_on_login(false);
            Ok(())
        },
    }
}

pub fn launch_on_login(enable: bool) -> bool {
    let auto = AutoLaunchBuilder::new()
        .set_app_name("Infr")
        .set_app_path("/Applications/Infr.app")
        .build()
        .unwrap();

    if enable {
        match auto.enable() {
            Ok(_) => return true,
            Err(_) => {
                println!("Failed to set auto launch on login. Permission denied");
                false
            }
        }
    } else {
        match auto.disable() {
            Ok(_) => return true,
            Err(_) => return false,
        }
    }
}


/* 
HOTKEYS
*/
pub fn get_search_hotkey(storage: tauri::State<'_, Arc<Mutex<store::Store>>>) -> Result<String, String> {
    let storage = storage.lock().unwrap();
    match storage.get_key("search_hotkey") {
        Some(value) => Ok(value),
        None => Ok(String::from("Ctrl+I")),
    }
}