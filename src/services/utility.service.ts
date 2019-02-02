export function testEmail(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
}

export function testUsername(username: string): boolean {
    return /^[0-9a-zA-Z_.-]+$/.test(username);
}

