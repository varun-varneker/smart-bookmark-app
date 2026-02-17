import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        })

        const html = await res.text()
        const $ = cheerio.load(html)

        const title =
            $("meta[property='og:title']").attr("content") ||
            $("title").text() ||
            ""

        const description =
            $("meta[property='og:description']").attr("content") ||
            $("meta[name='description']").attr("content") ||
            ""

        const image =
            $("meta[property='og:image']").attr("content") || ""

        return NextResponse.json({
            title,
            description,
            image,
        })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch metadata" },
            { status: 500 }
        )
    }
}
