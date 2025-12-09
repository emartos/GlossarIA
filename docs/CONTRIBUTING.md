# Contributing to GlossarIA

Thank you for your interest in contributing to **GlossarIA** 💙  
This project aims to be an open, bilingual AI glossary for professionals and companies.

There are several ways you can contribute:

- Propose new terms  
- Improve or correct existing definitions  
- Fix translations (ES/EN)  
- Improve the website, scripts or workflows  

---

## 1. Where to start

1. Check the existing terms in `/data/glossary.csv`
2. Review the existing Issues
3. If your idea is not covered, open:
   - an Issue (for discussion), or  
   - a Pull Request (for direct proposals)

---

## 2. Glossary structure

The glossary is stored in a single CSV file.

Each row = one concept  
Both Spanish and English live in the same entry.

Columns:

```
id  
section  
tags  
level  
status  
version  
created_at  
updated_at  
term_es  
short_es  
long_es  
example_es  
term_en  
short_en  
long_en  
example_en  
```

**Rules**

- `id`: lowercase, no spaces, no accents, words separated with `_`
- `tags`: semicolon-separated (`texto;empresa;generativa`)
- `level`: `basico`, `intermedio`, `avanzado`
- `status`: `activo`, `revisar`, `obsoleto`
- Dates must follow `YYYY-MM-DD`

---

## 3. Adding a new term

1. Add a new row at the bottom of the CSV  
2. Fill in at least the Spanish fields  
3. If you cannot translate into English, leave the EN section empty and mark:

```
status = revisar
```

4. Update timestamps:

- `created_at` = today  
- `updated_at` = today  

5. Run local validation if possible:

```
node scripts/validate-csv.js
```

6. Commit and open a Pull Request.

---

## 4. Editing an existing term

- Update the relevant fields  
- Do NOT change `id` unless necessary  
- Update `updated_at`  
- If meaning changes significantly, update the English version or request review

---

## 5. Pull Request process

1. Fork  
2. Create a branch  
3. Make changes  
4. Run validation script  
5. Commit  
6. Open a PR using the provided template  

The GitHub Action validation must pass before merging.

---

## 6. Style guidelines

Definitions should be:

- Clear  
- Neutral  
- Business-friendly  
- Reusable across industries  

Recommended structure:

Short definition  
Long definition  
Business-oriented example  

---

## 7. Code contributions

For contributions under:

- `/scripts`
- `/web`
- `.github/workflows`

Please ensure:

- Code is simple and well commented  
- PRs are small and well scoped  
- Documentation is updated if needed  

---

## 8. Code of Conduct

Participation implies agreement with the  
`docs/CODE_OF_CONDUCT.md`.

---

## 9. Questions?

Open an Issue or Discussion.

Thank you for helping GlossarIA grow 🙌
