import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

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
      businesses: true,
      deals: { include: { business: true } } // include business for deals to show where it's at
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
    ...(post.businesses.length > 0 && {
      "about": post.businesses.map(b => ({
        "@type": "LocalBusiness",
        "name": b.name,
        "image": b.logo,
        "address": b.address
      }))
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
        Parse shortcodes like [DEAL:1] or [BUSINESS:1] and inject the cards INLINE.
      */}
      <div className="blog-content" style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text)" }}>
        {post.content.split(/(\[(?:DEAL|BUSINESS):\d+\])/g).map((chunk, i) => {
          const dealMatch = chunk.match(/\[DEAL:(\d+)\]/);
          const bizMatch = chunk.match(/\[BUSINESS:(\d+)\]/);

          if (dealMatch) {
            const dealId = parseInt(dealMatch[1]);
            const deal = post.deals.find(d => d.id === dealId);
            if (!deal) return null;
            return (
              <div key={i} style={{ margin: "32px 0", padding: 24, borderRadius: 16, background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(244,63,94,0.1))", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#0D9488", marginBottom: 8, letterSpacing: 1 }}>Featured Deal</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text)", marginTop: 0 }}>{deal.title}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 16, flex: 1 }}>Available at <strong>{deal.business.name}</strong></p>
                <a href={`/deal/${deal.id}`} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>View Deal & Claim</a>
              </div>
            );
          }

          if (bizMatch) {
            const bizId = parseInt(bizMatch[1]);
            const biz = post.businesses.find(b => b.id === bizId);
            if (!biz) return null;
            return (
              <div key={i} style={{ margin: "32px 0", padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#F43F5E", marginBottom: 8, letterSpacing: 1 }}>Featured Business</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--text)", marginTop: 0 }}>{biz.name}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 16, flex: 1 }}>{biz.description?.substring(0,120)}...</p>
                <a href={`/deal?business=${biz.id}`} className="btn btn-orange" style={{ alignSelf: "flex-start" }}>View Profile</a>
              </div>
            );
          }

          // Otherwise, it's normal HTML content
          return <div key={i} dangerouslySetInnerHTML={{ __html: chunk }} />;
        })}
      </div>

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
