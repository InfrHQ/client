use std::thread;
use std::time::Duration;
use std::sync::mpsc::{self, Sender};
use crate::mac_commands;
use crate::screenshot;
use crate::store;
use crate::utils;
use reqwest::blocking::Client;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use std::collections::HashMap;
use serde_json::json;
use std::sync::{Arc, Mutex};
use image::io::Reader as ImageReader;
use image::DynamicImage;
use std::io::Cursor;
use base64::decode;
use rusty_tesseract::Image;
use rusty_tesseract::Args;
use regex::Regex;
use serde_json::Value;
use std::any::type_name;
use std::mem::discriminant;


pub struct BackgroundJob {
    handle: Option<thread::JoinHandle<()>>,
    stop_signal: Option<Sender<()>>,
    host: String,
    api_key: String,
    device_id: String,
    incognito_keywords: Vec<String>,
    sampling_rate: u32,
    running: bool,
    star_next_run:  Arc<Mutex<bool>>,
}

impl BackgroundJob {
    pub fn new(storage: tauri::State<'_, Arc<Mutex<store::Store>>>) -> Self {
        let storage = storage.lock().unwrap();
        let server_credentials = storage.get_key("server_credentials").unwrap_or_default();
        let server_credentials_map: HashMap<String, String> = serde_json::from_str(&server_credentials).unwrap_or_default();
        let host = server_credentials_map.get("host").unwrap_or(&"default_host".to_string()).clone();
        let api_key = server_credentials_map.get("api_key").unwrap_or(&"default_api_key".to_string()).clone();
        let device_id = server_credentials_map.get("device_id").unwrap_or(&"default_device_id".to_string()).clone();
        let running = false;
        let incognito_keywords: Vec<String> = serde_json::from_str(&
            storage.get_key("incognito_keywords").unwrap_or_default()
        ).unwrap_or_default();
        let sampling_rate_str = storage.get_key("sampling_rate").unwrap_or_default();
        let sampling_rate: u32 = serde_json::from_str(&sampling_rate_str).unwrap_or(30);
        Self {
            handle: None,
            stop_signal: None,
            host,
            api_key,
            device_id,
            incognito_keywords: incognito_keywords,
            running,
            sampling_rate,
            star_next_run: Arc::new(Mutex::new(false)),
        }
    }

    pub fn start(&mut self) {

        self.running = true;
        let (tx, rx) = mpsc::channel();
        let host = self.host.clone();
        let api_key = self.api_key.clone();
        let device_id = self.device_id.clone();
        let incognito_keywords = self.incognito_keywords.clone();
        let sampling_rate = self.sampling_rate.clone();

        // Mutex based clones
        let star_next_run = self.star_next_run.clone();

        self.handle = Some(thread::spawn(move || {
            loop {
                if let Ok(_) = rx.try_recv() {
                    println!("Stopping background job.");
                    break;
                }
                
                let host_clone = host.clone();
                let api_key_clone = api_key.clone();
                let device_id_clone = device_id.clone();
                let incognito_keywords_clone = incognito_keywords.clone();
                
                let sampling_rate_clone = sampling_rate.clone();
                let sleep_duration_secs = 60.0 / sampling_rate_clone as f64;
                let sleep_duration_ms = (sleep_duration_secs * 1000.0) as u64;
    
                // Check if mutex clones have been updated
                let should_start_next_run: bool;
                {
                    let mut run = star_next_run.lock().unwrap();
                    should_start_next_run = *run;
                    *run = false; // Reset the value after reading it.
                }

                // Spawn a new thread for the cron_job
                // RUN_CRON_JOB_ASYNC_UNCOMMENT
                //thread::spawn(move || {
                //    cron_job(host_clone, device_id_clone, api_key_clone, incognito_keywords_clone);
                //});
                cron_job(host_clone, device_id_clone, api_key_clone, incognito_keywords_clone, should_start_next_run);
                
                // Sleep for 2 seconds before starting the next job
                thread::sleep(Duration::from_millis(sleep_duration_ms));
            }
        }));
    
        self.stop_signal = Some(tx);
    }
    
    pub fn stop(&mut self) {
        self.running = false;
        if let Some(sender) = self.stop_signal.take() {
            sender.send(()).unwrap();
        }

        if let Some(handle) = self.handle.take() {
            handle.join().unwrap();
        }
    }

