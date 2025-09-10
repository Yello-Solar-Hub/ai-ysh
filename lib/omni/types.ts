import type { CHANNELS, MESSAGE_STATUSES, ROUTE_ADAPTERS } from './constants';

export type Channel = (typeof CHANNELS)[number];

export interface ContactRef {
  kind: Channel; // origem/destino
  id: string; // e.g. whatsapp:+55... | web:userId | email:foo@bar
  display?: string; // nome opcional
  route?: {
    adapter: (typeof ROUTE_ADAPTERS)[number];
    threadId?: string;
  };
}

export type Content =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; mime?: string; caption?: string }
  | { type: 'audio'; url: string; mime?: string; duration_ms?: number }
  | { type: 'file'; url: string; mime?: string; filename?: string }
  | { type: 'location'; lat: number; lon: number; label?: string }
  | { type: 'template'; name: string; variables?: Record<string, string> };

export interface MessageCanonical {
  id: string; // ulid/uuid
  channel: Channel; // canal principal do evento
  direction: 'in' | 'out'; // sentido no Omni
  from: ContactRef;
  to: ContactRef;
  content: Content;
  timestamp: string; // ISO8601
  status?: (typeof MESSAGE_STATUSES)[number];
  metadata?: Record<string, unknown>;
  trace?: { trace_id: string; span_id?: string; source?: string };
  errors?: Array<{ code: string; message: string; at?: string }>;
}
