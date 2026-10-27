import bcrypt from "bcryptjs";

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  // Dukungan backward compatibility jika ada password legacy yang belum di-hash
  if (!hashedPassword.startsWith("$2a$") && !hashedPassword.startsWith("$2b$")) {
    return plainText === hashedPassword;
  }
  return bcrypt.compare(plainText, hashedPassword);
}
