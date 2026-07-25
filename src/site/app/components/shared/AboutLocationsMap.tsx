"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { AboutLocation } from "@/lib/site-content/types";

const greenIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;width:18px;height:18px;border-radius:9999px;
    background:#6E9277;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(71,71,71,0.35);
  "></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ locations }: { locations: AboutLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 4);
      return;
    }
    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }, [locations, map]);

  return null;
}

export default function AboutLocationsMap({ locations }: { locations: AboutLocation[] }) {
  const center: [number, number] =
    locations.length > 0 ? [locations[0].lat, locations[0].lng] : [10, 0];

  return (
    <MapContainer
      center={center}
      zoom={3}
      scrollWheelZoom={false}
      className="w-full h-full min-h-[280px] rounded-2xl z-0"
      style={{ background: "#dfe8e1" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={greenIcon}>
          <Popup>
            <strong>{loc.label}</strong>
            {loc.description ? <p style={{ margin: "4px 0 0" }}>{loc.description}</p> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
