"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const groups = [
 {key:"power",title:"MOC",names:["Inteligencja","Siła","Prezencja"]},
 {key:"finesse",title:"FINEZJA",names:["Czujność","Zręczność","Manipulacja"]},
 {key:"resistance",title:"ODPORNOŚĆ",names:["Determinacja","Wytrzymałość","Opanowanie"]}
];
const skillGroups=[{key:"mental",title:"MENTALNE",names:["Nauka","Komputery","Rzemiosło","Śledztwo","Medycyna","Okultyzm","Polityka","Nauki ścisłe"]},{key:"physical",title:"FIZYCZNE",names:["Atletyka","Bijatyka","Prowadzenie","Broń palna","Kradzież","Skradanie","Przetrwanie","Broń biała"]},{key:"social",title:"SPOŁECZNE",names:["Opieka nad zwierzętami","Empatia","Ekspresja","Zastraszanie","Perswazja","Towarzyskość","Znajomości uliczne","Podstęp"]}];
type Entry={id:string,name:string,value:string,description:string};
const blankEntry=():Entry=>({id:crypto.randomUUID(),name:"",value:"",description:""});
export default function MechanicalSheet({characterId,onMessage}:{characterId:string,onMessage:(m:string)=>void}){
 const [attributes,setAttributes]=useState<Record<string,number>>({});
 const [skills,setSkills]=useState<Record<string,number>>({});
 const [merits,setMerits]=useState<Entry[]>([]);
 const [flaws,setFlaws]=useState<Entry[]>([]);
 const [powers,setPowers]=useState<Entry[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 useEffect(()=>{let cancelled=false;(async()=>{if(!supabase)return;const {data,error}=await supabase.from("character_mechanics").select("*").eq("character_id",characterId).maybeSingle();if(cancelled)return;if(error){onMessage("Nie udało się wczytać karty mechanicznej: "+error.message);setLoading(false);return;}if(data){setAttributes(data.attributes||{});setSkills(data.skills||{});setMerits(data.merits||[]);setFlaws(data.flaws||[]);setPowers(data.powers||[]);}else{setAttributes({});setSkills({});setMerits([]);setFlaws([]);setPowers([]);}setLoading(false);})();return()=>{cancelled=true};},[characterId]);
 async function save(){if(!supabase)return;setSaving(true);const payload={character_id:characterId,attributes,skills,merits,flaws,powers,updated_at:new Date().toISOString()};const {error}=await supabase.from("character_mechanics").upsert(payload,{onConflict:"character_id"});setSaving(false);onMessage(error?"Błąd zapisu mechaniki: "+error.message:"Zapisano kartę mechaniczną.");}
 function dots(value:number,set:(v:number)=>void){return <div className="mechanic-dots">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={"Wartość "+n} className={n<=value?"filled":""} onClick={()=>set(n===value?0:n)}>●</button>)}</div>}
 function entryList(label:string,items:Entry[],set:(v:Entry[])=>void){return <section className="mechanic-entry-column"><h4>{label}</h4>{items.map(e=><div className="mechanic-entry" key={e.id}><input placeholder="Nazwa" value={e.name} onChange={ev=>set(items.map(x=>x.id===e.id?{...x,name:ev.target.value}:x))}/><input placeholder="Wartość (opcjonalnie)" value={e.value} onChange={ev=>set(items.map(x=>x.id===e.id?{...x,value:ev.target.value}:x))}/><textarea placeholder="Opis / notatka (opcjonalnie)" rows={2} value={e.description} onChange={ev=>set(items.map(x=>x.id===e.id?{...x,description:ev.target.value}:x))}/><button type="button" className="mechanic-remove" onClick={()=>set(items.filter(x=>x.id!==e.id))}>USUŃ</button></div>)}<button type="button" className="mechanic-add" onClick={()=>set([...items,blankEntry()])}>＋ DODAJ WPIS</button></section>}
 if(loading)return <div className="mechanics-loading">Wczytywanie karty mechanicznej…</div>;
 return <div className="mechanical-sheet"><header><small>KARTA MECHANICZNA / STORYTELLING</small><button onClick={()=>void save()} disabled={saving}>{saving?"ZAPIS…":"ZAPISZ MECHANIKĘ"}</button></header><section className="mechanic-attributes"><h3>ATRYBUTY</h3>{groups.map(g=><div className="mechanic-group" key={g.key}><h4>{g.title}</h4>{g.names.map(name=>{const key=g.key+"."+name;return <div className="mechanic-row" key={key}><span>{name}</span>{dots(attributes[key]||0,v=>setAttributes({...attributes,[key]:v}))}</div>})}</div>)}</section><section className="mechanic-skills"><h3>UMIEJĘTNOŚCI</h3>{skillGroups.map(g=><div className="mechanic-group" key={g.key}><h4>{g.title}</h4>{g.names.map(name=>{const key=g.key+"."+name;return <div className="mechanic-row" key={key}><span>{name}</span>{dots(skills[key]||0,v=>setSkills({...skills,[key]:v}))}</div>})}</div>)}</section><div className="mechanic-entry-columns">{entryList("ATUTY",merits,setMerits)}{entryList("WADY",flaws,setFlaws)}{entryList("MOCE",powers,setPowers)}</div></div>;
}
