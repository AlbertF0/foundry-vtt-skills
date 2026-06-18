#!/usr/bin/env node
/**
 * foundry-db — aplica un "plan" JSON sobre la BD LevelDB de un mundo de Foundry VTT.
 *
 * Uso:
 *   node foundry-db.js apply <carpeta_mundo> <plan.json> [--dry-run]
 *   node foundry-db.js list  <carpeta_mundo> <coleccion>        (p.ej. actors, scenes, folders)
 *
 * El mundo DEBE estar cerrado (Foundry en otra pantalla o apagado); si la BD
 * está bloqueada, el script falla sin tocar nada. Antes de escribir se hace
 * copia de seguridad de la carpeta data/ en data-backup-<timestamp>/.
 *
 * Formato del plan:
 * {
 *   "folders": [ { "name": "Capítulo 1", "type": "Actor", "parent": "Nombre carpeta padre opcional", "color": "#aa3333" } ],
 *   "scenes":  [ { "name": "Taberna", "img": "worlds/test/campania/mapas/01/mapa.webp",
 *                  "folder": "Capítulo 1", "gridSize": 100, "gridType": 1, "padding": 0.1 } ],
 *   "actorUpdates": [ { "match": "Guz", "img": "worlds/.../retrato.png",
 *                       "tokenImg": "worlds/.../token.png", "folder": "Capítulo 2" } ]
 * }
 * - Las rutas de imagen son relativas a Data/ de Foundry (como las usa Foundry).
 * - El ancho/alto de la escena se calcula del tamaño real de la imagen.
 * - "match" busca actores por nombre exacto (insensible a mayúsculas).
 */
import { ClassicLevel } from 'classic-level';
import { imageSize } from 'image-size';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const cmd = args[0];
const worldDir = args[1];
const dryRun = args.includes('--dry-run');

if (!cmd || !worldDir) {
  console.error('Uso: foundry-db apply <carpeta_mundo> <plan.json> [--dry-run] | foundry-db list <carpeta_mundo> <coleccion>');
  process.exit(1);
}

const dataDir = path.join(worldDir, 'data');
if (!fs.existsSync(dataDir)) {
  console.error(`No existe ${dataDir} — ¿es la carpeta de un mundo v11+?`);
  process.exit(1);
}
// Data/ de Foundry = dos niveles por encima de worlds/<mundo>
const foundryDataRoot = path.resolve(worldDir, '..', '..');

const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const newId = () => Array.from({ length: 16 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join('');

async function openDb() {
  const db = new ClassicLevel(dataDir, { keyEncoding: 'utf8', valueEncoding: 'json' });
  try {
    await db.open();
  } catch (e) {
    console.error('No se pudo abrir la BD. ¿Está el mundo abierto en Foundry? Ciérralo (basta "Return to Setup") y reintenta.');
    console.error(String(e));
    process.exit(2);
  }
  return db;
}

async function readCollection(db, coll) {
  const out = [];
  const prefix = `!${coll}!`;
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith(prefix) && !key.slice(prefix.length).includes('.')) out.push({ key, value });
  }
  return out;
}

function backup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(worldDir, `data-backup-${stamp}`);
  fs.cpSync(dataDir, dest, { recursive: true });
  console.log(`Backup: ${dest}`);
}

function sceneDoc(plan, folderId, dims) {
  return {
    _id: newId(),
    name: plan.name,
    active: false,
    navigation: true,
    background: { src: plan.img.replace(/\\/g, '/'), anchorX: 0, anchorY: 0, offsetX: 0, offsetY: 0, fit: 'fill', scaleX: 1, scaleY: 1, rotation: 0, tint: '#ffffff', alphaThreshold: 0 },
    width: dims.width,
    height: dims.height,
    padding: plan.padding ?? 0.1,
    grid: { type: plan.gridType ?? 1, size: plan.gridSize ?? 100, style: 'solidLines', thickness: 1, color: '#000000', alpha: 0.2, distance: 5, units: 'ft' },
    initial: { x: null, y: null, scale: null },
    backgroundColor: '#999999',
    tokenVision: plan.tokenVision ?? true,
    fog: { exploration: true, reset: 0, overlay: null, colors: { explored: null, unexplored: null } },
    environment: {
      darknessLevel: plan.darkness ?? 0, darknessLock: false,
      globalLight: { enabled: plan.globalLight ?? true, alpha: 0.5, bright: false, color: null, coloration: 1, luminosity: 0, saturation: 0, contrast: 0, shadows: 0, darkness: { min: 0, max: 0 } },
      cycle: true, base: { hue: 0, intensity: 0, luminosity: 0, saturation: 0, shadows: 0 }, dark: { hue: 0.7138888888888889, intensity: 0, luminosity: -0.25, saturation: 0, shadows: 0 }
    },
    drawings: [], tokens: [], lights: [], notes: [], sounds: [], regions: [], templates: [], tiles: [], walls: [],
    playlist: null, playlistSound: null, journal: null, journalEntryPage: null, weather: '',
    folder: folderId ?? null, sort: 0, ownership: { default: 0 }, flags: {},
    _stats: { coreVersion: '14.364', systemId: 'dnd5e', createdTime: Date.now(), modifiedTime: Date.now(), lastModifiedBy: null }
  };
}

