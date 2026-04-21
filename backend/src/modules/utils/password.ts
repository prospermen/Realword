import bcrypt from 'bcryptjs';

// 📚 bcrypt 的工作原理：
// - salt rounds（这里是 10）表示哈希计算的迭代次数，数字越大越安全但越慢
// - 每次哈希结果都不同（salt 随机），所以同一个密码哈希两次结果不同
// - 这意味着你无法"解密"密码，只能用 compare 验证

const SALT_ROUNDS = 10;

/**
 * 对明文密码进行哈希
 * @param plainPassword 用户输入的明文密码
 * @returns 哈希后的密码（存入数据库）
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * 验证密码是否匹配
 * @param plainPassword 用户输入的明文密码
 * @param hashedPassword 数据库中存的哈希密码
 * @returns true 表示密码正确
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
