import { prisma } from './prisma';

export async function logAuditEvent({
  userId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: {
  userId?: string | null;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        targetType,
        targetId: targetId || null,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
