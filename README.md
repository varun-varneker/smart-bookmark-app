# 🚀 Smart Bookmark

Smart Bookmark is a real-time bookmark management application built with **Next.js (App Router)** and **Supabase**.

The goal of this project was not just to build CRUD functionality, but to implement secure authentication, real-time synchronization, metadata extraction, and multi-tab consistency in a production-ready architecture.

---

## 🧩 Problems Faced & How They Were Solved

### 🔐 1. OAuth Misconfiguration & Redirect Errors

While integrating Google OAuth with Supabase, I encountered issues such as:

- `redirect_uri_mismatch`
- `invalid_client`
- Incorrect callback handling during deployment

**Root Cause:**  
Misalignment between Supabase project settings and Google Cloud Console OAuth configuration.

**Solution:**  
- Synchronized redirect URLs exactly between Supabase and Google Cloud.
- Implemented a proper `/auth/callback` route handler.
- Verified environment variables across local and Vercel deployments.
- Ensured correct project reference IDs in Supabase.

---

### ⚡ 2. Real-Time Multi-Tab Synchronization

A core requirement was instant synchronization between multiple open browser tabs without refresh.

**Initial Problems:**
- Changes appearing only after manual refresh
- Duplicate state updates
- Inconsistent UI behavior

**Solution:**  
- Implemented Supabase Realtime (`postgres_changes`) for cross-device updates.
- Added `BroadcastChannel` API for instant browser-level communication.
- Included localStorage fallback for compatibility.
- Designed event-based state handling to avoid duplication and race conditions.

This resulted in seamless two-way real-time updates across tabs and devices.

---

### 🌐 3. CORS Issues During Metadata Fetching

Fetching website metadata directly from the frontend caused CORS failures.

**Root Cause:**  
Browsers block cross-origin HTML scraping.

**Solution:**  
- Created a server-side API route in Next.js.
- Used Cheerio to safely parse HTML on the server.
- Extracted Open Graph metadata (title, description, image).
- Implemented fallback logic for missing metadata.

This enabled rich preview cards without violating browser security constraints.

---

### 🧠 4. Optimistic UI & State Consistency

With optimistic updates and realtime updates occurring simultaneously, race conditions became possible.

**Solution:**  
- Centralized data logic inside a custom `useBookmarks` hook.
- Ensured immutable state updates.
- Added fallback refetch mechanisms for edge cases.
- Carefully structured async flows to prevent stale closures.

---

### 🛡 5. Row Level Security (RLS)

Ensuring users could only access their own bookmarks required correctly configured database policies.

**Solution:**  
- Implemented Supabase RLS policies using `auth.uid() = user_id`.
- Debugged silent update failures caused by misconfigured policies.
- Verified strict isolation between user accounts.

---

## ⚙️ Architecture Overview

- **Next.js (App Router)** for frontend and API routes
- **Supabase** for Authentication, Postgres database, and Realtime
- Hybrid real-time model:
  - Supabase Realtime (cross-device updates)
  - BroadcastChannel (instant multi-tab sync)
- Server-side metadata extraction to bypass CORS

---

## 🛠 Tech Stack

- Next.js  
- Supabase  
- TailwindCSS  
- Cheerio  
- BroadcastChannel API  

---

## 🎯 Outcome

This project demonstrates:

- Real-time distributed state synchronization
- Secure OAuth integration
- Server-side metadata processing
- Clean separation of UI and state management
- Production-focused debugging and architecture decisions
