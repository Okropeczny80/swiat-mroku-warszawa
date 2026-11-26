"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import MechanicalSheet from "@/components/MechanicalSheet";

type CharacterType = { id: string; name: string; sort_order: number };
type Character = {
  id: string; character_type_id: string | null; first_name: string | null; last_name: string | null;
  nickname: string | null; display_name: string; age: number | null; occupation: string | null;
  status: string; biography: string | null; gm_notes: string | null;
  character_types?: { name: string } | null;
};
type CharacterPhoto = { id: string; character_id: string; storage_path: string; caption: string | null; is_primary: boolean; sort_order: number };
type Membership = { id: string; role_title: string | null; membership_status: string; organizations?: { name: string } | null };
const blank = { first_name: "", last_name: "", nickname: "", age: "", occupation: "", status: "active", character_type_id: "", biography: "", gm_notes: "" };

export default function CharacterModule({ session, onMessage }: { session: any; onMessage: (message: string) => void }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [types, setTypes] = useState<CharacterType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<CharacterPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editor, setEditor] = useState(false);
  const [form, setForm] = useState<any>(blank);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoRefresh, setPhotoRefresh] = useState(0);
  const [portraitZoom, setPortraitZoom] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [typeRes, characterRes] = await Promise.all([
      supabase.from("character_types").select("id,name,sort_order").is("deleted_at", null).order("sort_order"),
      supabase.from("characters").select("id,character_type_id,first_name,last_name,nickname,display_name,age,occupation,status,biography,gm_notes,character_types(name)").is("deleted_at", null).order("display_name")
    ]);
    if (typeRes.error || characterRes.error) { onMessage("Nie udało się wczytać postaci: " + (typeRes.error || characterRes.error)?.message); return; }
    setTypes(typeRes.data || []);
    setCharacters((characterRes.data || []) as unknown as Character[]);
    setSelectedId(current => current && characterRes.data?.some((c: any) => c.id === current) ? current : characterRes.data?.[0]?.id || null);
  }, [onMessage]);

  useEffect(() => { void load(); }, [load]);

  const selected = characters.find(c => c.id === selectedId) || null;
  useEffect(() => {
    if (!supabase || !selectedId) { setPhotos([]); setPhotoUrls({}); setMemberships([]); return; }
    let cancelled = false;
    (async () => {
      const [photoRes, membershipRes] = await Promise.all([
        supabase!.from("character_photos").select("id,character_id,storage_path,caption,is_primary,sort_order").eq("character_id", selectedId).is("deleted_at", null).order("sort_order"),
        supabase!.from("organization_memberships").select("id,role_title,membership_status,organizations(name)").eq("character_id", selectedId).is("deleted_at", null).order("created_at")
      ]);
      if (cancelled) return;
      if (photoRes.error) onMessage("Nie udało się wczytać portretów: " + photoRes.error.message);
      if (membershipRes.error) onMessage("Nie udało się wczytać przynależności: " + membershipRes.error.message);
      const rows = (photoRes.data || []) as CharacterPhoto[];
      setPhotos(rows);
      setMemberships((membershipRes.data || []) as unknown as Membership[]);
      const signed = await Promise.all(rows.map(async p => {
        const { data, error } = await supabase!.storage.from("world-assets").createSignedUrl(p.storage_path, 3600);
        return [p.id, error ? "" : data?.signedUrl || ""] as const;
      }));
      if (!cancelled) setPhotoUrls(Object.fromEntries(signed.filter(([, url]) => url)));
    })();
    return () => { cancelled = true; };
  }, [selectedId, photoRefresh, onMessage]);

  const filtered = useMemo(() => characters.filter(c => {
    const haystack = [c.display_name, c.nickname, c.occupation, c.character_types?.name].filter(Boolean).join(" ").toLocaleLowerCase("pl");
    return haystack.includes(query.toLocaleLowerCase("pl")) && (!typeFilter || c.character_type_id === typeFilter);
  }), [characters, query, typeFilter]);

  function openNew() { setForm(blank); setEditor(true); }
  function openEdit() {
    if (!selected) return;
    setForm({ id: selected.id, first_name: selected.first_name || "", last_name: selected.last_name || "", nickname: selected.nickname || "", age: selected.age == null ? "" : String(selected.age), occupation: selected.occupation || "", status: selected.status || "active", character_type_id: selected.character_type_id || "", biography: selected.biography || "", gm_notes: selected.gm_notes || "" });
    setEditor(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    const displayName = [form.first_name.trim(), form.last_name.trim()].filter(Boolean).join(" ") || form.nickname.trim();
    if (!displayName) { onMessage("Podaj imię i nazwisko albo pseudonim postaci."); return; }
    setSaving(true);
    const payload = {
      first_name: form.first_name.trim() || null, last_name: form.last_name.trim() || null,
      nickname: form.nickname.trim() || null, display_name: displayName,
      age: form.age.trim() ? Number(form.age) : null, occupation: form.occupation.trim() || null,
      status: form.status, character_type_id: form.character_type_id || null,
      biography: form.biography.trim() || null, gm_notes: form.gm_notes.trim() || null,
      updated_at: new Date().toISOString()
    };
    const result = selected && editor && (form as any).id
      ? await supabase.from("characters").update(payload).eq("id", (form as any).id)
      : await supabase.from("characters").insert(payload).select("id").single();
    setSaving(false);
    if (result.error) { onMessage("Błąd zapisu postaci: " + result.error.message); return; }
    const newId = (result.data as any)?.id || (form as any).id;
    setEditor(false); onMessage((form as any).id ? "Zapisano kartę postaci." : "Dodano nową postać.");
    await load();
    if (newId) setSelectedId(newId);
  }
  async function uploadPortrait(file: File | null) {
    if (!file || !supabase || !selected) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) { onMessage("Dozwolone formaty: JPG, PNG, WebP i AVIF."); return; }
    if (file.size > 10 * 1024 * 1024) { onMessage("Plik jest za duży. Maksymalny rozmiar to 10 MB."); return; }
    setPhotoBusy(true);
    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const path = "characters/" + selected.id + "/" + Date.now() + "-" + crypto.randomUUID() + "." + ext;
    const { error: uploadError } = await supabase.storage.from("world-assets").upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
    if (uploadError) { setPhotoBusy(false); onMessage("Nie udało się przesłać portretu: " + uploadError.message); return; }
    const { data: inserted, error } = await supabase.from("character_photos").insert({ character_id: selected.id, storage_path: path, caption: "Portret", is_primary: false, sort_order: photos.length }).select("id").single();
    if (error || !inserted) {
      await supabase.storage.from("world-assets").remove([path]);
      setPhotoBusy(false); onMessage("Plik przesłano, ale zapis karty zdjęcia nie powiódł się: " + (error?.message || "brak rekordu")); return;
    }
    const clear = await supabase.from("character_photos").update({ is_primary: false, updated_at: new Date().toISOString() }).eq("character_id", selected.id).neq("id", inserted.id).is("deleted_at", null);
    const main = await supabase.from("character_photos").update({ is_primary: true, updated_at: new Date().toISOString() }).eq("id", inserted.id);
    setPhotoBusy(false);
    if (clear.error || main.error) onMessage("Portret dodano, ale nie udało się ustawić go jako głównego: " + (clear.error || main.error)?.message);
    else onMessage("Zapisano portret główny.");
    setPhotoRefresh(v => v + 1);
  }
  async function setPrimary(photo: CharacterPhoto) {
    if (!supabase || !selected) return;
    setPhotoBusy(true);
    const clear = await supabase.from("character_photos").update({ is_primary: false, updated_at: new Date().toISOString() }).eq("character_id", selected.id).neq("id", photo.id).is("deleted_at", null);
    const main = await supabase.from("character_photos").update({ is_primary: true, updated_at: new Date().toISOString() }).eq("id", photo.id);
    setPhotoBusy(false);
    if (clear.error || main.error) onMessage("Nie udało się zmienić portretu: " + (clear.error || main.error)?.message);
    else setPhotoRefresh(v => v + 1);
  }
  async function softDelete() {
    if (!supabase || !selected || !window.confirm("Przenieść tę postać do kosza? Powiązania pozostaną w bazie.")) return;
    const { error } = await supabase.from("characters").update({ deleted_at: new Date().toISOString(), deleted_by: session.user.id, deletion_reason: "Usunięto z karty postaci" }).eq("id", selected.id);
    if (error) onMessage("Nie udało się przenieść postaci do kosza: " + error.message);
    else { onMessage("Postać przeniesiono do kosza."); setSelectedId(null); await load(); }
  }

  return <div className="character-workspace">
    <aside className="character-list-panel">
      <div className="panel-heading"><div><small>REJESTR OSÓB I ISTOT</small><h2>Postacie</h2></div><span className="character-count">{characters.length}</span></div>
      <input className="character-search" placeholder="Szukaj postaci…" value={query} onChange={e => setQuery(e.target.value)} />
      <select className="character-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="">Wszystkie typy</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <div className="character-list">{filtered.map(c => <button key={c.id} className={"character-row" + (selectedId === c.id ? " selected" : "")} onClick={() => setSelectedId(c.id)}>
        <span className="character-avatar">{c.display_name.slice(0,1).toLocaleUpperCase("pl")}</span><span className="character-row-copy"><b>{c.display_name}</b><small>{c.character_types?.name || "Typ nieustalony"}{c.occupation ? " · " + c.occupation : ""}</small></span><i>›</i>
      </button>)}
      {!filtered.length && <div className="character-empty-list">{query || typeFilter ? "Nie znaleziono postaci." : "Rejestr jest pusty. Dodaj pierwszą postać."}</div>}</div>
      <button className="character-add" onClick={openNew}>＋ NOWA POSTAĆ</button>
    </aside>
    <section className="character-card-panel">
      <div className="panel-heading"><div><small>AKTA OSOBOWE / DOSTĘP MG</small><h2>{selected?.display_name || "Karta postaci"}</h2></div>{selected && <span className="character-record-state">{selected.status === "active" ? "AKTYWNA" : selected.status.toUpperCase()}</span>}</div>
      {selected ? <div className="character-card-content">
        <div className="character-portrait">
          {photos.find(p => p.is_primary) && photoUrls[photos.find(p => p.is_primary)!.id] ? <img className="character-portrait-image" onClick={() => setPortraitZoom(photoUrls[photos.find(p => p.is_primary)!.id])} src={photoUrls[photos.find(p => p.is_primary)!.id]} alt={"Portret: " + selected.display_name} /> : <div className="portrait-placeholder"><span>WARSZAWA ’97</span><b>{selected.display_name.slice(0,1).toLocaleUpperCase("pl")}</b><small>PORTRET NIEUSTALONY</small></div>}
          <label className="portrait-upload">＋ DODAJ / ZMIEŃ PORTRET<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={photoBusy} onChange={e => { const f=e.target.files?.[0] || null; void uploadPortrait(f); e.currentTarget.value=""; }} /></label>
          <MechanicalSheet characterId={selected.id} onMessage={onMessage} />
        </div>
        <div className="character-facts">
          <div className="character-kicker">{selected.character_types?.name || "TYP NIEUSTALONY"} <span>WARSZAWA · 1997</span></div>
          <h1>{selected.display_name}</h1>
          {selected.nickname && <p className="character-alias">„{selected.nickname}”</p>}
          <div className="character-fact-grid"><div><small>WIEK</small><b>{selected.age ?? "Nieznany"}</b></div><div><small>ZAWÓD</small><b>{selected.occupation || "Nieustalony"}</b></div><div><small>STATUS</small><b>{selected.status}</b></div></div>
          <section className="character-section"><small>BIOGRAFIA / HISTORIA</small><p>{selected.biography || "Brak wpisu w aktach osobowych."}</p></section>
          <section className="character-section"><small>PRZYNALEŻNOŚĆ ORGANIZACYJNA</small>{memberships.length ? memberships.map(m => <div className="membership-row" key={m.id}><b>{m.organizations?.name || "Organizacja bez nazwy"}</b><span>{m.role_title || "Bez funkcji"} · {m.membership_status}</span></div>) : <p>Brak zarejestrowanych przynależności.</p>}</section>
          <section className="character-section character-gallery"><small>GALERIA / PORTRETY DODATKOWE</small><div className="character-photo-strip">{photos.map(p => <button key={p.id} className={p.is_primary ? "is-primary" : ""} onClick={() => !p.is_primary && void setPrimary(p)} title={p.is_primary ? "Portret główny" : "Ustaw jako portret główny"}>{photoUrls[p.id] ? <img src={photoUrls[p.id]} alt={p.caption || "Portret postaci"} /> : "…"}</button>)}{!photos.length && <p>Brak fotografii w galerii.</p>}</div></section>
          <section className="character-secret"><small>◈ TAJNE / NOTATKI WYŁĄCZNIE DLA MG</small><p>{selected.gm_notes || "Brak poufnych notatek."}</p></section>
          <div className="character-actions"><button onClick={openEdit}>EDYTUJ KARTĘ</button><button onClick={softDelete}>PRZENIEŚ DO KOSZA</button></div>
        </div>
      </div> : <div className="character-empty-card"><span>✧</span><h3>Brak wybranej postaci</h3><p>Wybierz osobę z rejestru albo utwórz nową kartę.</p><button onClick={openNew}>＋ UTWÓRZ KARTĘ POSTACI</button></div>}
    </section>
    {portraitZoom && <div className="portrait-lightbox" onClick={() => setPortraitZoom(null)}><button onClick={() => setPortraitZoom(null)}>×</button><img src={portraitZoom} alt="Powiększony portret" /></div>}
    {editor && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditor(false); }}><form className="character-editor" onSubmit={save}>
      <div className="editor-heading"><div><small>ARCHIWUM / NOWY WPIS</small><h2>{(form as any).id ? "Edytuj postać" : "Nowa postać"}</h2></div><button type="button" onClick={() => setEditor(false)}>×</button></div>
      <div className="character-form-grid">
        <label>IMIĘ<input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></label>
        <label>NAZWISKO<input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></label>
        <label>PSEUDONIM / PRZYDOMEK<input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} /></label>
        <label>TYP POSTACI<select value={form.character_type_id} onChange={e => setForm({ ...form, character_type_id: e.target.value })}><option value="">Nieustalony</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>WIEK<input type="number" min="0" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></label>
        <label>ZAWÓD<input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} /></label>
        <label>STATUS<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Aktywna</option><option value="inactive">Nieaktywna</option><option value="missing">Zaginiona</option><option value="deceased">Zmarła</option><option value="unknown">Nieustalony</option></select></label>
        <label className="wide">BIOGRAFIA / HISTORIA<textarea rows={5} value={form.biography} onChange={e => setForm({ ...form, biography: e.target.value })} /></label>
        <label className="wide secret-input">TAJNE / NOTATKI MG<textarea rows={5} value={form.gm_notes} onChange={e => setForm({ ...form, gm_notes: e.target.value })} /></label>
      </div>
      <div className="editor-footer"><button type="button" className="cancel" onClick={() => setEditor(false)}>ANULUJ</button><button className="save" disabled={saving}>{saving ? "ZAPISYWANIE…" : "ZAPISZ POSTAĆ"}</button></div>
    </form></div>}
  </div>;
}
