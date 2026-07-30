#!/usr/bin/env node
/**
 * dump-world — vuelca a JSON legible las colecciones LevelDB de un mundo de Foundry.
 *
 *   node dump-world.mjs <carpeta_mundo> [carpeta_destino]
 *
 * Destino por defecto: <carpeta_mundo>/dump
 *
 * Para qué: la copia de seguridad del mundo versiona `data/`, que es LevelDB
 * binario. Un `git diff` sobre eso no dice nada. Con el volcado al lado, el
 * diff señala QUÉ documento cambió y puedes rescatar uno suelto a mano en vez
 * de restaurar la colección entera.
 *
 * EL MUNDO DEBE ESTAR CERRADO (basta "Return to Setup"). Con Foundry abierto
 * la base de datos está bloqueada y el volcado falla sin tocar nada.
 *
 * Coste medido sobre una campaña real (14.465 documentos): 0,5 s, 31 MB de
 * JSON que git guarda en ~2 MB comprimidos.
 */
import { ClassicLevel } from 'classic-level';
import fs from 'node:fs';
import path from 'node:path';

// Fuera del volcado:
//  - fog y messages son efímeras (cambian solas cada sesión y llenarían el diff
//    de ruido); no son contenido que se pueda perder al editar.
//  - users guarda hashes de contraseña y su sal. El LevelDB binario del repo ya
//    los respalda, así que la restauración no pierde nada; lo que se evita es
//    dejarlos en texto legible por si el repo acaba en un remoto.
const SKIP = new Set(['fog', 'messages', 'users']);

const worldDir = process.argv[2];
const outDir = process.argv[3] ?? (worldDir ? path.join(worldDir, 'dump') : null);

if (!worldDir) {
  console.error('Uso: node dump-world.mjs <carpeta_mundo> [carpeta_destino]');
  process.exit(1);
}

const dataDir = path.join(worldDir, 'data');
if (!fs.existsSync(dataDir)) {
  console.error(`No existe ${dataDir} — ¿es la carpeta de un mundo v11+?`);
  process.exit(1);
}

const collections = fs
  .readdirSync(dataDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(name => !SKIP.has(name));

fs.mkdirSync(outDir, { recursive: true });

const t0 = Date.now();
let totalDocs = 0;
let failures = 0;

for (const name of collections) {
  const db = new ClassicLevel(path.join(dataDir, name), {
    keyEncoding: 'utf8',
    valueEncoding: 'json',
  });
  try {
    await db.open();
    const docs = [];
    for await (const [key, value] of db.iterator()) docs.push({ _key: key, ...value });
    // Orden estable por clave: sin esto el diff entre dos volcados sería ruido.
    docs.sort((a, b) => String(a._key).localeCompare(String(b._key)));
    const json = JSON.stringify(docs, null, 1);
    fs.writeFileSync(path.join(outDir, `${name}.json`), json, 'utf8');
    totalDocs += docs.length;
    console.log(`${name.padEnd(12)} ${String(docs.length).padStart(6)} docs`);
  } catch (e) {
    failures++;
    const msg = e.message.split('\n')[0];
    const locked = String(e.code).includes('LOCK') || msg.includes('not open');
    console.error(
      `${name.padEnd(12)} ERROR: ${msg}${locked ? '  <- ¿está el mundo abierto en Foundry?' : ''}`
    );
  } finally {
    await db.close().catch(() => {});
  }
}

console.log(`\n${totalDocs} documentos en ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outDir}`);
if (SKIP.size) console.log(`(omitidas por efímeras: ${[...SKIP].join(', ')})`);
if (failures) {
  console.error(`\n${failures} colecciones fallaron: el volcado está incompleto.`);
  process.exit(2);
}
