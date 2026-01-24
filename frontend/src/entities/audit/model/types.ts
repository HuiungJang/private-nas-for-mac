export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  targetResource: string;
  traceId: string;
  ipAddress: string;
  timestamp: string;
  status: string;
}
