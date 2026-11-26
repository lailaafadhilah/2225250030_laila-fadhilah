# Backend AI Tutor ProfitQuest

Vercel Functions + Google Gemini API (`@google/genai` 3.6.1, Node.js 22+).
Panduan lengkap (lokal, deploy Vercel, keamanan, pesan galat): [../docs/ai-tutor.md](../docs/ai-tutor.md).

```bash
npm install
copy .env.example .env     # isi GEMINI_API_KEY (JANGAN di-commit)
npm run dev                # http://localhost:3000/api/tutor
npm test
```

Di Vercel: **Root Directory = `backend`**, lalu isi environment variable `GEMINI_API_KEY`.
