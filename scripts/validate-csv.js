// scripts/validate-csv.js
//
// Basic validation for data/glossary.csv
// - Checks header structure
// - Validates IDs, enums, dates
// - Ensures required ES fields are present
// - Warns about missing EN fields on active terms

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_PATH = path.join(__dirname, '..', 'data', 'glossary.csv');

const EXPECTED_HEADERS = [
  'id',
  'section',
  'tags',
  'level',
  'status',
  'version',
  'created_at',
  'updated_at',
  'term_es',
  'short_es',
  'long_es',
  'example_es',
  'term_en',
  'short_en',
  'long_en',
  'example_en',
];

const ALLOWED_SECTIONS = new Set([
  'fundamentos',
  'modelos_arquitecturas',
  'tecnicas_procesos',
  'aplicaciones_herramientas',
  'etica_regulacion',
]);

// Validation constants
const MIN_DEFINITION_LENGTH = 10;
const MAX_DEFINITION_LENGTH = 1000;
const MAX_TERM_LENGTH = 100;
const MAX_SHORT_LENGTH = 250;

const ALLOWED_LEVELS = new Set(['basico', 'intermedio', 'avanzado']);
const ALLOWED_STATUS = new Set(['activo', 'revisar', 'obsoleto']);

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

  validateHeaders(raw);
  validateRows(records);

  console.log('✅ CSV validation passed.');
}

function validateHeaders(raw) {
  const firstLine = raw.split(/\r?\n/)[0];
  const parsed = parse(firstLine, { columns: false })[0];

  const headers = parsed.map((h) => h.trim());

  const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
  const extra = headers.filter((h) => !EXPECTED_HEADERS.includes(h));

  if (missing.length > 0 || extra.length > 0) {
    console.error('❌ CSV headers mismatch.');
    if (missing.length > 0) {
      console.error('  Missing headers:', missing.join(', '));
    }
    if (extra.length > 0) {
      console.error('  Unexpected headers:', extra.join(', '));
    }
    process.exit(1);
  }
}

