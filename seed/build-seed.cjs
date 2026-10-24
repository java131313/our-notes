#!/usr/bin/env node
// 合并 .tmp-idioms/batch-*.json → 校验 → 去重 → 生成 seed SQL（分片）
const fs = require('fs');
const path = require('path');

const TMP = path.join(__dirname, '..', '.tmp-idioms');
const OUT_DIR = path.join(__dirname, '..', 'seed');
const TARGET = 2100;
const TS = '2026-10-23T00:00:00.000Z';

const files = fs.readdirSync(TMP).filter(f => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error('No batch files found');
  process.exit(1);
}

let all = [];
let badFiles = [];
for (const f of files) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(TMP, f), 'utf8'));
    if (!Array.isArray(d)) throw new Error('not an array');
    all = all.concat(d);
  } catch (e) {
    badFiles.push(f + ': ' + e.message);
  }
}

const HANZI = /^[一-鿿]{4}$/;
const seen = new Set();
const out = [];
const invalid = [];
const dupes = [];

for (const e of all) {
  const c = (e.chinese || '').trim();
  const j = (e.japanese || '').trim();
  const em = (e.emoji || '').trim();
  if (!HANZI.test(c) || !HANZI.test(j) || !em) {
    invalid.push(JSON.stringify(e));
    continue;
  }
  if (seen.has(c) || seen.has(j)) {
    dupes.push(c + '/' + j);
    continue;
  }
  seen.add(c);
  seen.add(j);
  out.push({ chinese: c, japanese: j, emoji: em });
}

console.log(`files: ${files.length}, raw: ${all.length}, valid unique: ${out.length}, invalid: ${invalid.length}, dupes: ${dupes.length}`);
if (badFiles.length) console.log('bad files:', badFiles);

// 洗牌后取前 1000
for (let i = out.length - 1; i > 0; i--) {
  const k = Math.floor(Math.random() * (i + 1));
  [out[i], out[k]] = [out[k], out[i]];
}
const selected = out.slice(0, TARGET);
console.log(`selected: ${selected.length} (target ${TARGET})${out.length < TARGET ? ' *** SHORT ***' : ''}`);

if (selected.length < TARGET) {
  fs.writeFileSync(path.join(OUT_DIR, 'shortfall.txt'),
    `need ${TARGET - selected.length} more. EXISTING_CHINESE:\n` +
    selected.map(e => e.chinese).join(',') + '\n\nEXISTING_JAPANESE:\n' + selected.map(e => e.japanese).join(','));
  console.log('Wrote seed/shortfall.txt for top-up generation');
}

const esc = s => s.replace(/'/g, "''");
const stmts = selected.map((e, i) =>
  `INSERT OR IGNORE INTO idioms (id, emoji, chinese, japanese, created_at) VALUES ('idiom-${String(i + 1).padStart(4, '0')}', '${esc(e.emoji)}', '${esc(e.chinese)}', '${esc(e.japanese)}', '${TS}');`
);

fs.mkdirSync(OUT_DIR, { recursive: true });
// 单片完整 SQL（仓库留档）
fs.writeFileSync(path.join(OUT_DIR, 'idioms.sql'), stmts.join('\n') + '\n');
// 分片便于 wrangler 执行
const CHUNK = 500;
for (let i = 0; i * CHUNK < stmts.length; i++) {
  const part = stmts.slice(i * CHUNK, (i + 1) * CHUNK).join('\n') + '\n';
  fs.writeFileSync(path.join(OUT_DIR, `idioms-part-${i + 1}.sql`), part);
}
console.log(`wrote seed/idioms.sql (${stmts.length} statements, ${Math.ceil(stmts.length / CHUNK)} parts)`);

if (invalid.length) {
  fs.writeFileSync(path.join(OUT_DIR, 'invalid.json'), JSON.stringify(invalid, null, 2));
  console.log('invalid samples written to seed/invalid.json');
}
