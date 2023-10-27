use screenshots::Screen;
use std::time::SystemTime;
use std::io::Cursor;
use image::ImageOutputFormat;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;

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
        let base64_image = STANDARD.encode(&bytes);
        base64_images.push(base64_image);
    }

    println!("Done: {:?}", start.elapsed().ok());
    base64_images.get(0).unwrap().clone() // return the base64 string of the last screen
}
