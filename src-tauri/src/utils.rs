pub fn convert_to_slack_link(window_name: Option<String>) -> Option<String> {
    // Check if window_name is Some and not empty
    let window_name = match window_name {
        Some(window_name) if !window_name.is_empty() => window_name,
        _ => return None,
    };

    let parts: Vec<&str> = window_name.split(" - ").collect();
    if parts.len() != 3 || parts[2] != "Slack" {
        return None;
    }

    let channel_name = parts[0];
    let team_name = parts[1];

    Some(format!("slack://channel?team={}&id={}", team_name, channel_name))
}
