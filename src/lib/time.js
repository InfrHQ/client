function postConvertTimestamp(timestamp) {
    // Convert the timestamp to a Date object
    const date = new Date(timestamp); // Multiplied by 1000 because JS works in milliseconds

    // Get the date string for 'datetime' key
    const dateString = date.toISOString().split('T')[0];

    // Convert date to human-readable title format
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    const ordinalSuffix = (n) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
        }
    };
    const title = `${months[date.getMonth()]} ${date.getDate()}${ordinalSuffix(date.getDate())}, ${date.getFullYear()}`;

    // Get the local time with timezone abbreviation
    const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const timeZone = /\(([^)]+)\)/.exec(date.toString())[1]; // Extracts timezone abbreviation from date string
    const localTime = `${timeString} ${timeZone}`;

    // Return the desired dictionary structure
    return {
        datetime: dateString,
        title: title,
        time: localTime,
        dateAndTimeWithoutTimezone: `${timeString} ${title}`,
        imageTitle: `${title} at ${localTime}`,
    };
}

export { postConvertTimestamp };
