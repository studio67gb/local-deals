"use client";
import { useState, useEffect, useRef } from "react";

interface MapBusiness {
  id: number;
  name: string;
  category: string;
  area: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  deals: { id: number; title: string; claimCount: number }[];
}

const PILL_COLORS: Record<string, string> = {
  "Restaurant & Food": "#fbbf24",
  "Beauty & Hair": "#f472b6",
  "Health & Fitness": "#4ade80",
  "Retail & Shopping": "#60a5fa",
  "Trades & Services": "#fb923c",
  "Automotive": "#a78bfa",
  "Entertainment": "#2dd4bf",
  "Other": "#94a3b8",
};

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [selected, setSelected] = useState<MapBusiness | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    fetch("/api/map/businesses")
      .then(r => r.json())
      .then(setBusinesses);
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || loaded) return;

    window.initMap = () => setLoaded(true);

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap&libraries=marker`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current || businesses.length === 0) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 53.5, lng: -1.15 },
      zoom: 9,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a24" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a24" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a3a" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1923" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    businesses
      .filter(b => b.lat && b.lng)
      .forEach(b => {
        const color = PILL_COLORS[b.category] || "#0D9488";

        const marker = new window.google.maps.Marker({
          position: { lat: b.lat!, lng: b.lng! },
          map,
          title: b.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          setSelected(b);
          map.panTo({ lat: b.lat!, lng: b.lng! });
        });

        markersRef.current.push(marker);
      });

  }, [loaded, businesses]);

  const filtered = businesses.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", zIndex: 10 }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--text-dim)" }}>🔍</span>
          <input className="search-bar" style={{ paddingLeft: 36, height: 40, fontSize: 13 }} placeholder="Search town, city or business..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(PILL_COLORS).slice(0,5).map(([cat, color]) => (
            <span key={cat} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />{cat.split(" & ")[0]}
            </span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-dim)", whiteSpace: "nowrap" }}>
          {businesses.filter(b => b.lat && b.lng).length} businesses on map
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", position: "relative" }}>
        {/* Map */}
        <div ref={mapRef} style={{ flex: 1 }} />

        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 32 }}>🗺️</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading map...</div>
          </div>
        )}

        {/* Side panel */}
        <div style={{ width: 320, background: "var(--bg-card)", borderLeft: "1px solid var(--border)", overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
              {filtered.length} businesses
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Click a pin or business to view their deal</div>
          </div>

          <div style={{ overflow: "auto", flex: 1 }}>
            {selected && (
              <div style={{ margin: 12, background: "linear-gradient(135deg,rgba(13,148,136,0.1),rgba(244,63,94,0.1))", border: "1px solid rgba(13,148,136,0.3)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0D9488", textTransform: "uppercase" }}>Selected</span>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{selected.category} · {selected.area}</div>
                {selected.address && <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>📍 {selected.address}</div>}
                {selected.deals?.[0] && (
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#0D9488", fontWeight: 700, marginBottom: 3 }}>🎁 Current Deal</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{selected.deals[0].title}</div>
                  </div>
                )}
                <a href={selected.deals?.[0] ? `/deal/${selected.deals[0].id}` : "/"} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
                  View Deal →
                </a>
              </div>
            )}

            {filtered.filter(b => b.lat && b.lng).map(b => (
              <button key={b.id} onClick={() => {
                setSelected(b);
                if (mapInstanceRef.current && b.lat && b.lng) {
                  mapInstanceRef.current.panTo({ lat: b.lat, lng: b.lng });
                  mapInstanceRef.current.setZoom(14);
                }
              }} style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)", padding: "12px 16px", textAlign: "left", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: PILL_COLORS[b.category] || "#0D9488", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{b.area} · {b.deals?.length || 0} deal{b.deals?.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              </button>
            ))}

            {filtered.filter(b => !b.lat || !b.lng).length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8, fontWeight: 600 }}>NOT YET ON MAP</div>
                {filtered.filter(b => !b.lat || !b.lng).map(b => (
                  <div key={b.id} style={{ fontSize: 12, color: "var(--text-dim)", padding: "4px 0" }}>{b.name} · {b.area}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
