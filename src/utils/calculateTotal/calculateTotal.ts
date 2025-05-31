export function calculateTotal(amounts: string): number {
    if (!amounts || amounts.trim() === '') {
        return 0;
    }

    // Split by both commas and newlines, then filter out empty strings
    const amountArray = amounts
        .split(/[,\n]+/) // Split by comma or newline
        .map(num => num.trim()) // Remove whitespace
        .filter(num => num !== '') // Remove empty strings
        .map(num => parseFloat(num)) // Convert to numbers
        .filter(num => !isNaN(num)); // Remove invalid numbers

    // Calculate the sum
    return amountArray.reduce((sum, num) => sum + num, 0);
}
