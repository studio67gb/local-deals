import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/blog/publish
// Protected endpoint for LLM automation to post blogs
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    // Check against environment variable, or use a hardcoded fallback just for development/testing if not set
    const expectedToken = process.env.LLM_API_SECRET || "local-deals-bot-secret-123";

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, content, excerpt, imageUrl, author } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required fields: title, slug, content" }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        imageUrl: imageUrl || null,
        author: author || "Local Deals UK",
        published: true,
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Blog publish error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A blog post with this slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
