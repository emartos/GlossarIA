# Versioning in GlossarIA

GlossarIA uses **date-based versioning** for global releases and per-term revision numbers for individual entries.

---

## 1. Global glossary version

Format:

YYYY.MM.B

Where:

- YYYY = year  
- MM = month  
- B = build number for that month  

Examples:

2025.11.0 → First release in November 2025  
2025.11.1 → Second release in November 2025  
2025.12.0 → First release in December 2025  

The global version is updated when:

- New terms are added  
- Definitions change meaning  
- Significant translations are updated  
- Sections or tags are restructured  

---

## 2. Per-term version

Each glossary row includes its own `version` field:

version = 1 → first definition  
version = 2 → major update  
version = 3 → meaning changed again  

This allows tracking the evolution of specific concepts.

---

## 3. Release workflow (recommended)

1. Validate CSV  
2. Generate JSON + PDF  
3. Update the global version in website config  
4. Tag release in GitHub (`v2025.11.1`)  
5. Publish PDF + notes summarizing changes  

---

## 4. Backward compatibility

To maintain stability for dependent tools:

- Never silently delete terms  
- Instead, set:

status = obsoleto

…and document the reason in `long_es` and `long_en`.

---

If you have suggestions to improve the versioning strategy, please open an Issue.