    pub fn star_next_run(&mut self) {
        let mut run = self.star_next_run.lock().unwrap();
        *run = true;
    }
    
    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn update_variables(&mut self, storage: tauri::State<'_, Arc<Mutex<store::Store>>> ) {

        let storage = storage.lock().unwrap();

        // Update incognito keywords
        print!("\n\n\nUpdating valriables...\nUpdating incognito keywords...");
        let new_keywords: Vec<String> = serde_json::from_str(
            &storage.get_key("incognito_keywords").unwrap_or_default()
        ).unwrap_or_default();
        self.incognito_keywords = new_keywords;

        // Update sampling rate
        print!("Updating sampling rate...\n\n\n");
        let sampling_rate_str = storage.get_key("sampling_rate").unwrap_or_default();
        let sampling_rate: u32 = serde_json::from_str(&sampling_rate_str).unwrap_or(30);
        self.sampling_rate = sampling_rate;
    }

    pub fn update_server_credentials(&mut self, storage: tauri::State<'_, Arc<Mutex<store::Store>>> ) {
        let storage = storage.lock().unwrap();
        let server_credentials = storage.get_key("server_credentials").unwrap_or_default();        
        let server_credentials_map: HashMap<String, String> = serde_json::from_str(&server_credentials).unwrap_or_default();
        self.host = server_credentials_map.get("host").unwrap_or(&"default_host".to_string()).clone();
        self.api_key = server_credentials_map.get("api_key").unwrap_or(&"default_api_key".to_string()).clone();
        self.device_id = server_credentials_map.get("device_id").unwrap_or(&"default_device_id".to_string()).clone();
    }
    
}

fn get_app_info() -> HashMap<String, Option<String>> {
    let mut info = HashMap::new();

    let app_name_ini = mac_commands::get_current_app_name().ok();
    let app_bundle_id = mac_commands::get_current_app_bundle_id().ok();
    let app_name = handle_app_name(app_name_ini.clone(), app_bundle_id.clone());
    let app_pid = mac_commands::get_current_app_pid().ok();
    let window_name = mac_commands::get_window_name().ok();

    info.insert("app_name".to_string(), app_name.clone());
    info.insert("bundle_id".to_string(), app_bundle_id);
    info.insert("app_pid".to_string(), app_pid);
    info.insert("window_name".to_string(), window_name.clone());

    if app_name.as_deref() == Some("Google Chrome") || app_name.as_deref() == Some("Brave Browser") || app_name.as_deref() == Some("Safari") {
        // WINDOW_HTML_UNCOMMENT
        // let (tab_url, window_html) = get_browser_details(app_name.as_deref().unwrap_or_default());
        let tab_url = get_browser_details(app_name.as_deref().unwrap_or_default());
        
        // WINDOW_HTML_UNCOMMENT
        // info.insert("page_html".to_string(), window_html.ok());
        info.insert("current_url".to_string(), tab_url.ok());
    }

    // If app is slack, try to get the internal URL
    if app_name.as_deref() == Some("Slack") && window_name.as_deref().is_some() {
        let tab_url = utils::convert_to_slack_link(window_name);
        info.insert("current_url".to_string(), tab_url);
    }
    
    info
}

fn handle_app_name(app_name: Option<String>, bundle_id: Option<String>) -> Option<String> {
    if app_name == Some("Electron".to_string()) {
        if bundle_id == Some("com.microsoft.VSCode".to_string()) {
            return Some("Visual Studio Code".to_string());
        }
    }
    return app_name;
}

// WINDOW_HTML_UNCOMMENT
//fn get_browser_details(browser_name: &str) -> (Result<String, std::io::Error>, Result<String, std::io::Error>) {
fn get_browser_details(browser_name: &str) -> Result<String, std::io::Error> {
    let tab_url = mac_commands::get_mac_browser_current_tab_url(browser_name);
    
    // WINDOW_HTML_UNCOMMENT
    // let window_html = mac_commands::get_mac_browser_window_html(browser_name);
    // (tab_url, window_html)
    tab_url
}

