Classification script
=====================

Purpose
-------
`categorize_products.js` runs two phases:

- Phase 1: quick SQL updates using the `design_style` column to correct `category` values.
- Phase 2: ensures a `classified_tag` text column exists and (optionally) classifies product images by calling a configurable Gemini/vision endpoint. The result is written to `classified_tag`.

Setup
-----
Create a `.env` in project root with DB credentials (used by `src/database/db.js`) and optionally the Gemini endpoint and key:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_pass

# If you have a custom Gemini Vision endpoint that accepts { image_url }
GEMINI_ENDPOINT=https://your-gemini-endpoint.example/v1/classify
GEMINI_API_KEY=xxxx

# If you plan to use Google GenAI client later:
USE_GOOGLE_GENAI=false
```

Usage
-----
Run the script from the project root:

```bash
node scripts/categorize_products.js
```

Notes & Next Steps
------------------
- The script expects your tables to be named `amazon_products`, `flipkart_products`, `samsung_products` and `sony_products`. Edit `TABLES` at the top of the script if different.
- The script uses a simple custom endpoint contract: POST `{ image_url }` with `Authorization: Bearer <GEMINI_API_KEY>` and expects JSON `{ category: '...' }` (or `label`).
- If you'd like, I can implement direct `@google/genai` calls (Gemini Vision) once you provide API details and permission to run network calls.
