"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import MapView from "@/components/MapView";

type Category = { id: string; name: string; slug: string; color: string; icon: string | null; sort_order: number };
type Location = {
  id: string; name: string; category_id: string | null; status: string; address: string | null;
  district: string | null; latitude: number | null; longitude: number | null;
  campaign_period: string | null; description: string | null; gm_notes: string | null;
  location_categories?: Category | null;
};
type RouteResult = { geometry: GeoJSON.LineString; distance: number; duration: number } | null;
const emptyLocation = { name: "", category_id: "", status: "active", address: "", district: "", latitude: "", longitude: "", campaign_period: "1997", description: "", gm_notes: "" };
const fmtDistance = (m: number) => m >= 1000 ? (m / 1000).toFixed(1).replace(".", ",") + " km" : Math.round(m) + " m";
const fmtDuration = (s: number) => { const m = Math.round(s / 60); return m >= 60 ? Math.floor(m / 60) + " godz. " + (m % 60) + " min" : m + " min"; };

export default function Home() {
  const [session, setSession] = useState<any>(null), [ready, setReady] = useState(false);
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]), [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null), [visible, setVisible] = useState<string[]>([]);
  const [query, setQuery] = useState(""), [categorySearch, setCategorySearch] = useState("");
  const [message, setMessage] = useState(""), [loading, setLoading] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true), [rightOpen, setRightOpen] = useState(true), [textLarge, setTextLarge] = useState(false);
  const [editor, setEditor] = useState(false), [form, setForm] = useState<any>(emptyLocation), [saving, setSaving] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [origin, setOrigin] = useState(""), [destination, setDestination] = useState(""), [mode, setMode] = useState<"driving" | "walking">("driving"), [route, setRoute] = useState<RouteResult>(null), [routing, setRouting] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const [catRes, locRes] = await Promise.all([
      supabase.from("location_categories").select("id,name,slug,color,icon,sort_order").is("deleted_at", null).order("sort_order"),
      supabase.from("locations").select("*,location_categories(id,name,slug,color,icon,sort_order)").is("deleted_at", null).order("name")
    ]);
    if (catRes.error || locRes.error) setMessage("Nie udało się wczytać mapy: " + (catRes.error || locRes.error)?.message);
    else {
      const cats = catRes.data || [];
      const locs = (locRes.data || []) as Location[];
      setCategories(cats);
      setLocations(locs);
      setVisible(current => current.length ? current.filter(id => cats.some(c => c.id === id)) : cats.map(c => c.id));
      setSelected(current => current ? locs.find(l => l.id === current.id) || null : null);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const filteredLocations = useMemo(() => locations.filter(l => {
    const text = [l.name, l.address, l.district, l.description].filter(Boolean).join(" ").toLocaleLowerCase("pl");
    return text.includes(query.toLocaleLowerCase("pl")) && (!l.category_id || visible.includes(l.category_id));
  }), [locations, query, visible]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setMessage("Brak konfiguracji Supabase."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMessage(error.message);
  }
  function newLocation(coords?: { latitude: number; longitude: number }) { setPlacing(false); setForm({ ...emptyLocation, category_id: categories[0]?.id || "", latitude: coords?.latitude.toFixed(6) || "", longitude: coords?.longitude.toFixed(6) || "" }); setEditor(true); }
  const handleMapClick = useCallback((latitude: number, longitude: number) => { newLocation({ latitude, longitude }); setMessage("Ustawiono współrzędne nowej lokalizacji. Uzupełnij kartę i zapisz."); }, [categories]);
  function editLocation() {
    if (!selected) return;
    setForm({ ...selected, latitude: selected.latitude ?? "", longitude: selected.longitude ?? "", category_id: selected.category_id || "" });
    setEditor(true);
  }
  async function saveLocation(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setSaving(true);
    const payload = { ...form, latitude: form.latitude === "" ? null : Number(form.latitude), longitude: form.longitude === "" ? null : Number(form.longitude), category_id: form.category_id || null };
    delete payload.id; delete payload.location_categories; delete payload.created_at; delete payload.updated_at; delete payload.created_by; delete payload.updated_by; delete payload.deleted_at; delete payload.deleted_by; delete payload.deletion_reason;
    const result = form.id ? await supabase.from("locations").update(payload).eq("id", form.id) : await supabase.from("locations").insert(payload).select("id").single();
    setSaving(false);
    if (result.error) { setMessage("Błąd zapisu: " + result.error.message); return; }
    setEditor(false); setMessage(form.id ? "Zapisano zmiany lokalizacji." : "Dodano lokalizację."); await load();
    if (!form.id && result.data?.id) { const { data } = await supabase.from("locations").select("*,location_categories(*)").eq("id", result.data.id).single(); if (data) setSelected(data as Location); }
  }
  async function softDelete() {
    if (!supabase || !selected || !window.confirm("Przenieść to miejsce do kosza?")) return;
    const { error } = await supabase.from("locations").update({ deleted_at: new Date().toISOString(), deleted_by: session.user.id, deletion_reason: "Usunięto z karty lokalizacji" }).eq("id", selected.id);
    if (error) setMessage("Nie udało się przenieść do kosza: " + error.message);
    else { setSelected(null); setMessage("Miejsce przeniesiono do kosza."); await load(); }
  }
  async function buildRoute() {
    const a = locations.find(x => x.id === origin), b = locations.find(x => x.id === destination);
    if (!a || !b || a.longitude == null || a.latitude == null || b.longitude == null || b.latitude == null) { setMessage("Oba miejsca muszą mieć współrzędne."); return; }
    setRouting(true); setRoute(null);
    try {
      const router = mode === "walking" ? "routed-foot" : "routed-car";
      const res = await fetch("https://routing.openstreetmap.de/" + router + "/route/v1/driving/" + a.longitude + "," + a.latitude + ";" + b.longitude + "," + b.latitude + "?overview=full&geometries=geojson");
      const json = await res.json();
      if (!res.ok || json.code !== "Ok" || !json.routes?.length) throw new Error("Nie udało się wyznaczyć trasy dla wybranego środka transportu.");
      const r = json.routes[0]; setRoute({ geometry: r.geometry, distance: r.distance, duration: r.duration });
    } catch (err) { setMessage(err instanceof Error ? err.message : "Błąd wyznaczania trasy."); }
    finally { setRouting(false); }
  }
  function toggleCategory(id: string) { setVisible(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]); }

  if (!ready) return <main className="loading-screen">OTWIERANIE ARCHIWUM…</main>;
  if (!session) return <main className="login-shell"><header className="topline"><span>AKTA TAJNE / WYDZIAŁ SPRAW NIETYPOWYCH</span><b>ARCHIWUM WARSZAWA ’97</b></header><section className="login-paper"><div className="seal">97</div><p className="eyebrow">WORLD OF DARKNESS · WARSZAWA</p><h1>ŚWIAT MROKU</h1><p className="year">1997</p><h2>UWIERZYTELNIENIE ARCHIWISTY</h2><form onSubmit={login}><label>ADRES E-MAIL</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} /><label>HASŁO</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} /><button className="primary">OTWÓRZ AKTA</button></form>{message && <p className="message">{message}</p>}<small>DOSTĘP WYŁĄCZNIE DLA UPOWAŻNIONEGO PERSONELU</small></section><footer>Nie każdy sekret powinien ujrzeć światło dzienne.</footer></main>;

  return <main className={"map-app" + (textLarge ? " text-large" : "")}>
    <header className="map-topbar">
      <div className="brand"><div className="brand-seal">97</div><div><strong>ŚWIAT MROKU</strong><small>WARSZAWA · 1997</small></div></div>
      <nav className="top-tabs"><button className="active">MAPA</button><button disabled>POSTACIE</button><button disabled>ORGANIZACJE</button><button disabled>POWIĄZANIA</button><button disabled>ARCHIWUM</button><button disabled>SZUKAJ</button></nav>
      <div className="user-tools"><span>● MG / {session.user.email}</span><button type="button" onClick={() => setTextLarge(v => !v)} aria-pressed={textLarge} aria-label={textLarge ? "Przywróć standardowy rozmiar tekstu" : "Powiększ tekst"}>{textLarge ? "A−" : "A+"}</button><button onClick={() => supabase?.auth.signOut()}>WYLOGUJ ↗</button></div>
    </header>
    <div className="map-workspace">
      {leftOpen && <aside className="map-left">
        <div className="panel-heading"><div><small>NAWIGACJA TERENOWA</small><h2>Warszawa</h2></div><button onClick={() => setLeftOpen(false)} aria-label="Zwiń panel">‹</button></div>
        <section className="route-card">
          <div className="micro-heading">WYZNACZ TRASĘ <span>↗</span></div>
          <label>OD<select value={origin} onChange={e => setOrigin(e.target.value)}><option value="">Wybierz miejsce początkowe</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <label>DO<select value={destination} onChange={e => setDestination(e.target.value)}><option value="">Wybierz miejsce docelowe</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <div className="route-controls"><button className={mode === "driving" ? "selected" : ""} onClick={() => setMode("driving")}>SAMOCHÓD</button><button className={mode === "walking" ? "selected" : ""} onClick={() => setMode("walking")}>PIESZO</button></div>
          <button className="route-submit" disabled={routing || !origin || !destination} onClick={buildRoute}>{routing ? "WYZNACZANIE…" : "WYZNACZ TRASĘ"}</button>
          {route && <div className="route-result"><b>{fmtDistance(route.distance)}</b><span>ok. {fmtDuration(route.duration)}</span><button onClick={() => setRoute(null)}>WYCZYŚĆ TRASĘ ×</button></div>}
        </section>
        <section className="location-browser">
          <div className="micro-heading">LOKALIZACJE <span>{locations.length}</span></div>
          <input className="map-search" placeholder="Szukaj miejsca…" value={query} onChange={e => setQuery(e.target.value)} />
          <input className="map-search category-search" placeholder="Filtruj kategorie…" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />
          <div className="category-list">{categories.filter(c => c.name.toLocaleLowerCase("pl").includes(categorySearch.toLocaleLowerCase("pl"))).map(c => {
            const count = locations.filter(l => l.category_id === c.id).length;
            return <div className="category-row" key={c.id}><button className="category-toggle" onClick={() => toggleCategory(c.id)}><span className="category-dot" style={{ background: c.color }} /><span>{c.name}</span><small>{count}</small></button><input type="checkbox" checked={visible.includes(c.id)} onChange={() => toggleCategory(c.id)} aria-label={"Pokaż kategorię " + c.name} /></div>;
          })}</div>
          <div className="place-list">{filteredLocations.map(l => <button key={l.id} className={"place-row " + (selected?.id === l.id ? "chosen" : "")} onClick={() => setSelected(l)}><i style={{ background: l.location_categories?.color || "#a98c62" }} /><span><b>{l.name}</b><small>{l.district || l.address || "Warszawa"}</small></span><em>›</em></button>)}</div>
        </section>
        <button className="add-location" onClick={() => newLocation()}>＋ DODAJ LOKALIZACJĘ</button>
      </aside>}
      {!leftOpen && <button className="reopen left-reopen" onClick={() => setLeftOpen(true)}>› LOKALIZACJE</button>}
      <section className="map-stage">
        <div className="map-title"><span>WARSZAWA / POLSKA</span><b>PLAN MIASTA · WIDOK OPERACYJNY</b><button type="button" className={"map-place-toggle" + (placing ? " active" : "")} onClick={() => { setPlacing(v => !v); setMessage(placing ? "Anulowano dodawanie punktu." : "Tryb dodawania: kliknij wybrane miejsce na mapie."); }}>{placing ? "ANULUJ DODAWANIE ×" : "＋ DODAJ PUNKT"}</button><span>1997</span></div>
        {placing && <div className="map-placement-hint">TRYB DODAWANIA · KLIKNIJ NA MAPIE, ABY USTAWIĆ ZNACZNIK</div>}
        <MapView locations={filteredLocations} selectedId={selected?.id || null} route={route?.geometry || null} onSelect={p => setSelected(p as Location)} placing={placing} onMapClick={handleMapClick} />
        {loading && <div className="map-loading">SYNCHRONIZACJA DANYCH…</div>}
        {!rightOpen && <button className="reopen right-reopen" onClick={() => setRightOpen(true)}>KARTA MIEJSCA ‹</button>}
      </section>
      {rightOpen && <aside className="map-right">
        <div className="panel-heading"><div><small>KARTA OBIEKTU</small><h2>{selected ? "Wybrane miejsce" : "Akta lokalizacji"}</h2></div><button onClick={() => setRightOpen(false)} aria-label="Zwiń panel">›</button></div>
        {selected ? <div className="location-detail">
          <div className="detail-image"><span>WARSZAWA ’97</span><b>{selected.location_categories?.name || "LOKALIZACJA"}</b></div>
          <div className="detail-content"><div className="detail-status"><span style={{ background: selected.location_categories?.color || "#a98c62" }} />{selected.status === "active" ? "AKTYWNE" : selected.status.toUpperCase()}</div><h1>{selected.name}</h1><p className="address">{[selected.address, selected.district].filter(Boolean).join(" · ") || "Brak adresu"}</p>
            <div className="coordinates">{selected.latitude != null && selected.longitude != null ? selected.latitude.toFixed(5) + " · " + selected.longitude.toFixed(5) : "BRAK WSPÓŁRZĘDNYCH"}<span>{selected.campaign_period || "1997"}</span></div>
            <section className="detail-section"><small>OPIS / CHARAKTERYSTYKA</small><p>{selected.description || "Brak opisu tego miejsca."}</p></section>
            <section className="secret-section"><small>◈ TAJNE / NOTATKI MG</small><p>{selected.gm_notes || "Brak poufnych notatek."}</p></section>
            <div className="detail-actions"><button onClick={editLocation}>EDYTUJ KARTĘ</button><button onClick={softDelete}>PRZENIEŚ DO KOSZA</button></div>
          </div>
        </div> : <div className="empty-detail"><div className="empty-mark">⌖</div><h3>Nie wybrano lokalizacji</h3><p>Wybierz punkt na mapie lub pozycję z listy po lewej stronie, aby otworzyć kartę miejsca.</p><button onClick={() => newLocation()}>＋ DODAJ PIERWSZE MIEJSCE</button></div>}
      </aside>}
    </div>
    {message && <div className="toast">{message}<button onClick={() => setMessage("")}>×</button></div>}
    {editor && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditor(false); }}><form className="location-editor" onSubmit={saveLocation}>
      <div className="editor-heading"><div><small>{form.id ? "AKTUALIZACJA WPISU" : "NOWY WPIS DO ARCHIWUM"}</small><h2>{form.id ? "Edytuj lokalizację" : "Nowa lokalizacja"}</h2></div><button type="button" onClick={() => setEditor(false)}>×</button></div>
      <div className="editor-grid">
        <label className="wide">NAZWA MIEJSCA<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label>KATEGORIA<select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">Bez kategorii</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>STATUS<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Aktywne</option><option value="inactive">Nieaktywne</option><option value="archived">Archiwalne</option></select></label>
        <label>ADRES<input value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
        <label>DZIELNICA<input value={form.district || ""} onChange={e => setForm({ ...form, district: e.target.value })} /></label>
        <label>SZEROKOŚĆ GEOGRAFICZNA<input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} /></label>
        <label>DŁUGOŚĆ GEOGRAFICZNA<input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} /></label>
        <label>OKRES KAMPANII<input value={form.campaign_period || ""} onChange={e => setForm({ ...form, campaign_period: e.target.value })} /></label>
        <label className="wide">OPIS<textarea rows={4} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <label className="wide secret-field">TAJNE / NOTATKI MG<textarea rows={4} value={form.gm_notes || ""} onChange={e => setForm({ ...form, gm_notes: e.target.value })} /></label>
      </div>
      <div className="editor-footer"><button type="button" className="cancel" onClick={() => setEditor(false)}>ANULUJ</button><button className="save" disabled={saving}>{saving ? "ZAPISYWANIE…" : "ZAPISZ LOKALIZACJĘ"}</button></div>
    </form></div>}
  </main>;
}

// Trigger production build after reconnecting the Vercel Git integration.
