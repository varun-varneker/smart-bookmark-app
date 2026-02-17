"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

export interface Bookmark {
    id: string
    title: string
    url: string
    description?: string
    image?: string
    created_at: string
    open_count?: number
    last_opened_at?: string
}

type BroadcastPayload =
    | { type: "added"; item: Bookmark }
    | { type: "updated"; item: Bookmark }
    | { type: "deleted"; id: string }
    | { type: "tracked"; id: string; open_count: number; last_opened_at: string }
    | { type: "refetch" }

export function useBookmarks() {
    const [user, setUser] = useState<User | null>(null)
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const CHANNEL_NAME = "smart-bookmarks-channel"

    const isValidUrl = (value: string) => {
        try {
            new URL(value)
            return true
        } catch {
            return false
        }
    }

    const extractDomain = (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return ""
        }
    }

    // ---------------------------------------
    // Broadcast helper
    // ---------------------------------------
    const broadcastLocal = (payload: BroadcastPayload) => {
        if (typeof window === "undefined") return

        if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel(CHANNEL_NAME)
            bc.postMessage(payload)
            bc.close()
            return
        }

        try {
            localStorage.setItem(
                CHANNEL_NAME,
                JSON.stringify({ v: Date.now(), payload })
            )
            localStorage.removeItem(CHANNEL_NAME)
        } catch { }
    }

    // ---------------------------------------
    // Initial Load + Realtime + Tab Sync
    // ---------------------------------------
    useEffect(() => {
        let realtimeChannel: any
        let broadcastChannel: BroadcastChannel | null = null

        const handleIncoming = (payload: BroadcastPayload) => {
            switch (payload.type) {
                case "added":
                    setBookmarks((prev) => {
                        if (prev.some((b) => b.id === payload.item.id)) return prev
                        return [payload.item, ...prev]
                    })
                    break
                case "updated":
                    setBookmarks((prev) =>
                        prev.map((b) => (b.id === payload.item.id ? payload.item : b))
                    )
                    break
                case "deleted":
                    setBookmarks((prev) => prev.filter((b) => b.id !== payload.id))
                    break
                case "tracked":
                    setBookmarks((prev) =>
                        prev.map((b) =>
                            b.id === payload.id
                                ? { ...b, open_count: payload.open_count, last_opened_at: payload.last_opened_at }
                                : b
                        )
                    )
                    break
                case "refetch":
                    if (user) fetchBookmarks(user.id)
                    break
            }
        }

        const load = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setLoading(false)
                return
            }

            setUser(session.user)
            await fetchBookmarks(session.user.id)

            // Supabase realtime
            realtimeChannel = supabase
                .channel("bookmarks-changes")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "bookmarks",
                        filter: `user_id=eq.${session.user.id}`,
                    },
                    () => {
                        fetchBookmarks(session.user.id)
                    }
                )
                .subscribe()

            // BroadcastChannel
            if (typeof BroadcastChannel !== "undefined") {
                broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
                broadcastChannel.onmessage = (e) => {
                    const payload = e.data as BroadcastPayload
                    if (payload) handleIncoming(payload)
                }
            } else {
                // localStorage fallback
                window.addEventListener("storage", (e) => {
                    if (e.key !== CHANNEL_NAME || !e.newValue) return
                    try {
                        const parsed = JSON.parse(e.newValue)
                        handleIncoming(parsed.payload)
                    } catch { }
                })
            }

            setLoading(false)
        }

        load()

        return () => {
            if (realtimeChannel) supabase.removeChannel(realtimeChannel)
            if (broadcastChannel) broadcastChannel.close()
        }
    }, [])

    // ---------------------------------------
    // FETCH
    // ---------------------------------------
    const fetchBookmarks = async (userId: string) => {
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (data) setBookmarks(data)
    }

    // ---------------------------------------
    // ADD (WITH METADATA)
    // ---------------------------------------
    const addBookmark = async (title: string, url: string) => {
        if (!title.trim() || !url.trim()) {
            setError("Title and URL are required.")
            return
        }

        if (!isValidUrl(url)) {
            setError("Enter valid URL (https://...)")
            return
        }

        if (!user) return

        setIsSubmitting(true)
        setError(null)

        let finalTitle = title
        let description = ""
        let image = ""

        // 🔥 Fetch metadata
        try {
            const metaRes = await fetch(
                `/api/metadata?url=${encodeURIComponent(url)}`
            )

            if (metaRes.ok) {
                const meta = await metaRes.json()
                finalTitle = meta.title || title
                description = meta.description || ""
                image = meta.image || ""
            }
        } catch {
            // Metadata failure is non-critical
        }

        const { data, error } = await supabase
            .from("bookmarks")
            .insert({
                title: finalTitle,
                url,
                description,
                image,
                user_id: user.id,
            })
            .select()

        if (error) {
            setError("Failed to add bookmark.")
            setIsSubmitting(false)
            return
        }

        if (data && data.length > 0) {
            setBookmarks((prev) => [...data, ...prev])
            broadcastLocal({ type: "added", item: data[0] })
        }

        setIsSubmitting(false)
    }

    // ---------------------------------------
    // DELETE
    // ---------------------------------------
    const deleteBookmark = async (id: string) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))

        const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("id", id)

        if (error) {
            setError("Failed to delete bookmark.")
            broadcastLocal({ type: "refetch" })
            return
        }

        broadcastLocal({ type: "deleted", id })
    }

    // ---------------------------------------
    // UPDATE
    // ---------------------------------------
    const updateBookmark = async (id: string, title: string, url: string) => {
        if (!title.trim() || !url.trim()) {
            setError("Title and URL are required.")
            return
        }

        if (!isValidUrl(url)) {
            setError("Invalid URL")
            return
        }

        if (!user) return

        setError(null)

        const { data, error } = await supabase
            .from("bookmarks")
            .update({ title, url })
            .eq("id", id)
            .select()

        if (error) {
            setError("Failed to update bookmark.")
            broadcastLocal({ type: "refetch" })
            return
        }

        if (data && data.length > 0) {
            setBookmarks((prev) =>
                prev.map((b) => (b.id === id ? data[0] : b))
            )
            broadcastLocal({ type: "updated", item: data[0] })
        }
    }

    // ---------------------------------------
    // TRACK OPEN (ANALYTICS)
    // ---------------------------------------
    const trackOpen = async (id: string) => {
        const now = new Date().toISOString()

        // Optimistic UI update
        setBookmarks((prev) =>
            prev.map((b) =>
                b.id === id
                    ? { ...b, open_count: (b.open_count || 0) + 1, last_opened_at: now }
                    : b
            )
        )

        // Broadcast to other tabs immediately
        const currentBookmark = bookmarks.find(b => b.id === id)
        const newCount = (currentBookmark?.open_count || 0) + 1
        broadcastLocal({
            type: "tracked",
            id,
            open_count: newCount,
            last_opened_at: now
        })

        try {
            // Try standard update to avoid RPC complexity on user side for now
            // This is slightly racey but acceptable for simple hit counters
            const { error } = await supabase.rpc('increment_open_count', { row_id: id, opened_at: now })

            if (error) {
                // If RPC fails (e.g. not created), fallback to simple update
                // Fetch current first to be somewhat accurate
                const { data: current } = await supabase
                    .from('bookmarks')
                    .select('open_count')
                    .eq('id', id)
                    .single()

                await supabase
                    .from('bookmarks')
                    .update({
                        open_count: (current?.open_count || 0) + 1,
                        last_opened_at: now
                    })
                    .eq('id', id)
            }
        } catch (e) {
            console.error("Failed to track open", e)
        }
    }

    return {
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
        extractDomain,
    }
}
