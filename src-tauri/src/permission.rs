use crate::mac_commands;
use screenshots::Screen;
use std::time::SystemTime;

pub fn applescript() -> i32 {
    match mac_commands::get_current_app_pid() {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

// For Google Chrome
pub fn google_chrome_url() -> i32 {
    match mac_commands::get_mac_browser_current_tab_url("Google Chrome") {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

pub fn google_chrome_html() -> i32 {
    match mac_commands::get_mac_browser_window_html("Google Chrome") {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

// For Brave Browser
pub fn brave_browser_url() -> i32 {
    match mac_commands::get_mac_browser_current_tab_url("Brave Browser") {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

pub fn brave_browser_html() -> i32 {
    match mac_commands::get_mac_browser_window_html("Brave Browser") {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

// For Safari
pub fn safari_url() -> i32 {
    match mac_commands::get_mac_browser_current_tab_url("Safari") {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

pub fn safari_html() -> i32 {
    match mac_commands::get_mac_browser_window_html("Safari") {
        Ok(_) => 200,
        Err(_) => 400,
    }
}

pub fn screen() -> i32 {
    let start = SystemTime::now();
    match Screen::all() {
        Ok(screens) => {
            for screen in screens {
                if let Err(_) = screen.capture() {
                    return 400;
                }
            }
            println!("Done: {:?}", start.elapsed().ok());
            200
        },
        Err(_) => 400,
    }
}

