Here’s a detailed `README.md` file for your **Crown App** – optimized for a full-stack Vite.js + Supabase educational web platform that's fully responsive on mobile and desktop.

---

````md
# 🎓 Crown App – Smart Study Meets Data Labeling

**Crown App** is a fully responsive progressive web application built for university students to study smarter and earn rewards by passively labeling AI training data. It combines the power of community-contributed study resources, AI-generated quizzes and flashcards, and intelligent scheduling — with a seamless integration of Visual Question Answering (VQA) tasks to support the development of real-world AI systems.

---

## ✨ Features

### 🔐 1. User Onboarding & Profile Metadata
- Secure authentication using Supabase Auth.
- Onboarding form captures academic info: institution, department, level (100L–600L), and non-academic interests.
- User profile metadata tailors quizzes, flashcards, and VQA difficulty.

### 📄 2. Past Questions & Notes Upload
- Users upload PDFs, images, or text-based course materials.
- Uploads categorized by department and level.
- Public/private toggle for notes. Others can view, engage, and upvote useful content.

### 🧠 3. Smart Quizzes + TII VQA Injection
- AI-generated course quizzes with adaptive difficulty.
- 5:1 ratio: Every 5 academic questions includes 1 non-skippable TII VQA.
- VQAs are matched with user profile data (field/interest/level).
- Progress and scores tracked per user.

### ⚡ 4. Quick-Label Mode
- Dedicated mode to rapidly complete VQAs.
- Ideal for students who want to maximize incentives without studying.
- Includes XP/points system for engagement.

### 📚 5. Flashcards & Key Point Generator
- Users can convert uploaded materials into digestible flashcards.
- Flip-card interface for quick revision.
- Auto-generated summaries using AI models.

### 📅 6. AI-Powered Study Planner
- Customizable study plan generator based on course list, exam dates, strengths/weaknesses.
- Push notifications remind users of study sessions.
- Rescheduling logic for missed sessions.

### 🏆 7. Gamified Engagement System
- Earn points for:
  - Answering questions
  - Uploading helpful notes
  - Completing VQAs
- Leaderboards per department/level.
- Rewards: data vouchers, Starlink access, computing accessories.

---

## 💻 Tech Stack

| Layer            | Tech Used                       |
|------------------|----------------------------------|
| Frontend         | Vite.js, React, TailwindCSS      |
| Auth             | Supabase Auth                    |
| Backend & DB     | Supabase (PostgreSQL, Storage)   |
| AI/ML Services   | OpenAI (or custom quiz/flashcard generator) |
| Notifications    | Firebase Cloud Messaging / OneSignal |
| Hosting          | Vercel / Netlify                 |

---

## 🛠️ Local Development

### Prerequisites
- Node.js ≥ 18
- Supabase CLI or an active Supabase project
- Firebase CLI (for push notifications, if used)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/crown-app.git
cd crown-app
````

### 2. Install dependencies

```bash
npm install
```

### 3. Environment setup

Create a `.env` file and add the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_key (if using FCM)
```

### 4. Run the app

```bash
npm run dev
```

---

## 📦 Deployment

This app is optimized for deployment on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Make sure to add the same environment variables on your dashboard before deploying.

---

## 📱 Responsiveness

* Mobile-first design using TailwindCSS.
* Fully responsive on all screen sizes: smartphones, tablets, and full HD desktop displays.
* Supports PWA installation for a native-like experience.

---

## 🧪 Testing

```bash
npm run test
```

* Add unit tests for component behavior and integration tests for quiz/VQA logic.
* Can be extended with tools like `Jest`, `React Testing Library`, and `Cypress` for E2E.

---

## 🧩 Roadmap

* [x] MVP for University of Abuja
* [ ] Admin Dashboard
* [ ] Faculty-based VQA matching
* [ ] Adaptive AI quiz personalization (per student performance)
* [ ] Community rewards marketplace

---

## 👨‍💻 Contributing

1. Fork the project
2. Create a feature branch: `git checkout -b feature/xyz`
3. Commit your changes: `git commit -m "Added XYZ"`
4. Push to the branch: `git push origin feature/xyz`
5. Create a Pull Request

---

## 📄 License

MIT License

---

## 🙌 Acknowledgments

* Built for the TII CrowdLabel Challenge
* Inspired by learners and hustlers in Nigerian universities
* Thanks to Supabase, OpenAI, Firebase, and the student contributors

```

Would you like a matching UI component library setup (e.g., with NextUI or Radix UI) added to the README?
```
