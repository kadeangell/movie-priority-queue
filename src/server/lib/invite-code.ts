const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion

export function generateInviteCode(length = 6): string {
	let code = "";
	for (let i = 0; i < length; i++) {
		code += CHARS[Math.floor(Math.random() * CHARS.length)];
	}
	return code;
}
