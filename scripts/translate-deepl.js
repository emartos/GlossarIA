// scripts/translate-deepl.js
//
// Fills missing English fields using DeepL API.
// - Looks for rows where term_en / short_en / long_en / example_en are empty
// - Sends ES text to DeepL and writes EN translations back into data/glossary.csv
//
// Requirements:
//   npm install csv-parse csv-stringify node-fetch
//
// Environment:
//   DEEPL_API_KEY  → your DeepL API key
//   DEEPL_API_URL  → optional, defaults to https://api.deepl.com/v2/translate

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const fetch = require('node-fetch');

const CSV_PATH = path.join(__dirname, '..', 'data', 'glossary.csv');
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL =
    process.env.DEEPL_API_URL || 'https://api.deepl.com/v2/translate';

if (!DEEPL_API_KEY) {
  console.error('❌ Missing DEEPL_API_KEY environment variable.');
  process.exit(1);
}

async function main() {
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

  const headers = Object.keys(records[0] || {});
  const updatedRecords = [];
  let translatedCount = 0;

  for (const row of records) {
    const needsTranslation =
        !row.term_en || !row.short_en || !row.long_en || !row.example_en;

    if (!needsTranslation) {
      updatedRecords.push(row);
      continue;
    }

    console.log(`🔎 Checking row id=${row.id} for missing EN fields...`);

    const newRow = { ...row };

    // Only translate fields that are empty but have ES source
    if (!newRow.term_en && newRow.term_es) {
      newRow.term_en = await translateText(newRow.term_es, 'ES', 'EN');
    }
    if (!newRow.short_en && newRow.short_es) {
      newRow.short_en = await translateText(newRow.short_es, 'ES', 'EN');
    }
    if (!newRow.long_en && newRow.long_es) {
      newRow.long_en = await translateText(newRow.long_es, 'ES', 'EN');
    }
    if (!newRow.example_en && newRow.example_es) {
      newRow.example_en = await translateText(newRow.example_es, 'ES', 'EN');
    }

    translatedCount++;
    updatedRecords.push(newRow);
  }

  if (translatedCount === 0) {
    console.log('✅ No missing EN fields found. Nothing to translate.');
    return;
  }

  const csvOut = stringify(updatedRecords, {
    header: true,
    columns: headers,
  });

  fs.writeFileSync(CSV_PATH, csvOut, 'utf8');
  console.log(`✅ Translation done. Rows updated: ${translatedCount}`);
}

/**
 * Translate text using DeepL.
 * @param {string} text
 * @param {string} sourceLang e.g. 'ES'
 * @param {string} targetLang e.g. 'EN'
 */
async function translateText(text, sourceLang, targetLang) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return '';
  }

  console.log(`  🌐 Translating "${trimmed.slice(0, 60)}..."`);

  const params = new URLSearchParams();
  params.append('auth_key', DEEPL_API_KEY);
  params.append('text', trimmed);
  params.append('source_lang', sourceLang.toUpperCase());
  params.append('target_lang', targetLang.toUpperCase());

  const res = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(
        `❌ DeepL API error (${res.status} ${res.statusText}): ${body}`
    );
    throw new Error('DeepL API error');
  }

  const data = await res.json();
  if (!data.translations || !data.translations[0]) {
    console.error('❌ Unexpected DeepL response:', data);
    throw new Error('DeepL response missing translations');
  }

  const translated = data.translations[0].text || '';
  return translated.trim();
}

main().catch((err) => {
  console.error('❌ translate-deepl.js failed:', err);
  process.exit(1);
});