export const CHANNELS = [
  'whatsapp',
  'web',
  'email',
  'voice',
  'sms',
  'telegram',
] as const;

export const CONTENT_TYPES = [
  'text',
  'image',
  'audio',
  'file',
  'location',
  'template',
] as const;

export const MESSAGE_STATUSES = [
  'queued',
  'sent',
  'delivered',
  'read',
  'failed',
] as const;

export const ROUTE_ADAPTERS = [
  'mcp-whatsapp',
  'web',
  'smtp',
] as const;
