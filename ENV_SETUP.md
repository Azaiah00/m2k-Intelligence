## Gemini API key setup (local + Netlify)

### Local (recommended)

Use Netlify Functions locally so your API key is not exposed in the browser.

1. Create a file named `local.secrets.json` in the project root (same folder as `index.html`)
   - Use `local.secrets.example.json` as your template
2. Put your key in:

```json
{
  "GEMINI_API_KEY": "PASTE_YOUR_KEY_HERE"
}
```

3. Run:

```bash
npm run dev
```

Netlify CLI will read `env.local` automatically when starting `netlify dev` (or you can add it in Netlify UI for production).

### Netlify (production)

1. Netlify dashboard → Site settings → Environment variables
2. Add `GEMINI_API_KEY`
3. Redeploy

### Reference

Gemini image generation model docs: `https://ai.google.dev/gemini-api/docs/nanobanana`


