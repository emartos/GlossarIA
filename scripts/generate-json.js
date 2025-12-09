// scripts/generate-json.js
//
// Generates JSON files from data/glossary.csv for the web frontend.
// Output:
//   web/public/data/glossary.es.json
//   web/public/data/glossary.en.json
//
// Requirements:
//   npm install csv-parse csv-stringify (parse only actually needed here)

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_PATH = path.join(__dirname, '..', 'data', 'glossary.csv');
const OUTPUT_DIR = path.join(__dirname, '..', 'web', 'public', 'data');

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const esEntries = [];
  const enEntries = [];

  for (const row of records) {
    const base = {
      id: row.id,
      section: row.section,
      tags: row.tags ? row.tags.split(';').map((t) => t.trim()).filter(Boolean) : [],
      level: row.level,
      status: row.status,
      version: Number(row.version || 1),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    // ES entry
    esEntries.push({
      ...base,
      language: 'es',
      term: row.term_es,
      short: row.short_es,
      long: row.long_es,
      example: row.example_es,
    });

    // EN entry (only if at least term_en is present)
    if (row.term_en && row.term_en.trim() !== '') {
      enEntries.push({
        ...base,
        language: 'en',
        term: row.term_en,
        short: row.short_en,
        long: row.long_en,
        example: row.example_en,
      });
    }
  }

  const esPath = path.join(OUTPUT_DIR, 'glossary.es.json');
  const enPath = path.join(OUTPUT_DIR, 'glossary.en.json');

  fs.writeFileSync(esPath, JSON.stringify(esEntries, null, 2), 'utf8');
  fs.writeFileSync(enPath, JSON.stringify(enEntries, null, 2), 'utf8');

  console.log(`✅ Generated: ${esPath}`);
  console.log(`✅ Generated: ${enPath}`);
}

main();