function validateRows(records) {
  const errors = [];
  const warnings = [];
  const ids = new Set();

  records.forEach((row, index) => {
    const rowNum = index + 2; // +1 for header, +1 for 1-based

    // id
    if (!row.id) {
      errors.push(`Row ${rowNum}: id is empty.`);
    } else {
      if (!/^[a-z0-9_]+$/.test(row.id)) {
        errors.push(
            `Row ${rowNum}: id "${row.id}" is invalid. Use lowercase, digits, and underscores only.`
        );
      }
      if (ids.has(row.id)) {
        errors.push(`Row ${rowNum}: duplicate id "${row.id}".`);
      }
      ids.add(row.id);
    }

    // section
    if (!ALLOWED_SECTIONS.has(row.section)) {
      errors.push(
          `Row ${rowNum} (id=${row.id}): section "${row.section}" is not allowed.`
      );
    }

    // level
    if (!ALLOWED_LEVELS.has(row.level)) {
      errors.push(
          `Row ${rowNum} (id=${row.id}): level "${row.level}" is not one of ${Array.from(
              ALLOWED_LEVELS
          ).join(', ')}.`
      );
    }

    // status
    if (!ALLOWED_STATUS.has(row.status)) {
      errors.push(
          `Row ${rowNum} (id=${row.id}): status "${row.status}" is not one of ${Array.from(
              ALLOWED_STATUS
          ).join(', ')}.`
      );
    }

    // dates
    ['created_at', 'updated_at'].forEach((field) => {
      const value = row[field];
      if (!value) {
        errors.push(`Row ${rowNum} (id=${row.id}): ${field} is empty.`);
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        errors.push(
            `Row ${rowNum} (id=${row.id}): ${field} "${value}" is not in YYYY-MM-DD format.`
        );
      }
    });

    // ES fields required and length validation
    ['term_es', 'short_es', 'long_es'].forEach((field) => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(
            `Row ${rowNum} (id=${row.id}): required ES field "${field}" is empty.`
        );
      } else {
        const value = row[field].trim();

        // Term length validation
        if (field === 'term_es' && value.length > MAX_TERM_LENGTH) {
          errors.push(
              `Row ${rowNum} (id=${row.id}): ${field} is too long (${value.length} > ${MAX_TERM_LENGTH}).`
          );
        }

        // Short description length validation
        if (field === 'short_es') {
          if (value.length < MIN_DEFINITION_LENGTH) {
            warnings.push(
                `Row ${rowNum} (id=${row.id}): ${field} is very short (${value.length} < ${MIN_DEFINITION_LENGTH}).`
            );
          }
          if (value.length > MAX_SHORT_LENGTH) {
            errors.push(
                `Row ${rowNum} (id=${row.id}): ${field} is too long (${value.length} > ${MAX_SHORT_LENGTH}).`
            );
          }
        }

        // Long description length validation
        if (field === 'long_es') {
          if (value.length < MIN_DEFINITION_LENGTH) {
            warnings.push(
                `Row ${rowNum} (id=${row.id}): ${field} is very short (${value.length} < ${MIN_DEFINITION_LENGTH}).`
            );
          }
          if (value.length > MAX_DEFINITION_LENGTH) {
            errors.push(
                `Row ${rowNum} (id=${row.id}): ${field} is too long (${value.length} > ${MAX_DEFINITION_LENGTH}).`
            );
          }
        }
      }
    });

    // Tags validation
    if (row.tags) {
      const tags = row.tags.split(';').map(t => t.trim()).filter(Boolean);
      tags.forEach(tag => {
        if (!/^[a-z0-9_-]+$/.test(tag)) {
          warnings.push(
              `Row ${rowNum} (id=${row.id}): tag "${tag}" contains invalid characters. Use lowercase, digits, hyphens and underscores only.`
          );
        }
        if (tag.length > 30) {
          warnings.push(
              `Row ${rowNum} (id=${row.id}): tag "${tag}" is too long (${tag.length} > 30).`
          );
        }
      });

      if (tags.length > 10) {
        warnings.push(
            `Row ${rowNum} (id=${row.id}): too many tags (${tags.length} > 10).`
        );
      }
    }

    // EN fields length validation (if present)
    ['term_en', 'short_en', 'long_en'].forEach((field) => {
      if (row[field] && row[field].trim() !== '') {
        const value = row[field].trim();

        // Term length validation
        if (field === 'term_en' && value.length > MAX_TERM_LENGTH) {
          errors.push(
              `Row ${rowNum} (id=${row.id}): ${field} is too long (${value.length} > ${MAX_TERM_LENGTH}).`
          );
        }

        // Short description length validation
        if (field === 'short_en') {
          if (value.length < MIN_DEFINITION_LENGTH) {
            warnings.push(
                `Row ${rowNum} (id=${row.id}): ${field} is very short (${value.length} < ${MIN_DEFINITION_LENGTH}).`
            );
          }
          if (value.length > MAX_SHORT_LENGTH) {
            errors.push(
                `Row ${rowNum} (id=${row.id}): ${field} is too long (${value.length} > ${MAX_SHORT_LENGTH}).`
            );
          }
        }

        // Long description length validation
        if (field === 'long_en') {
          if (value.length < MIN_DEFINITION_LENGTH) {
            warnings.push(
                `Row ${rowNum} (id=${row.id}): ${field} is very short (${value.length} < ${MIN_DEFINITION_LENGTH}).`
            );
          }
          if (value.length > MAX_DEFINITION_LENGTH) {
            errors.push(
                `Row ${rowNum} (id=${row.id}): ${field} is too long (${value.length} > ${MAX_DEFINITION_LENGTH}).`
            );
          }
        }
      }
    });

    // Warn if active but missing EN fields
    if (row.status === 'activo') {
      const missingEn =
          !row.term_en || !row.short_en || !row.long_en || !row.example_en;
      if (missingEn) {
        warnings.push(
            `Row ${rowNum} (id=${row.id}): status=activo but some EN fields are empty.`
        );
      }
    }
  });

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    warnings.forEach((w) => console.warn('  -', w));
  }

  if (errors.length > 0) {
    console.error('❌ Errors:');
    errors.forEach((e) => console.error('  -', e));
    process.exit(1);
  }
}

main();
