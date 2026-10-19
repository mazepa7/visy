import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/database.js';

try {
  const schemaPath = new URL('./schema.sql', import.meta.url);
  const schema = await readFile(fileURLToPath(schemaPath), 'utf8');
  await pool.query(schema);
  console.log('Banco da Visy preparado.');
} catch (error) {
  console.error('Não foi possível preparar o banco:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
