import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID!

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const valid = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 })
    }

    // 1. Query Notion DB to check for duplicates
    const existing = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Email",
        email: { equals: email },
      },
    })

    if (existing.results.length > 0) {
      return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 })
    }

    // 2. Add new entry to Notion
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Email: {
          email: email,
        },
        SubmittedAt: {
          date: { start: new Date().toISOString() },
        },
      },
    })

    console.log("Waitlist signup saved to Notion:", email)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error saving email to Notion:", error)
    return NextResponse.json({ ok: false, error: "Failed to save email" }, { status: 500 })
  }
}