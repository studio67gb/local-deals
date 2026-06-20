import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const authHeader = `Basic ${Buffer.from(apiKey + ":").toString("base64")}`;

  try {
    const res = await fetch(`https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(q)}&items_per_page=10`, {
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Companies House API Error:", text);
      return NextResponse.json({ error: "Failed to fetch from Companies House" }, { status: res.status });
    }

    const data = await res.json();
    
    // We only need the title (name) and company_number, and maybe address snippet
    const results = (data.items || []).map((item: any) => ({
      name: item.title,
      companyNumber: item.company_number,
      addressSnippet: item.address_snippet,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
