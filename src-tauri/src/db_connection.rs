use tokio_postgres::{NoTls, Config};
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use chrono::Utc;
use chrono::{DateTime, NaiveDateTime};


#[tokio::main]
pub async fn main() {
    // Replace the connection string with your PostgreSQL connection details
    let connection_string = "postgresql://adiaholic:terminator@localhost:5432/infr_db";

    // Parse the connection string into a configuration
    let config = connection_string
                            .parse::<Config>()
                            .expect("Failed to parse connection string");

    // Establish a connection to the database
    let (client, connection) = config.connect(NoTls)
        .await
        .expect("Failed to connect to the database");

    // Spawn a new tokio task to handle the connection
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("Connection error: {}", e);
        }
    });

    // Replace 'segment' with the actual table name
    let table_name = "segment";

    // Define the INSERT query
    let query = format!(
        "INSERT INTO {} (id, device_id, status, item_type, date_created) VALUES ($1, $2, $3, $4, $5)",
        table_name
    );

    println!("adiaholic");
    println!("{}", query);

    let segment_id = get_alphnum_id("segment_", 16);

    let timestamp_value: DateTime<Utc> = Utc::now();


    // // Replace '$1' and '$2' with actual placeholders and values
    let values: [&(dyn tokio_postgres::types::ToSql + Sync); 5] = [
        &segment_id,
        &"device_bdd9qrx0",
        &"active",
        &"screenshot",
        &timestamp_value.to_rfc3339()
    ];

    println!("{:?}", values);

    // // Execute the INSERT query
    client
        .execute(&query, &values)
        .await
        .expect("Failed to execute INSERT query");

    println!("Data inserted successfully! - {}",segment_id);


}


fn get_alphnum_id(prefix: &str, id_len: usize) -> String {
    let random_suffix: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(id_len)
        .map(char::from)
        .collect();

    format!("{}{}", prefix, random_suffix)
}


/*
fn select_query() {
    let query = "SELECT * FROM segment";
    let rows = client.query(query, &[]).await.expect("Failed to execute query");

    // Process and print the results
    for row in &rows {
        // Assuming you have columns named 'column1', 'column2', etc.
        let column1: String = row.get("device_id");

        // Print or process the data as needed
        println!("Column1: {}", column1);
    }
}
 */