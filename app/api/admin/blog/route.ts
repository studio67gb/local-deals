import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const denied = await requireAdmin(req as any);
    if (denied) return denied;

    const { title, slug, content, excerpt, imageUrl, author, businessIds, dealIds } = await req.json();

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        imageUrl,
        author: author || "Local Deals UK",
        published: true,
        businesses: businessIds?.length ? { connect: businessIds.map((id: string) => ({ id: parseInt(id) })) } : undefined,
        deals: dealIds?.length ? { connect: dealIds.map((id: string) => ({ id: parseInt(id) })) } : undefined,
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const denied = await requireAdmin(req as any);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.blogPost.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
