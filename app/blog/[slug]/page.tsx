import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} — Local Deals UK`,
    description: post.excerpt || `Read ${post.title} on Local Deals UK.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.imageUrl ? [post.imageUrl] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ 
    where: { slug },
    include: {
      business: true,
      deal: true
    }
  });

  if (!post || !post.published) {
    notFound();
  }

  // Schema.org JSON-LD for the Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.imageUrl ? [post.imageUrl] : [],
    "datePublished": post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Local Deals UK",
      "logo": {
        "@type": "ImageObject",
        "url": "https://local-deals.uk/icon.png"
      }
    },
    "articleBody": post.content.replace(/<[^>]*>?/gm, ''), // Stripped HTML for pure text schema
    ...(post.business && {
      "about": {
        "@type": "LocalBusiness",
        "name": post.business.name,
        "image": post.business.logo,
        "address": post.business.address
      }
    })
  };

  return (
    <article style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <header style={{ marginBottom: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>{post.title}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 14, color: "var(--text-dim)" }}>
          <span>✍️ {post.author}</span>
          <span>•</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      {post.imageUrl && (
        <div style={{ width: "100%", height: "auto", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* 
        We use dangerouslySetInnerHTML here so that the LLM or Admin 
        can supply rich HTML (like <h2>, <p>, <ul>) directly for SEO.
      */}
      <div 
        className="blog-content"
        style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text)" }}
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      {/* Highlighted Tagged Business/Deal */}
      {(post.business || post.deal) && (
        <div style={{ marginTop: 48, padding: 32, borderRadius: 16, background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(244,63,94,0.1))", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#0D9488", marginBottom: 12, letterSpacing: 1 }}>Featured Local Business</div>
          {post.deal ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800 }}>{post.deal.title}</h3>
              <p style={{ color: "var(--text-dim)" }}>Available at <strong>{post.business?.name}</strong></p>
              <a href={`/deal/${post.deal.id}`} className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 8 }}>View Deal & Claim</a>
            </div>
          ) : post.business && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800 }}>{post.business.name}</h3>
              <p style={{ color: "var(--text-dim)" }}>{post.business.description}</p>
              <a href={`/deal?business=${post.business.id}`} className="btn btn-orange" style={{ alignSelf: "flex-start", marginTop: 8 }}>View Business Profile</a>
            </div>
          )}
        </div>
      )}

      {/* Basic styling for the injected HTML content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h2 { font-size: 24px; font-weight: 800; margin-top: 32px; margin-bottom: 16px; color: #fff; }
        .blog-content h3 { font-size: 20px; font-weight: 700; margin-top: 24px; margin-bottom: 12px; color: #fff; }
        .blog-content p { margin-bottom: 24px; color: #d1d5db; }
        .blog-content ul { margin-bottom: 24px; padding-left: 24px; color: #d1d5db; }
        .blog-content li { margin-bottom: 8px; }
        .blog-content a { color: #0D9488; text-decoration: underline; }
        .blog-content strong { color: #fff; font-weight: 700; }
        .blog-content pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 24px; }
      `}} />
    </article>
  );
}