pub fn cron_job(host: String, device_id: String, api_key: String, incognito_keywords: Vec<String>, star: bool) {
    let info = get_app_info();

    let is_incognito = check_for_incognito(
        info.get("window_name").unwrap_or(&None).clone(),
        info.get("app_name").unwrap_or(&None).clone(),
        info.get("tab_url").unwrap_or(&None).clone(),
        info.get("app_bundle_id").unwrap_or(&None).clone(),
        incognito_keywords,
    );

    // If is incognito, don't send screenshot
    if is_incognito {
        println!("Incognito detected. Not sending screenshot.");
        return;
    }

    // let screenshot_image = screenshot::capture();
    // let _ = send_to_api(host, device_id, api_key, info, screenshot_image, star);
    // println!("Cron run completed.\n")

    // fill your own argument struct if needed
    // Optional arguments are ignored if set to `None`
    let mut my_args = Args {
        //model language (tesseract default = 'eng')
        //available languages can be found by running 'rusty_tesseract::get_tesseract_langs()'
        lang: "eng".to_string(),

        //map of config variables
        //this example shows a whitelist for the normal alphabet. Multiple arguments are allowed.
        //available arguments can be found by running 'rusty_tesseract::get_tesseract_config_parameters()'
        config_variables: HashMap::from([(
                "tessedit_char_whitelist".into(),
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".into(),
            )]),
        dpi: Some(150),       // specify DPI for input image
        psm: Some(6),         // define page segmentation mode 6 (i.e. "Assume a single uniform block of text")
        oem: Some(3),         // define optical character recognition mode 3 (i.e. "Default, based on what is available")
    };

    let screenshot_image = screenshot::capture_image();

    let dynamic_image = DynamicImage::ImageRgba8(screenshot_image);
    let img = Image::from_dynamic_image(&dynamic_image).unwrap();

    let box_data = rusty_tesseract::image_to_data(&img, &my_args).unwrap();

    let extracted_text = rusty_tesseract::image_to_string(&img, &my_args).unwrap();
    let cleaned_text = clean_string(&extracted_text);
    
    // Iterate over the HashMap
    for (key, value) in info.iter() {
        println!("Key: {}", key);

        // Match on the Option to handle Some and None cases
        match value {
            Some(inner_value) => println!("Value: {}", inner_value),
            None => println!("Value is None"),
        }
    }

    // Assuming `json_metadata` is a HashMap<String, serde_json::Value>
    let mut attributes: HashMap<String, Value> = HashMap::new();
    let keys = vec![
        "app_name",
        "window_name",
        "current_url",
        "bundle_id",
        "app_pid",
        "tags",
    ];

    for k in keys {
        if let Some(value) = info.get(k).cloned() {
            let value_string = value.clone().unwrap_or_default();

            // Convert to appropriate data type based on the content
            let converted_value: serde_json::Value = if let Ok(number) = value_string.parse::<i64>() {
                serde_json::Value::Number(serde_json::Number::from(number))
            } else if let Ok(float) = value_string.parse::<f64>() {
                serde_json::Value::Number(serde_json::Number::from_f64(float).unwrap())
            } else {
                serde_json::Value::String(value_string)
            };

            attributes.insert(k.to_string(), converted_value);
        }
    }

    attributes.insert(
        "bounding_box_available".to_string(),
        Value::Bool(!box_data.data.is_empty()),
    );

    attributes.insert(
        "page_html_available".to_string(),
        Value::Bool(false),
    );

    // Print the resulting attributes HashMap
    println!("{:?}", attributes);

    let window_name_val: String = match attributes.get("window_name") {
        Some(value) => value.as_str().unwrap_or("").to_string(),
        None => String::new(),
    };
    let app_name_val: String = match attributes.get("app_name") {
        Some(value) => value.as_str().unwrap_or("").to_string(),
        None => String::new(),
    };

    let conversion_text = format!(
        "{} {} {}",
        extracted_text,
        window_name_val,
        app_name_val
    );

    println!("adiaholic: conversion_text: {}", conversion_text);

    println!("adiaholic: Cron run completed.\n");
}

fn clean_string(text: &str) -> String {
    // Replace newline characters with space
    let mut cleaned_text = text.replace("\n", " ");

    // Remove backslashes
    cleaned_text = cleaned_text.replace("\\", "");

    // Replace hash characters with space
    cleaned_text = cleaned_text.replace("#", " ");

    // Reduce multiple spaces to a single space
    let re = Regex::new(r"\s+").unwrap();
    cleaned_text = re.replace_all(&cleaned_text, " ").to_string();

    // Lowercase the text
    cleaned_text = cleaned_text.to_lowercase();

    // Trim leading and trailing whitespace
    cleaned_text.trim().to_string()
}

fn check_for_incognito(
    window_name: Option<String>,
    app_name: Option<String>,
    current_url: Option<String>,
    bundle_id: Option<String>,
    incognito_keywords: Vec<String>,
) -> bool {


    let window_name_lower = window_name.as_deref().unwrap_or("").to_lowercase();
    let app_name_lower = app_name.as_deref().unwrap_or("").to_lowercase();
    let current_url_lower = current_url.as_deref().unwrap_or("").to_lowercase();
    let bundle_id_lower = bundle_id.as_deref().unwrap_or("").to_lowercase();

    for keyword in incognito_keywords {
        let keyword_words: Vec<&str> = keyword.split_whitespace().collect();
        let all_words_included: Vec<bool> = keyword_words
            .iter()
            .map(|word| {
                window_name_lower.contains(word)
                    || app_name_lower.contains(word)
                    || current_url_lower.contains(word)
                    || bundle_id_lower.contains(word)
            })
            .collect();

        if all_words_included.iter().all(|&x| x) {
            return true;
        }
    }

    false
}
