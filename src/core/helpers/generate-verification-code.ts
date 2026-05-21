import { randomInt } from 'node:crypto';

export function generateVerificationCode(): string {
  return randomInt(0, 1000000).toString().padStart(6, '0');
}
