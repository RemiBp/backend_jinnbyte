import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const comparePassword = async (inputPassword: string, storedHash: string): Promise<boolean> => {
  try {
    const match = await bcrypt.compare(inputPassword, storedHash);
    return match;
  } catch (error) {
    console.error('Error in comparePassword', { error });
    throw new Error('Error comparing passwords');
  }
};
