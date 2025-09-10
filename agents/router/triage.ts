import { classify, type Intent } from './policies';
import { handleSales } from './handlers/sales';
import { kb_search } from '../kb/kb_search';
import { send_message, type OutgoingMessage } from '../send_message';

export interface MessageCanonical {
  text: string;
  channel: string;
  from?: string;
}

export interface TriageResult {
  intent: Intent;
  reply: string;
  snippets: string[];
}

/**
 * Main triage router: classifies intent, searches KB and sends reply.
 */
export async function triage(msg: MessageCanonical): Promise<TriageResult> {
  const intent = classify(msg.text);
  const snippets = await kb_search(msg.text);

  let reply: string;
  switch (intent) {
    case 'greeting':
      reply = 'Olá! Como posso ajudar?';
      break;
    case 'budget':
      reply = handleSales();
      break;
    case 'status':
      reply = 'Estamos verificando seu pedido. Em breve retornaremos.';
      break;
    case 'human':
      reply = 'Claro, vou encaminhar para um atendente humano.';
      break;
    default:
      reply = 'Desculpe, não entendi.';
  }

  if (snippets.length) {
    reply += `\n\n${snippets[0]}`;
  }

  const outbound: OutgoingMessage = {
    channel: msg.channel,
    to: msg.from,
    text: reply,
  };
  await send_message(outbound);

  return { intent, reply, snippets };
}
