import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const companyNumber = req.nextUrl.searchParams.get("companyNumber");
  if (!companyNumber) {
    return NextResponse.json({ error: "Missing companyNumber" }, { status: 400 });
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const authHeader = `Basic ${Buffer.from(apiKey + ":").toString("base64")}`;

  try {
    const res = await fetch(`https://api.company-information.service.gov.uk/company/${encodeURIComponent(companyNumber)}`, {
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Companies House Profile API Error:", text);
      return NextResponse.json({ error: "Failed to fetch from Companies House" }, { status: res.status });
    }

    const data = await res.json();
    
    // Extract relevant data
    const roa = data.registered_office_address || {};
    
    // Construct a sensible full address
    const addressParts = [
      roa.address_line_1,
      roa.address_line_2,
      roa.locality,
      roa.postal_code
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    return NextResponse.json({
      name: data.company_name,
      companyNumber: data.company_number,
      address: fullAddress,
      locality: roa.locality || "",
      postcode: roa.postal_code || ""
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
