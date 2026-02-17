"use client"

import { useState, useMemo } from "react"
import Fuse from "fuse.js"
import { useBookmarks } from "@/lib/useBookmarks"
import { supabase } from "@/lib/supabaseClient"
import { ModeToggle } from "@/components/mode-toggle"

export default function Dashboard() {

  function timeAgo(dateString?: string) {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y ago"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo ago"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d ago"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h ago"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m ago"
    return "just now"
  }

  const {
    user,
    bookmarks,
    loading,
    isSubmitting,
    error,
    setError,
    addBookmark,
    deleteBookmark,
    updateBookmark,
    trackOpen,
    extractDomain
  } = useBookmarks()

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const startEditing = (bookmark: any) => {
    setEditingId(bookmark.id)
    setEditTitle(bookmark.title)
    setEditUrl(bookmark.url)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
    setEditUrl("")
  }

  const saveEditing = async (id: string) => {
    await updateBookmark(id, editTitle, editUrl)

    // If no error, exit editing mode
    if (!error) {
      setEditingId(null)
    }
  }


  const fuse = useMemo(() => {
    return new Fuse(bookmarks, {
      keys: ["title", "description", "url"],
      threshold: 0.3,
    })
  }, [bookmarks])

  const filteredBookmarks = useMemo(() => {
    if (!search) return bookmarks
    return fuse.search(search).map((result) => result.item)
  }, [search, bookmarks, fuse])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">

      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Smart Bookmark
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-slate-500 dark:text-slate-400 text-sm hidden sm:block font-medium">
                {user?.email}
              </span>
              <ModeToggle />
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-600 transition-colors text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* SEARCH & ADD SECTION */}
        <div className="max-w-3xl mx-auto mb-16 space-y-8">

          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search your library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>

          {/* Add Form */}
          <div className="bg-white dark:bg-zinc-900 p-2 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 transition-colors duration-300">
            <div className="flex-1 flex flex-col sm:flex-row gap-2 p-2">
              <input
                type="text"
                placeholder="Bookmark Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError(null)
                }}
                className="flex-1 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700/50 focus:bg-white dark:focus:bg-zinc-950 border-0 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium placeholder:font-normal dark:text-slate-200"
              />
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                className="flex-1 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700/50 focus:bg-white dark:focus:bg-zinc-950 border-0 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-600 dark:text-slate-400 font-mono text-sm placeholder:font-sans placeholder:text-base"
              />
            </div>
            <button
              onClick={() => {
                addBookmark(title, url)
                setTitle("")
                setUrl("")
              }}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-2xl font-semibold text-white shadow-md transition-all whitespace-nowrap ${isSubmitting
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                }`}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
          {error && <p className="text-center text-red-500 text-sm font-medium animate-pulse">{error}</p>}
        </div>

        {/* BOOKMARK GRID */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-lg font-medium">No bookmarks found</p>
            <p className="text-slate-400">Try adding one or searching for something else</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((b) => (
              <div
                key={b.id}
                className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain_url=${extractDomain(b.url)}`}
                      alt="fav"
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.5"
                      }}
                    />
                  </div>

                  {/* Analytics Badge */}
                  {(b.open_count || 0) > 0 && (
                    <div className="ml-auto mr-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-indigo-100 dark:border-indigo-800 self-center">
                      {b.open_count} {b.open_count === 1 ? 'Visit' : 'Visits'}
                    </div>
                  )}

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(b)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteBookmark(b.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingId === b.id ? (
                  <div className="flex flex-col gap-3 flex-1">
                    <input
                      className="border border-indigo-200 p-2 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <input
                      className="border border-indigo-200 p-2 rounded-lg text-xs text-slate-500 font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={cancelEditing}
                        className="text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEditing(b.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                      >
                        Save
                      </button>

                    </div>
                  </div>
                ) : (
                  <div
                    className="flex-1 flex flex-col cursor-pointer"
                    onClick={() => {
                      trackOpen(b.id)
                      window.open(b.url, "_blank")
                    }}
                  >
                    {/* Preview Image */}
                    {b.image ? (
                      <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                        <img
                          src={b.image}
                          alt="preview"
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : null}

                    {/* Title */}
                    <h3
                      className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                      title={b.title}
                    >
                      {b.title}
                    </h3>

                    {/* Description */}
                    {b.description ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {b.description}
                      </p>
                    ) : null}

                    {/* URL + Domain */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400">
                      <span className="font-mono truncate max-w-[50%] flex flex-col">
                        <span>{extractDomain(b.url)}</span>
                        {b.last_opened_at && (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-sans">
                            Opened {timeAgo(b.last_opened_at)}
                          </span>
                        )}
                      </span>

                      <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-indigo-500 font-medium">
                        Visit
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div >
        )}

      </main >
    </div >
  )
}
