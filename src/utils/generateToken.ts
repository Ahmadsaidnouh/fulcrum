import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

interface JwtPayload {
  userId: string;
}

const generateToken = (userId: string): string => {
  const payload: JwtPayload = { userId };

  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRE_TIME as StringValue, // StringValue | number ✔
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, options);
};

export default generateToken;
