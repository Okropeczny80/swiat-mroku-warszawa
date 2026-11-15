"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
type Place = { id: string; name: string; latitude: number | null; longitude: number | null; address?: string | null; district?: string | null; location_categories?: { color?: string | null; name?: string | null } | null };
type Route = GeoJSON.LineString | null;
export default function MapView({ locations, selectedId, route, onSelect }: { locations: Place[]; selectedId: string | null; route: Route; onSelect: (p: Place) => void }) {
  const host = useRef<HTMLDivElement>(null), map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]), select = useRef(onSelect), didInitialFit = useRef(false);
  useEffect(() => { select.current = onSelect; }, [onSelect]);
  useEffect(() => {
    if (!host.current || map.current) return;
    const m = new maplibregl.Map({ container: host.current, style: "https://demotiles.maplibre.org/style.json", center: [21.0122, 52.2297], zoom: 11, attributionControl: true });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
    map.current = m;
    return () => { markers.current.forEach(x => x.remove()); m.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const m = map.current; if (!m) return;
    markers.current.forEach(x => x.remove()); markers.current = [];
    const bounds = new maplibregl.LngLatBounds(); let count = 0;
    locations.forEach(p => {
      if (typeof p.latitude !== "number" || typeof p.longitude !== "number") return;
      const el = document.createElement("button");
      el.type = "button"; el.className = "map-marker" + (p.id === selectedId ? " selected" : "");
      el.style.setProperty("--marker-color", p.location_categories?.color || "#b99a69");
      el.title = p.name; el.setAttribute("aria-label", "Otwórz lokalizację: " + p.name);
      const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([p.longitude, p.latitude])
        .setPopup(new maplibregl.Popup({ offset: 18 }).setText([p.name, p.district, p.address].filter(Boolean).join(" · "))).addTo(m);
      el.addEventListener("click", () => select.current(p));
      markers.current.push(marker); bounds.extend([p.longitude, p.latitude]); count++;
    });
    if (count && !didInitialFit.current) { m.fitBounds(bounds, { padding: 75, maxZoom: 13, duration: 450 }); didInitialFit.current = true; }
  }, [locations, selectedId]);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const apply = () => {
      const existing = m.getSource("planned-route") as maplibregl.GeoJSONSource | undefined;
      if (!route) { if (m.getLayer("planned-route-line")) m.removeLayer("planned-route-line"); if (m.getSource("planned-route")) m.removeSource("planned-route"); return; }
      const data: GeoJSON.Feature<GeoJSON.LineString> = { type: "Feature", properties: {}, geometry: route };
      if (existing) existing.setData(data);
      else {
        m.addSource("planned-route", { type: "geojson", data });
        m.addLayer({ id: "planned-route-line", type: "line", source: "planned-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#c49a5b", "line-width": 5, "line-opacity": 0.9 } });
      }
      const bounds = new maplibregl.LngLatBounds(); route.coordinates.forEach(c => bounds.extend([c[0], c[1]]));
      m.fitBounds(bounds, { padding: 90, maxZoom: 14, duration: 600 });
    };
    if (m.isStyleLoaded()) apply(); else m.once("load", apply);
  }, [route]);
  return <div className="map-wrap"><div ref={host} className="map-canvas" /><div className="map-legend"><span><i /> LOKALIZACJE</span><span><i className="route-key" /> TRASA</span></div><div className="map-credit">MAPA WSPÓŁCZESNA · DANE GEOGRAFICZNE NIE ODWZOROWUJĄ STANU Z 1997 R.</div></div>;
}
