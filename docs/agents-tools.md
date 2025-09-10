# Agents Tools

## sendMessage

Publica mensagens no bus `omni.outbox` com telemetria.

```ts
import { sendMessage } from '../agents/tools';

const tool = sendMessage();
await tool.execute({
  to: { id: 'user-1' },
  content: { type: 'text', text: 'Hello' },
});
```
