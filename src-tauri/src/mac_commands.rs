use std::process::Command;

pub fn execute_applescript(script: String) -> Result<String, std::io::Error> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().into())
    } else {
        println!("output: {:?}", output);
        Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!(
                "AppleScript execution failed: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            ),
        ))
    }
}

pub fn get_current_app_name() -> Result<String, std::io::Error> {
    let script = r#"
        tell application "System Events"
            set frontApp to name of first application process whose frontmost is true
        end tell
    "#;
    execute_applescript(script.into())
}

pub fn get_current_app_bundle_id() -> Result<String, std::io::Error> {
    let script = r#"
    tell application "System Events"
        set frontmostApp to first application process where it is frontmost
        set bundleID to bundle identifier of frontmostApp
    end tell
    return bundleID
    "#;
    execute_applescript(script.into())
}

pub fn get_current_app_pid() -> Result<String, std::io::Error> {
    let script = r#"
        tell application "System Events"
            set frontApp to unix id of first application process whose frontmost is true
        end tell
    "#;
    execute_applescript(script.into())
}

pub fn get_window_name() -> Result<String, std::io::Error> {
    let script = r#"tell app "System Events" to get the name of the front window of (first application process whose frontmost is true)"#;
    execute_applescript(script.into())
}

pub fn get_mac_browser_current_tab_url(browser_name: &str) -> Result<String, std::io::Error> {
    let script = match browser_name {
        "Safari" => "tell application \"Safari\" to get URL of current tab of front window".to_string(),
        "Google Chrome" | "Brave Browser" => format!(
            r#"tell application "{}" to get the URL of the active tab of its first window"#,
            browser_name
        ),
        _ => return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Unsupported browser: {}", browser_name),
        )),
    };

    execute_applescript(script)
}

pub fn get_mac_browser_window_html(browser_name: &str) -> Result<String, std::io::Error> {
    let script = match browser_name {
        "Google Chrome" => r#"
            tell application "Google Chrome"
                set activeTab to active tab of window 1
                set pageHTML to execute activeTab javascript "document.documentElement.outerHTML"
                return pageHTML
            end tell
        "#.to_string(),
        
        "Safari" => r#"
            tell application "Safari"
                set pageHTML to do JavaScript "document.documentElement.outerHTML" in current tab of window 1
                return pageHTML
            end tell
        "#.to_string(),

        "Brave Browser" => r#"
            tell application "Brave Browser"
                set activeTab to active tab of window 1
                set pageHTML to execute activeTab javascript "document.documentElement.outerHTML"
                return pageHTML
            end tell
        "#.to_string(),

        _ => return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Unsupported browser: {}", browser_name),
        )),
    };

    execute_applescript(script)
}
