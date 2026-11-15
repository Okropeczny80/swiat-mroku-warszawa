"use client";
import {useEffect,useRef} from "react";
import maplibregl from "maplibre-gl";
type Place=any;
export default function MapView({locations,onSelect}:{locations:Place[];onSelect:(p:Place)=>void}){
 const host=useRef<HTMLDivElement>(null),map=useRef<maplibregl.Map|null>(null),markers=useRef<maplibregl.Marker[]>([]),select=useRef(onSelect);
 useEffect(()=>{select.current=onSelect},[onSelect]);
 useEffect(()=>{if(!host.current||map.current)return;const m=new maplibregl.Map({container:host.current,style:"https://demotiles.maplibre.org/style.json",center:[21.012,52.23],zoom:11});m.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");map.current=m;return()=>{markers.current.forEach(x=>x.remove());m.remove();map.current=null}},[]);
 useEffect(()=>{const m=map.current;if(!m)return;markers.current.forEach(x=>x.remove());markers.current=[];const b=new maplibregl.LngLatBounds();let n=0;locations.forEach(p=>{if(typeof p.latitude!=="number"||typeof p.longitude!=="number")return;const el=document.createElement("button");el.className="map-marker "+(["supernatural","crime"].includes(p.category)?"danger":"");el.title=p.name;const marker=new maplibregl.Marker({element:el}).setLngLat([p.longitude,p.latitude]).setPopup(new maplibregl.Popup({offset:18}).setText([p.name,p.district,p.address].filter(Boolean).join(" · "))).addTo(m);el.addEventListener("click",()=>select.current(p));markers.current.push(marker);b.extend([p.longitude,p.latitude]);n++});if(n)m.fitBounds(b,{padding:65,maxZoom:14,duration:400})},[locations]);
 return <div className="map-wrap"><div ref={host} className="map-canvas"/><div className="map-legend"><span><i/> Miejsca</span><span><i className="danger"/> Nietypowe</span></div></div>
}