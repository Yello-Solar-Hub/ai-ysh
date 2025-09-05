import { openDB } from 'idb';

export interface Scenario {
  id: string;
  payload: unknown;
  updatedAt: number;
}

const DB_NAME = 'scenarios';
const STORE_NAME = 'scenario';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
}

export async function saveScenario(id: string, payload: unknown) {
  const db = await getDb();
  const data: Scenario = { id, payload, updatedAt: Date.now() };
  await db.put(STORE_NAME, data);
}

export async function loadScenario(id: string): Promise<Scenario | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function listScenarios(): Promise<Scenario[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}
