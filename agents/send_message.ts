export interface OutgoingMessage {
  channel: string;
  to?: string;
  text: string;
}

/**
 * Stub send_message tool.
 * In a real system this would publish to omni.outbox.
 */
export async function send_message(_msg: OutgoingMessage): Promise<void> {
  // no-op stub
}
