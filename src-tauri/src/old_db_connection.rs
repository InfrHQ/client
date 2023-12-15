use chrono::prelude::*;

extern crate chrono;
extern crate serde;
extern crate serde_json;

use chrono::Utc;
use serde::{Serialize, Deserialize};
use serde_json::{Value, to_value};
use std::collections::HashMap;
use std::error::Error as StdError;
use std::fmt;

use std::time::{SystemTime, UNIX_EPOCH};

use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};


#[derive(Serialize, Deserialize, Debug)]
pub struct Segment {
    id: String,
    date_generated: f64,
    lat: Option<f64>,
    lng: Option<f64>,
    vector: Vec<f64>,
    name: String,
    description: String,
    extracted_text: String,
    attributes: String,
    item_type: String,
    device_id: String,
    available_in: Vec<String>,
    status: String,
}


// Starting here
use chrono::{DateTime, NaiveDateTime};

#[derive(Debug)]
struct MyData {
    id: i32,
    timestamp_column: NaiveDateTime,
}
// Ending here

/*
pub fn create_and_store_segment(
    segment_id: &str,
    date_generated: f64,
    lat: Option<f64>,
    lng: Option<f64>,
    vector: Vec<f64>,
    name: String,
    description: String,
    extracted_text: String,
    attributes: HashMap<String, Value>,
    item_type: String,
    device_id: String,
    available_in: Vec<String>,
    status: String,
) -> Result<(), CustomError> {

    println!("String with Postgres stuff");
    let date_generated_utc = Utc.timestamp(date_generated as i64, 0);

    // Serialize attributes to JSON string
    let attributes_json = serde_json::to_string(&attributes)?;

    // Create the segment
    let segment = Segment {
        id: segment_id.to_string(),
        date_generated: date_generated_utc.timestamp() as f64,
        lat,
        lng,
        vector,
        name,
        description,
        extracted_text,
        attributes: attributes_json,
        item_type,
        device_id,
        available_in,
        status,
    };

    let timestamp_value: DateTime<Utc> = Utc::now();
    // Convert DateTime<Utc> to NaiveDateTime
    let naive_timestamp: NaiveDateTime = timestamp_value.naive_utc();


    let attributes_json = serde_json::to_string(&segment.attributes).unwrap();

    println!("adiaholic attributes_json: {}", attributes_json);

    let vector = &segment.vector.clone();
    
    let none_data_to_insert: Option<f64> = None;

    /*

    // Establish a connection to the database
    let mut client = Client::connect("postgresql://adiaholic:terminator@localhost:5432/infr_db", NoTls)?;

    // Store the segment
    client.execute(
        "INSERT INTO segment (id, date_generated, lat, lng, vector, name, description, extracted_text, attributes, item_type, device_id, available_in, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
        &[
            &segment.id,
            &naive_timestamp,
            &segment.lat,
            &segment.lng,
            &none_data_to_insert,
            &segment.name,
            &segment.description,
            &segment.extracted_text,
            &segment.attributes,
            &segment.item_type,
            &segment.device_id,
            &segment.available_in,
            &segment.status,
        ],
    )?;
     */

    println!("Closing Postgres stuff for id: {}", segment_id);

    Ok(())
}
*/

pub fn test(attributes: HashMap<String, Value>) {
    print!("adiaholic attributes: {:?}\n", attributes);

    let timestamp = get_seconds_since_epoch();
    print!("adiaholic timestamp: {}\n", timestamp);


    let segment_id = get_alphnum_id("segment_", 16);
    println!("Generated segment_id: {}", segment_id);

    let name = get_name(timestamp);

    let description = "Some Description".to_string();

    let extracted_text = "Extracted Text".to_string();

    let item_type = "screenshot".to_string();

    let device_id = "default_device_id".to_string();

    let available_in: Vec<String> = vec!["localhost".to_string()];

    let status = "active".to_string();

    // if let Err(err) = create_and_store_segment(
    //     &segment_id,
    //     timestamp,
    //     Some(0.0),
    //     Some(0.0),
    //     vec![1.0, 2.0, 3.0],
    //     name,
    //     description,
    //     extracted_text,
    //     attributes,
    //     item_type,
    //     device_id,
    //     available_in,
    //     status
    // ) {
    //     eprintln!("Error: {}", err);
    // }
}

fn get_seconds_since_epoch() -> f64 {
    // Get the current time
    let current_time = SystemTime::now();

    // Calculate the duration since the UNIX epoch
    let duration_since_epoch = current_time.duration_since(UNIX_EPOCH).expect("Time went backwards");

    // Extract the seconds component from the duration
    let res = duration_since_epoch.as_secs();

    let f64_value: f64 = res as f64;

    return f64_value;
}

fn get_alphnum_id(prefix: &str, id_len: usize) -> String {
    let random_suffix: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(id_len)
        .map(char::from)
        .collect();

    format!("{}{}", prefix, random_suffix)
}

fn get_name(date_generated: f64) -> String {
    // Convert timestamp to DateTime<Utc>
    let date_time_utc: DateTime<Utc> = DateTime::from_utc(NaiveDateTime::from_timestamp(date_generated as i64, 0), Utc);

    // Format the string
    let name = format!("Desktop Screenshot - {}", date_time_utc.format("%a, %d %b, %Y %H:%M:%S GMT"));

    // Print the result
    println!("Generated name: {}", name);

    return name;
}