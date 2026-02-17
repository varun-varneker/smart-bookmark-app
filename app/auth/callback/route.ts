import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const redirectUrl = new URL("/dashboard", request.url)

    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options) {
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    })
                },
            },
        }
    )

    const code = request.nextUrl.searchParams.get("code")

    if (code) {
        await supabase.auth.exchangeCodeForSession(code)
    }

    return response
}
