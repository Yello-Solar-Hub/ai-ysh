export type Intent = 'greeting' | 'budget' | 'status' | 'human' | 'unknown';

/**
 * Classifies a text message into an intent using simple regex rules.
 */
export function classify(text: string): Intent {
  const msg = text.toLowerCase();

  if (/^\s*(ol[áa]|oi|bom dia|boa tarde|boa noite)/.test(msg)) {
    return 'greeting';
  }

  if (/orç[aã]mento|preço|quanto custa|cotação|budget/.test(msg)) {
    return 'budget';
  }

  if (/status|andamento|como est[aá]|progresso/.test(msg)) {
    return 'status';
  }

  if (/humano|atendente|pessoa/.test(msg)) {
    return 'human';
  }

  return 'unknown';
}
