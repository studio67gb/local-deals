import { prisma } from '../lib/db';

const TARGET_URL = process.env.LIVE_SITE_URL || 'https://local-deals.uk';

async function monitorLiveSite() {
  console.log(`[Supervisor] Starting post-deploy health check for: ${TARGET_URL}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'LocalDeals-PostDeploySupervisor/1.0'
      }
    });
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP Status ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Check for critical page markers
    const hasSearch = html.includes('search') || html.includes('Search') || html.includes('input');
    const hasDeals = html.includes('Deals') || html.includes('deals');
    const isErrorPage = html.includes('<title>500') || html.includes('<title>Internal Server Error') || html.includes('<h1>Application Error</h1>');

    if (isErrorPage) {
      console.error(`[Supervisor] ❌ ERROR: Detected server error signature in HTML response.`);
      process.exit(1);
    }

    console.log(`[Supervisor] ✅ SUCCESS: Live site is UP and healthy.`);
    console.log(`[Supervisor] Response Time: ${duration}ms`);
    console.log(`[Supervisor] Content Checks: Search elements present = ${hasSearch}, Deals text present = ${hasDeals}`);
    
    // Verify DB connection still works by running a simple query
    const businessCount = await prisma.business.count();
    console.log(`[Supervisor] ✅ DB connection verified. Total businesses in database: ${businessCount}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error(`[Supervisor] ❌ CRITICAL: Live site monitoring failed!`);
    console.error(`[Supervisor] Error detail:`, error.message);
    process.exit(1);
  }
}

monitorLiveSite().catch((err) => {
  console.error('[Supervisor] Fatal execution error:', err);
  process.exit(1);
});
