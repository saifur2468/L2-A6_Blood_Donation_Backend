import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  const options: SignOptions = {
    expiresIn: expireTime as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, options);
};

export const jwtHelpers = {
  generateToken,
};