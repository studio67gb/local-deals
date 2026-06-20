import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/business/dashboard/', 
        '/api/'
      ],
    },
    sitemap: 'https://local-deals.uk/sitemap.xml',
  }
}
