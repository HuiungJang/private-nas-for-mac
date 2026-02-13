export const queryKeys = {
  files: (path?: string) => ['files', path ?? '/'] as const,
  users: () => ['users'] as const,
  systemHealth: () => ['system-health'] as const,
  auditLogs: (offset = 0, limit = 100) => ['audit-logs', offset, limit] as const,
};
