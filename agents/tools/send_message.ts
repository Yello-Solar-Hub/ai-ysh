import { createClient, type RedisClientType } from 'redis';
import { z } from 'zod';
import pino from 'pino';
import { nanoid } from 'nanoid';

const logger = pino({ name: 'agents.tools.send_message' });

const contactRefSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
});

const contentSchema = z
  .object({
    type: z.string(),
    text: z.string().optional(),
  })
  .passthrough();

const inputSchema = z.object({
  to: contactRefSchema,
  content: contentSchema,
  channel: z.string().optional(),
  metadata: z.any().optional(),
});

export type SendMessageInput = z.infer<typeof inputSchema>;

export interface SendMessageResult {
  ok: boolean;
  id?: string;
  trace_id?: string;
  code?: string;
  message?: string;
}

export interface SendMessageOptions {
  redis?: RedisClientType;
  stream?: string;
}

export const sendMessage = ({
  redis,
  stream = 'omni.outbox',
}: SendMessageOptions = {}) => ({
  name: 'send_message',
  description: 'Publish a message to the omni outbox stream',
  inputSchema,
  async execute(raw: SendMessageInput): Promise<SendMessageResult> {
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: parsed.error.message,
      };
    }

    const data = parsed.data;
    const id = nanoid();
    const traceId = data.metadata?.trace_id ?? nanoid();
    const payload = { id, trace_id: traceId, ...data };

    const client = redis ?? createClient();
    if (!redis) {
      await client.connect();
    }

    try {
      await client.xAdd(stream, '*', {
        payload: JSON.stringify(payload),
      });
      logger.info({ trace_id: traceId, id }, 'message published');
      return { ok: true, id, trace_id: traceId };
    } catch (error) {
      logger.error({ trace_id: traceId, err: error }, 'publish failed');
      return {
        ok: false,
        code: 'REDIS_ERROR',
        message: error instanceof Error ? error.message : String(error),
      };
    } finally {
      if (!redis) {
        await client.quit();
      }
    }
  },
});

export default sendMessage;