function folderDoc(plan, parentId) {
  return {
    _id: newId(), name: plan.name, type: plan.type, sorting: 'a', sort: 0,
    color: plan.color ?? null, description: '', folder: parentId ?? null, flags: {},
    _stats: { coreVersion: '14.364', createdTime: Date.now(), modifiedTime: Date.now(), lastModifiedBy: null }
  };
}

function resolveImg(rel) {
  const abs = path.join(foundryDataRoot, rel);
  if (!fs.existsSync(abs)) throw new Error(`Imagen no encontrada: ${abs}`);
  return abs;
}

async function main() {
  if (cmd === 'list') {
    const db = await openDb();
    const docs = await readCollection(db, args[2] ?? 'actors');
    for (const { value } of docs) console.log(`${value._id}\t${value.name}\t(folder: ${value.folder ?? '-'})`);
    await db.close();
    return;
  }

  if (cmd !== 'apply') { console.error(`Comando desconocido: ${cmd}`); process.exit(1); }

  const plan = JSON.parse(fs.readFileSync(args[2], 'utf8'));

  // Validar imágenes antes de tocar nada
  for (const s of plan.scenes ?? []) resolveImg(s.img);
  for (const a of plan.actorUpdates ?? []) { if (a.img) resolveImg(a.img); if (a.tokenImg) resolveImg(a.tokenImg); }

  if (!dryRun) backup();
  const db = await openDb();

  const existingFolders = await readCollection(db, 'folders');
  const folderIdByName = new Map(existingFolders.map(({ value }) => [`${value.type}:${value.name}`, value._id]));
  const ops = [];

  // 1. Carpetas (los padres deben declararse antes que los hijos en el plan)
  for (const f of plan.folders ?? []) {
    const key = `${f.type}:${f.name}`;
    if (folderIdByName.has(key)) { console.log(`Carpeta ya existe: ${f.name} (${f.type})`); continue; }
    const parentId = f.parent ? folderIdByName.get(`${f.type}:${f.parent}`) ?? null : null;
    const doc = folderDoc(f, parentId);
    folderIdByName.set(key, doc._id);
    ops.push({ type: 'put', key: `!folders!${doc._id}`, value: doc });
    console.log(`+ Carpeta ${f.type}: ${f.name}`);
  }

  // 2. Escenas
  const existingScenes = await readCollection(db, 'scenes');
  const sceneNames = new Set(existingScenes.map(({ value }) => value.name));
  for (const s of plan.scenes ?? []) {
    if (sceneNames.has(s.name)) { console.log(`Escena ya existe, omitida: ${s.name}`); continue; }
    const dims = imageSize(fs.readFileSync(resolveImg(s.img)));
    const folderId = s.folder ? folderIdByName.get(`Scene:${s.folder}`) ?? null : null;
    const doc = sceneDoc(s, folderId, dims);
    ops.push({ type: 'put', key: `!scenes!${doc._id}`, value: doc });
    console.log(`+ Escena: ${s.name} (${dims.width}x${dims.height}, grid ${doc.grid.size}px)`);
  }

  // 3. Actores: imagen, token y carpeta
  const actors = await readCollection(db, 'actors');
  for (const u of plan.actorUpdates ?? []) {
    const hit = actors.find(({ value }) => value.name.toLowerCase() === u.match.toLowerCase());
    if (!hit) { console.warn(`! Actor no encontrado: ${u.match}`); continue; }
    const doc = hit.value;
    if (u.img) doc.img = u.img.replace(/\\/g, '/');
    if (u.tokenImg) {
      doc.prototypeToken = doc.prototypeToken ?? {};
      doc.prototypeToken.texture = { ...(doc.prototypeToken.texture ?? {}), src: u.tokenImg.replace(/\\/g, '/') };
    }
    if (u.folder) doc.folder = folderIdByName.get(`Actor:${u.folder}`) ?? doc.folder;
    if (u.name) doc.name = u.name;
    doc._stats = { ...(doc._stats ?? {}), modifiedTime: Date.now() };
    ops.push({ type: 'put', key: hit.key, value: doc });
    console.log(`~ Actor: ${doc.name}${u.folder ? ` → carpeta ${u.folder}` : ''}`);
  }

  if (dryRun) {
    console.log(`\n[dry-run] ${ops.length} operaciones NO aplicadas.`);
  } else {
    await db.batch(ops);
    console.log(`\n${ops.length} operaciones aplicadas.`);
  }
  await db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
