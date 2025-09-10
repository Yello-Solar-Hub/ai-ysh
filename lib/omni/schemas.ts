import { z } from 'zod';
import { CHANNELS, MESSAGE_STATUSES, ROUTE_ADAPTERS } from './constants';

export const routeSchema = z.object({
  adapter: z.enum(ROUTE_ADAPTERS),
  threadId: z.string().optional(),
});

export const contactRefSchema = z.object({
  kind: z.enum(CHANNELS),
  id: z.string(),
  display: z.string().optional(),
  route: routeSchema.optional(),
});

const mimeSchema = z.string().regex(/^[\w.+-]+\/[\w.+-]+$/);

export const contentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({
    type: z.literal('image'),
    url: z.string().url(),
    mime: mimeSchema.optional(),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal('audio'),
    url: z.string().url(),
    mime: mimeSchema.optional(),
    duration_ms: z.number().int().nonnegative().optional(),
  }),
  z.object({
    type: z.literal('file'),
    url: z.string().url(),
    mime: mimeSchema.optional(),
    filename: z.string().optional(),
  }),
  z.object({
    type: z.literal('location'),
    lat: z.number().gte(-90).lte(90),
    lon: z.number().gte(-180).lte(180),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal('template'),
    name: z.string(),
    variables: z.record(z.string()).optional(),
  }),
]);

export const messageCanonicalSchema = z.object({
  id: z.string(),
  channel: z.enum(CHANNELS),
  direction: z.enum(['in', 'out']),
  from: contactRefSchema,
  to: contactRefSchema,
  content: contentSchema,
  timestamp: z.string().datetime(),
  status: z.enum(MESSAGE_STATUSES).optional(),
  metadata: z.record(z.unknown()).optional(),
  trace: z
    .object({
      trace_id: z.string(),
      span_id: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
  errors: z
    .array(
      z.object({
        code: z.string(),
        message: z.string(),
        at: z.string().optional(),
      }),
    )
    .optional(),
});
