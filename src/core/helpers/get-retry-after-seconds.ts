export function getRetryAfterSeconds(lastSentAt: Date | null, cooldownMs: number): number | null {
  if (!lastSentAt) {
    return null;
  }

  const timePassed = Date.now() - lastSentAt.getTime();

  if (timePassed >= cooldownMs) {
    return null;
  }

  return Math.ceil((cooldownMs - timePassed) / 1000);
}
