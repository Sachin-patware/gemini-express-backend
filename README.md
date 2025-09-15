# Vertex Gemini Express Backend

## Setup

1. Copy your Google Cloud service account JSON file into the project root (do not commit it).
   - Example name: `service-account.json`
2. Set environment variables. Create a `.env` from `.env.example` and set any values.
   - `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`
   - Optional: `GEMINI_API_KEY` if your setup requires an explicit API key.
3. Install dependencies:

```bash
npm install
```

4. Run:

```bash
npm run dev
# or
npm start
```

## Endpoints

- `POST /api/description` -> body: `{ "product": "Handmade brass bowl", "save": true }`
- `POST /api/translation` -> body: `{ "text": "Hello world", "language": "Hindi", "save": true }`
- `POST /api/storytelling` -> body: `{ "product": "Brass bowl", "culture": "Rajasthan", "save": true }`
- `POST /api/storytelling/tts` -> body: `{ "product": "Brass bowl", "culture": "Rajasthan" }` -> returns `audio/mpeg` stream
- `POST /api/marketing` -> body: `{ "product": "Brass bowl", "platform": "Instagram", "save": true }`

## Notes & Troubleshooting

- The example uses `@google/generative-ai` as in your sample code. If your environment requires a different client or configuration for Vertex AI Gemini, update `lib/geminiClient.js` accordingly.
- Firestore is optional. Enable by setting `USE_FIRESTORE=true` and `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to the service account file. Ensure that the service account has Firestore and Text-to-Speech permissions.
- For Text-to-Speech, ensure the service account has `roles/texttospeech.admin` or a suitable role.
- The `generateContent` calls assume the @google/generative-ai client returns `response.text()`; if the client API shape differs, adapt `routes/*` accordingly.