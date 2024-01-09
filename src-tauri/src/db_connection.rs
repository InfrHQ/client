use tokio_postgres::{NoTls, Config};
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use chrono::Utc;
use chrono::{DateTime, NaiveDateTime};
use std::collections::HashMap;
use tokio::runtime::Runtime;


fn get_alphnum_id(prefix: &str, id_len: usize) -> String {
    let random_suffix: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(id_len)
        .map(char::from)
        .collect();

    format!("{}{}", prefix, random_suffix)
}


pub fn insert_into_segment(host:String, device_id:String, api_key:String, info: HashMap<String, Option<String>>, screenshot_image:String, star:bool, conversion_text:String) {
    println!("Inserting data into segment");

    // Replace the connection string with your PostgreSQL connection details
    let connection_string = "postgresql://adiaholic:terminator@localhost:5432/infr_db";

    // Parse the connection string into a configuration
    let config = connection_string
        .parse::<Config>()
        .expect("Failed to parse connection string");

    // Create a tokio runtime for running asynchronous code
    let rt = Runtime::new().expect("Failed to create Tokio runtime");

    let result = rt.block_on(async {
        let (client, connection) = config.connect(NoTls)
            .await
            .expect("Failed to connect to the database");

        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("Connection error: {}", e);
            }
        });
    
        // Generate date and time values
        let now = Utc::now();
        let date_created = now.format("%Y-%m-%d %H:%M:%S").to_string();
        let date_updated = now.format("%Y-%m-%d %H:%M:%S").to_string();
        let date_generated = now.format("%Y-%m-%d %H:%M:%S").to_string();

        // Build the query string
        let query_string:String = format!(
            "INSERT INTO segment (id, device_id, status, item_type, date_created, date_updated, date_generated, extracted_text, available_in) VALUES ($1, $2, $3, $4, '{}', '{}', '{}', $5, $6)",
            date_created, date_updated, date_generated
        );
        let query = query_string.as_str();

        // Parameters for the query
        let id = get_alphnum_id("segment_", 16);
        let device_id = "device_bdd9qrx0";
        let status = "active";
        let item_type = "screenshot";
        let extracted_text = conversion_text;
        let available_in: Vec<&str> = vec![]; 
        // Execute the query
        let res = client.execute(query, &[&id, &device_id, &status, &item_type, &extracted_text, &available_in]).await;
        println!("Insert query result: {:?}", res);
        "Done"
    });

    println!("Leaving insert_segment");

}
