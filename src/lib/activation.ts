import crypto from 'crypto';
import { prisma } from './prisma';
import { hashPassword } from './auth';

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a cryptographically secure single-use activation token for a new student.
 * Stores only the SHA-256 hash in the database.
 * Returns the unhashed rawToken to be delivered in the activation email.
 */
export async function createActivationToken(userId: string): Promise<string> {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours validity

  // Invalidate any existing unused tokens for this user
  await prisma.accountActivationToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.accountActivationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

/**
 * Verifies that the raw activation token exists, is unused, and hasn't expired.
 */
export async function verifyActivationToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.accountActivationToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!tokenRecord) return null;
  if (tokenRecord.usedAt !== null) return null;
  if (new Date() > tokenRecord.expiresAt) return null;

  return tokenRecord;
}

/**
 * Activates the user account with their chosen password and marks the token used.
 */
export async function consumeActivationToken(rawToken: string, newPasswordPlain: string) {
  const tokenRecord = await verifyActivationToken(rawToken);
  if (!tokenRecord) {
    throw new Error('Invalid or expired activation link.');
  }

  const passwordHash = await hashPassword(newPasswordPlain);

  return prisma.$transaction(async (tx) => {
    // 1. Update user password and activate account
    const updatedUser = await tx.user.update({
      where: { id: tokenRecord.userId },
      data: {
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // 2. Mark token as consumed
    await tx.accountActivationToken.update({
      where: { id: tokenRecord.id },
      data: {
        usedAt: new Date(),
      },
    });

    return updatedUser;
  });
}

/**
 * Generates a secure password reset token (1 hour validity)
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

/**
 * Verifies a password reset token
 */
export async function verifyPasswordResetToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!tokenRecord) return null;
  if (tokenRecord.usedAt !== null) return null;
  if (new Date() > tokenRecord.expiresAt) return null;

  return tokenRecord;
}

/**
 * Consumes the reset token and updates the password
 */
export async function consumePasswordResetToken(rawToken: string, newPasswordPlain: string) {
  const tokenRecord = await verifyPasswordResetToken(rawToken);
  if (!tokenRecord) {
    throw new Error('Invalid or expired password reset link.');
  }

  const passwordHash = await hashPassword(newPasswordPlain);

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    return { success: true };
  });
}
