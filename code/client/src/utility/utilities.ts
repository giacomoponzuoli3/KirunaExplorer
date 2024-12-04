function decimalToDMS(decimal: number) {
    const degrees = Math.floor(decimal);
    const minutesDecimal = Math.abs((decimal - degrees) * 60);
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.round((minutesDecimal - minutes) * 60);

    // Handle edge case for rounding up seconds
    if (seconds === 60) {
        return `${degrees + Math.sign(degrees)}° ${minutes + 1}' 0"`;
    }

    return `${degrees}° ${minutes}' ${seconds}"`;
}

export { decimalToDMS }