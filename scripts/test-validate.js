// scripts/test-validate.js
//
// Basic tests for the CSV validation script
// Run with: node scripts/test-validate.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_CSV_DIR = path.join(__dirname, 'test-data');
const VALIDATE_SCRIPT = path.join(__dirname, 'validate-csv.js');

// Ensure test data directory exists
if (!fs.existsSync(TEST_CSV_DIR)) {
  fs.mkdirSync(TEST_CSV_DIR);
}

function createTestCSV(filename, content) {
  const filePath = path.join(TEST_CSV_DIR, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function runValidation(csvPath) {
  try {
    // Temporarily replace the CSV_PATH in the validation script
    const originalScript = fs.readFileSync(VALIDATE_SCRIPT, 'utf8');
    const testScript = originalScript.replace(
      "const CSV_PATH = path.join(__dirname, '..', 'data', 'glossary.csv');",
      `const CSV_PATH = '${csvPath}';`
    );
    
    const tempScriptPath = path.join(__dirname, 'temp-validate.js');
    fs.writeFileSync(tempScriptPath, testScript, 'utf8');
    
    const result = execSync(`node ${tempScriptPath}`, { encoding: 'utf8' });
    fs.unlinkSync(tempScriptPath);
    return { success: true, output: result };
  } catch (error) {
    fs.unlinkSync(path.join(__dirname, 'temp-validate.js'));
    return { success: false, output: error.stdout || error.message };
  }
}

function test(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    testFn();
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    process.exitCode = 1;
  }
}

// Test cases
console.log('🚀 Running CSV validation tests...\n');

test('Valid CSV should pass validation', () => {
  const validCSV = `id,section,tags,level,status,version,created_at,updated_at,term_es,short_es,long_es,example_es,term_en,short_en,long_en,example_en
test_term,fundamentos,ai;ml,basico,activo,1,2024-01-01,2024-01-01,Término de prueba,Descripción corta de prueba,Esta es una descripción larga de prueba que cumple con los requisitos mínimos de longitud,Ejemplo de uso,Test term,Short test description,This is a long test description that meets the minimum length requirements,Usage example`;
  
  const csvPath = createTestCSV('valid.csv', validCSV);
  const result = runValidation(csvPath);
  
  if (!result.success) {
    throw new Error(`Expected validation to pass, but got: ${result.output}`);
  }
  
  fs.unlinkSync(csvPath);
});

test('Invalid ID should fail validation', () => {
  const invalidCSV = `id,section,tags,level,status,version,created_at,updated_at,term_es,short_es,long_es,example_es,term_en,short_en,long_en,example_en
Invalid-ID,fundamentos,ai,basico,activo,1,2024-01-01,2024-01-01,Término,Descripción corta,Descripción larga que cumple requisitos,Ejemplo,Term,Short description,Long description that meets requirements,Example`;
  
  const csvPath = createTestCSV('invalid-id.csv', invalidCSV);
  const result = runValidation(csvPath);
  
  if (result.success) {
    throw new Error('Expected validation to fail for invalid ID');
  }
  
  if (!result.output.includes('id "Invalid-ID" is invalid')) {
    throw new Error('Expected specific error message for invalid ID');
  }
  
  fs.unlinkSync(csvPath);
});

test('Missing required ES fields should fail validation', () => {
  const missingFieldsCSV = `id,section,tags,level,status,version,created_at,updated_at,term_es,short_es,long_es,example_es,term_en,short_en,long_en,example_en
test_term,fundamentos,ai,basico,activo,1,2024-01-01,2024-01-01,,Descripción corta,Descripción larga,Ejemplo,Term,Short description,Long description,Example`;
  
  const csvPath = createTestCSV('missing-fields.csv', missingFieldsCSV);
  const result = runValidation(csvPath);
  
  if (result.success) {
    throw new Error('Expected validation to fail for missing ES fields');
  }
  
  if (!result.output.includes('term_es') || !result.output.includes('is empty')) {
    throw new Error('Expected specific error message for missing term_es');
  }
  
  fs.unlinkSync(csvPath);
});

test('Invalid section should fail validation', () => {
  const invalidSectionCSV = `id,section,tags,level,status,version,created_at,updated_at,term_es,short_es,long_es,example_es,term_en,short_en,long_en,example_en
test_term,invalid_section,ai,basico,activo,1,2024-01-01,2024-01-01,Término,Descripción corta,Descripción larga que cumple requisitos,Ejemplo,Term,Short description,Long description that meets requirements,Example`;
  
  const csvPath = createTestCSV('invalid-section.csv', invalidSectionCSV);
  const result = runValidation(csvPath);
  
  if (result.success) {
    throw new Error('Expected validation to fail for invalid section');
  }
  
  if (!result.output.includes('section "invalid_section" is not allowed')) {
    throw new Error('Expected specific error message for invalid section');
  }
  
  fs.unlinkSync(csvPath);
});

test('Too long definitions should trigger warnings/errors', () => {
  const longText = 'a'.repeat(1001); // Exceeds MAX_DEFINITION_LENGTH
  const longDefCSV = `id,section,tags,level,status,version,created_at,updated_at,term_es,short_es,long_es,example_es,term_en,short_en,long_en,example_en
test_term,fundamentos,ai,basico,activo,1,2024-01-01,2024-01-01,Término,Descripción corta,${longText},Ejemplo,Term,Short description,Long description,Example`;
  
  const csvPath = createTestCSV('long-def.csv', longDefCSV);
  const result = runValidation(csvPath);
  
  if (result.success) {
    throw new Error('Expected validation to fail for too long definition');
  }
  
  if (!result.output.includes('is too long')) {
    throw new Error('Expected error message for too long definition');
  }
  
  fs.unlinkSync(csvPath);
});

// Clean up test directory
if (fs.existsSync(TEST_CSV_DIR)) {
  fs.rmSync(TEST_CSV_DIR, { recursive: true });
}

console.log('\n🎉 All tests completed!');
if (process.exitCode === 1) {
  console.log('❌ Some tests failed');
} else {
  console.log('✅ All tests passed');
}