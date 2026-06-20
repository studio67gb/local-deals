import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog — Local Deals UK",
  description: "Read the latest news, tips, and highlights from independent businesses in your area.",
};

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <header style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>Local <span className="gradient-text">Insights</span></h1>
        <p style={{ fontSize: 18, color: "var(--text-muted)" }}>News, tips, and stories from independent UK businesses.</p>
      </header>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-dim)" }}>
          No posts published yet. Check back soon!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {posts.map(post => (
            <a key={post.id} href={`/blog/${post.slug}`} className="card" style={{ display: "flex", flexDirection: "column", textDecoration: "none", overflow: "hidden", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              {post.imageUrl ? (
                <div style={{ height: 180, width: "100%", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.imageUrl} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ height: 180, width: "100%", background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(244,63,94,0.1))", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 48 }}>📰</span>
                </div>
              )}
              <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>{post.excerpt || post.content.substring(0, 100) + "..."}</p>
                <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-dim)", display: "flex", justifyContent: "space-between" }}>
                  <span>{post.author}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
