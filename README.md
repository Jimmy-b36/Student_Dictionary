# Student Dictionary

A privacy-first, teacher-focused vocabulary management app for K-12 classrooms. Built with Vue 3 + Vite + Pinia + PrimeVue + TypeScript and PocketBase.

---

## Features

- **Teacher dashboard:** Manage student word lists and mastery levels
- **Student privacy:** No real student names or PII allowed (TOS enforced)
- **TOS enforcement:** Signup flow requires acceptance of strict privacy-focused Terms of Service
- **Junction table:** Track which students know which words, with metadata (mastery, notes)
- **Role-based access:** Only teachers can create/manage students (admins cannot)
- **Error handling:** Robust feedback for all major flows
- **Test coverage:** Core logic tested (student service, auth)

## Tech Stack

- **Frontend:** Vue 3 + Vite + Pinia + PrimeVue + TypeScript
- **Backend:** PocketBase (embedded, file-based NoSQL)
- **Testing:** Vitest

## Privacy & Terms of Service

- **NO PERSONAL IDENTIFIERS:** Never use real student names, photos, or PII. Use nicknames or codes only.
- **Data minimization:** Only store info needed for vocabulary tracking.
- **TOS acceptance:** All users must accept the Terms of Service before account creation. TOS is enforced in-app and stored in the DB.
- **Violations:** Accounts found storing PII will be suspended or deleted.

## Project Structure

```bash
src/
  components/
  auth/
  teachers/
  layout/
  table/
  composables/
  views/
  router/
  store/
  assets/
  App.vue
main.ts
```

## Getting Started

1. **Clone & install:**

   ```bash
   git clone https://github.com/Jimmy-b36/Student_Dictionary.git
   cd Student_Dictionary
   npm install
   ```

2. **Run PocketBase:**
   - Download from [pocketbase.io](https://pocketbase.io/)
   - Run: `./pocketbase serve`
3. **Run the app:**

   ```bash
   npm run dev
   ```

4. **Visit:** [http://localhost:5173](http://localhost:5173)

## Development

- Use TypeScript for all new code
- Follow Vue 3 style guide
- See `/src/composables/student.service.ts` and `/src/components/auth/TOSDialog.vue` for privacy logic

## License

MIT

---

**Notice:** This app is for educational use only. Do not store real student names or any PII. Violators will be removed.
