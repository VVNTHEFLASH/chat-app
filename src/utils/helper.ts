function formatTime(isoDate: string): string {
    const date = new Date(isoDate);

    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };

    // Format the time to HH:MM:SS AM/PM
    const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date);
    return formattedTime;
}

export {
    formatTime
}