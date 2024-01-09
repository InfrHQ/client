use screenshots::Screen;
use std::time::SystemTime;
use std::io::{Cursor, Write};
use std::fs::File;
use image::ImageOutputFormat;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use std::path::PathBuf;

pub fn capture() -> String {
    let start = SystemTime::now();
    let mut base64_images = Vec::new();

    let screens = Screen::all().unwrap();
    let last_screen = screens.get(screens.len() - 1); // get the last screen

    if let Some(screen) = last_screen {
        let image = screen.capture().unwrap();
        let mut bytes: Vec<u8> = Vec::new();
        let mut cursor = Cursor::new(&mut bytes);
        image.write_to(&mut cursor, ImageOutputFormat::Png).unwrap();

        // Save the screenshot to a file
        let mut path = PathBuf::new();
        match dirs::desktop_dir() {
            Some(mut desktop_path) => {
                desktop_path.push("screenshot.png");  // Assuming the file is named "screenshot.png"
                path = desktop_path;
                println!("Desktop directory: {:?}", path);
            },
            None => println!("Desktop directory not found"),
        }
    
        let mut file = File::create(path.to_str().unwrap()).unwrap();
        file.write_all(&bytes).unwrap();

        println!("File saved !");

        let base64_image = STANDARD.encode(&bytes);
        base64_images.push(base64_image);
    }

    println!("Done: {:?}", start.elapsed().ok());
    base64_images.get(0).unwrap().clone() // return the base64 string of the last screen
}
