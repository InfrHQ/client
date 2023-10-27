use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

pub struct Store {
    data: HashMap<String, String>,
    filepath: String,
}

impl Store {
    pub fn new(data_dir: PathBuf) -> Self {
        let filepath = if cfg!(debug_assertions) {
            String::from("../database/store.json")
        } else {
            let store_filepath = data_dir.join("store.json");
            store_filepath.to_str().unwrap().to_string()
        };

        let data = if Path::new(&filepath).exists() {
            match File::open(&filepath) {
                Ok(mut file) => {
                    let mut contents = String::new();
                    file.read_to_string(&mut contents)
                        .expect("Failed to read file");
                    match serde_json::from_str::<HashMap<String, String>>(&contents) {
                        Ok(data) => data,
                        Err(_) => HashMap::new(),
                    }
                }
                Err(_) => {
                    println!("Failed to open file. Creating file");
                    let _ = std::fs::create_dir_all(Path::new(&filepath).parent().expect("invalid store path"));
                    HashMap::new()
                }
            }
        } else {
            println!("File path does not exist. Creating file");
            let _ = std::fs::create_dir_all(Path::new(&filepath).parent().expect("invalid store path"));
            HashMap::new()
        };

        Store {
            data,
            filepath,
        }
    }

    pub fn set_key(&mut self, key: &str, value: &str) {
        self.data.insert(key.to_string(), value.to_string());
        self.save_to_file().expect("Failed to save to file");
    }

    pub fn get_key(&self, key: &str) -> Option<String> {
        match self.data.get(key) {
            Some(value) => Some(value.clone()),
            None => None,
        }
    }

    fn save_to_file(&self) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(&self.data).unwrap();
        let mut file = File::create(&self.filepath)?;
        file.write_all(json.as_bytes())?;
        Ok(())
    }
}


// Storage
#[tauri::command]
pub async fn set_data(storage: tauri::State<'_, Arc<Mutex<Store>>>, key: String, value: String) -> Result<(), String> {
    let mut storage = storage.lock().unwrap();
    storage.set_key(&key, &value);
    Ok(())
}

#[tauri::command]
pub async fn get_data(storage: tauri::State<'_, Arc<Mutex<Store>>>, key: String) -> Result<Option<String>, String> {
    let storage = storage.lock().unwrap();
    match storage.get_key(key.as_str()) {
        Some(value) => Ok(Some(value)),
        None => Ok(None),
    }
}