import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triage } from './triage';
import * as sendModule from '../send_message';

vi.mock('../send_message', () => ({
  send_message: vi.fn().mockResolvedValue(undefined),
}));

describe('triage router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('responds to greeting', async () => {
    const res = await triage({ text: 'Oi', channel: 'whatsapp', from: 'user' });
    expect(res.intent).toBe('greeting');
    expect(res.reply).toMatch(/ol[áa]/i);
    expect(sendModule.send_message).toHaveBeenCalledWith({
      channel: 'whatsapp',
      to: 'user',
      text: res.reply,
    });
  });

  it('handles budget intent with checklist', async () => {
    const res = await triage({ text: 'Quero um orçamento', channel: 'whatsapp' });
    expect(res.intent).toBe('budget');
    expect(res.reply).toMatch(/consumo.*kwh/i);
    expect(res.reply).toMatch(/CEP/i);
    expect(res.reply).toMatch(/fase/i);
    expect(res.reply).toMatch(/telefone/i);
  });

  it('includes kb snippet in reply', async () => {
    const res = await triage({ text: 'informação solar', channel: 'whatsapp' });
    expect(res.snippets.length).toBeGreaterThan(0);
    expect(res.reply).toContain(res.snippets[0]);
  });
});
