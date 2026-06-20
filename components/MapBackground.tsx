"use client";
import { useState, useEffect, useRef } from "react";

interface MapBusiness {
  id: number;
  lat: number | null;
  lng: number | null;
}

declare global {
  interface Window {
    google: typeof google;
    initBackgroundMap?: () => void;
  }
}

export default function MapBackground() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [loaded, setLoaded] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    fetch("/api/map/businesses")
      .then(r => r.json())
      .then(d => {
        // Only care about lat/lng for background pins
        setBusinesses(d.filter((b: any) => b.lat && b.lng));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || loaded) return;

    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkGoogle);
          setLoaded(true);
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    window.initBackgroundMap = () => setLoaded(true);

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initBackgroundMap&libraries=marker`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 53.5, lng: -1.15 }, // Centered near Doncaster
        zoom: 9,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0B0F19" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0B0F19" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
          { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
          { featureType: "road.highway", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#111827" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#374151" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
        ],
        disableDefaultUI: true,
        gestureHandling: "none",
        keyboardShortcuts: false,
        zoomControl: false,
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    const markers: google.maps.Marker[] = [];
    if (businesses.length > 0) {
      businesses.forEach((b) => {
        markers.push(new window.google.maps.Marker({
          position: { lat: b.lat!, lng: b.lng! },
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6, // Smaller for background
            fillColor: "#10B981", // Bright Mint
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: "#059669", // Emerald Green
            strokeOpacity: 0.5
          },
          clickable: false,
        }));
      });
    }

    return () => {
      markers.forEach(m => m.setMap(null));
    };

  }, [loaded, businesses]);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden"
    }}>
      {/* The map container */}
      <div 
        ref={mapRef} 
        style={{ 
          position: "absolute", 
          inset: 0, 
          // Less aggressive blur/opacity so it's visible
          filter: "blur(1px) opacity(0.8)", 
          transform: "scale(1.05)" // prevent blur bleeding edges
        }} 
      />
      {/* Overlay gradient to fade out map at edges and bottom so content is readable */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 0%, var(--bg) 95%), linear-gradient(to bottom, transparent 40%, var(--bg) 100%)",
      }} />
    </div>
  );
}
