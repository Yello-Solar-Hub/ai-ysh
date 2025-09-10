import { describe, expect, test, vi } from 'vitest';
import type { RedisClientType } from 'redis';
import { sendMessage, type SendMessageInput } from './send_message';

describe('sendMessage tool', () => {
  test('publishes valid message', async () => {
    const xAdd = vi.fn().mockResolvedValue('1-1');
    const mockRedis = { xAdd } as unknown as RedisClientType;
    const tool = sendMessage({ redis: mockRedis });
    const res = await tool.execute({
      to: { id: 'user-1' },
      content: { type: 'text', text: 'hello' },
    });
    expect(res.ok).toBe(true);
    expect(xAdd).toHaveBeenCalledOnce();
    const [, , args] = xAdd.mock.calls[0];
    const payload = JSON.parse(args.payload);
    expect(payload.to.id).toBe('user-1');
  });

  test('returns error on schema failure', async () => {
    const mockRedis = { xAdd: vi.fn() } as unknown as RedisClientType;
    const tool = sendMessage({ redis: mockRedis });
    const res = await tool.execute({} as unknown as SendMessageInput);
    expect(res.ok).toBe(false);
    expect(res.code).toBe('INVALID_INPUT');
  });

  test('propagates trace id', async () => {
    const xAdd = vi.fn().mockResolvedValue('1-1');
    const mockRedis = { xAdd } as unknown as RedisClientType;
    const tool = sendMessage({ redis: mockRedis });
    const res = await tool.execute({
      to: { id: 'user-1' },
      content: { type: 'text', text: 'hello' },
      metadata: { trace_id: 'trace-123' },
    });
    expect(res.trace_id).toBe('trace-123');
    const [, , args] = xAdd.mock.calls[0];
    const payload = JSON.parse(args.payload);
    expect(payload.trace_id).toBe('trace-123');
  });
});
