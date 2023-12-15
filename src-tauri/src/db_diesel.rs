#[macro_use]
use diesel::prelude::*;
use diesel::pg::PgConnection;
// use dotenv::dotenv;
use std::env;
use diesel::table;
use diesel::Insertable;
use diesel::sql_types::*;
use diesel::dsl::*;


// Define your table structure as per your schema
table! {
    segment (id) {
        id -> Varchar,
        device_id -> Nullable<Varchar>,
        // status -> Varchar,
        // item_type -> Varchar,
        // date_created -> Timestamp,
        // date_updated -> Timestamp,
        // date_generated -> Timestamp,
        // available_in -> Nullable<Varchar>,
        // lat -> Nullable<Float8>,
        // lng -> Nullable<Float8>,
        // vector -> Nullable<Varchar>,
        // name -> Nullable<Varchar>,
        // description -> Nullable<Text>,
        // extracted_text -> Nullable<Text>,
        // attributes -> Nullable<Jsonb>,
    }
}

#[derive(Insertable)]
#[table_name="segment"]
struct NewSegment {
    // Define fields to match your table columns, use `Option` for nullable columns
    id: String,
    device_id: Option<String>,
    // status: String,
    // item_type: String,
    // date_created: chrono::NaiveDateTime,
    // date_updated: chrono::NaiveDateTime,
    // date_generated: chrono::NaiveDateTime,
    // available_in: Option<String>,
    // lat: Option<f64>,
    // lng: Option<f64>,
    // vector: Option<String>, // Adjust the type according to your vector column
    // name: Option<String>,
    // description: Option<String>,
    // extracted_text: Option<String>,
    // attributes: Option<serde_json::Value>,
}

fn insert_new_segment(conn: &PgConnection, new_segment: NewSegment) -> QueryResult<usize> {
    use segment::dsl::*;

    diesel::insert_into(segment)
        .values(&new_segment)
        .execute(conn)
}

pub fn main() {
    // dotenv().ok();
    // let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let database_url = "postgresql://adiaholic:terminator@localhost:5432/infr_db";
    let connection = PgConnection::establish(&database_url).unwrap();

    // Example usage:
    let new_segment = NewSegment {
        id: "some_id".to_string(),
        device_id: Some("device_id".to_string()),
        // status: "active".to_string(),
        // item_type: "type".to_string(),
        // date_created: chrono::Local::now().naive_local(),
        // date_updated: chrono::Local::now().naive_local(),
        // date_generated: chrono::Local::now().naive_local(),
        // available_in: Some("some_place".to_string()),
        // lat: Some(45.5165),
        // lng: Some(-73.5764),
        // vector: None,
        // name: Some("Segment Name".to_string()),
        // description: Some("Description of the segment".to_string()),
        // extracted_text: None,
        // attributes: None, // Provide a JSON value if necessary
    };

    insert_new_segment(&connection, new_segment).expect("Error inserting new segment");
}
