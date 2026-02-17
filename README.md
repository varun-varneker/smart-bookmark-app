# 🚀 Smart Bookmark

Smart Bookmark is a real-time bookmark management web application built with Next.js and Supabase. It enhances traditional bookmarking with metadata extraction, rich preview cards, and instant multi-tab synchronization.

## ✨ Features

- 🔐 **Google OAuth authentication**
- ⚡ **Real-time sync across tabs and devices**
- 🌐 **Server-side metadata scraping** (title, description, preview image)
- 🖼 **Rich preview cards**
- 🔎 **Search functionality**
- 🔄 **Optimistic UI updates**
- 🛡 **Row Level Security (RLS)** for user data protection

## 🛠 Tech Stack

- **Next.js** (App Router)
- **Supabase** (Auth + Postgres + Realtime)
- **TailwindCSS**
- **Cheerio** (metadata parsing)
- **BroadcastChannel API**

## ⚙️ Architecture Highlights

**Hybrid real-time model:**
- Supabase Realtime for cross-device updates
- BroadcastChannel for instant multi-tab sync
- Custom `useBookmarks` hook for clean state management
- Server-side metadata API to bypass CORS limitations

## 🧩 Key Challenges

- 🔐 Configuring Google OAuth correctly (redirect_uri_mismatch, invalid_client errors)
- ⚡ Achieving seamless multi-tab synchronization without refresh
- 🌐 Handling CORS issues during metadata scraping
- 🧠 Managing optimistic UI updates without race conditions
- 🛡 Implementing secure Row Level Security policies in Supabase

---

## 🙏 Thank You

Thank you for checking out Smart Bookmark! This project was built with passion and attention to detail. If you found it useful or interesting, feel free to star the repository and share your feedback. Happy bookmarking! ⭐