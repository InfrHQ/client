use std::process::Command;
use std::fs;
use std::path::PathBuf;

pub fn execute_ocr() -> String {
    let mut path = PathBuf::new();

    match dirs::desktop_dir() {
        Some(mut desktop_path) => {
            desktop_path.push("screenshot.png");  // Assuming the file is named "screenshot.png"
            path = desktop_path;
            println!("Desktop directory: {:?}", path);
        },
        None => println!("Desktop directory not found"),
    }

    let output = Command::new("src/litex")
        .arg(path.to_str().unwrap())  // Convert PathBuf to &str
        .output()
        .expect("Failed to execute command");

    // Create a String to store the result
    let returning_result: String;

    // Check if the command was executed successfully
    if output.status.success() {
        // Convert standard output to String
        returning_result = String::from_utf8_lossy(&output.stdout).to_string();
    } else {
        // Convert standard error to String if the command failed
        returning_result = String::from_utf8_lossy(&output.stderr).to_string();
    }

    match fs::remove_file(&path) {
        Ok(_) => println!("File deleted successfully."),
        Err(e) => println!("Error deleting file: {:?}", e),
    }

    returning_result
}
