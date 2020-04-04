export const randomHex = (length: number): string =>
    (Math.random().toString(16) + '0'.repeat(length)).slice(2, length + 2);
