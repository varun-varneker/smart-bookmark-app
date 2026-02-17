"use client"

import { supabase } from "@/lib/supabaseClient"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-zinc-950 dark:to-slate-950 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl" />

      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl shadow-xl p-12 w-[420px] text-center relative z-10 transition-all hover:shadow-2xl hover:scale-[1.01] duration-500">

        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 tracking-tight">
          Smart Bookmark
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
          Your personal space to curate and organize the web.
        </p>

        <button
          onClick={signIn}
          className="w-full group relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-medium py-3.5 px-6 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mt-8 text-xs text-slate-400 dark:text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>

      </div>
    </div>
  )
}
