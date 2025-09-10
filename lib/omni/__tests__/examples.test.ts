import { describe, it, expect } from 'vitest';
import { messageCanonicalSchema } from '../schemas';
import inbound from '../examples/inbound.json';
import outbound from '../examples/outbound.json';

describe('message canonical schema examples', () => {
  it('validates inbound example', () => {
    expect(() => messageCanonicalSchema.parse(inbound)).not.toThrow();
  });

  it('validates outbound example', () => {
    expect(() => messageCanonicalSchema.parse(outbound)).not.toThrow();
  });
});
