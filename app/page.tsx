"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(Boolean(next)));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) {
      setMessage("Brak konfiguracji połączenia z bazą. Logowanie nie jest jeszcze aktywne.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMessage(error.message);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
  }

  return (
    <main className="shell">
      <header><span>AKTA TAJNE / WYDZIAŁ SPRAW NIETYPOWYCH</span><b>ARCHIWUM WARSZAWA ’97</b></header>
      <section className="paper">
        <div className="seal">MW</div>
        <p className="eyebrow">WORLD OF DARKNESS · WARSZAWA</p>
        <h1>ŚWIAT MROKU</h1>
        <p className="year">1997</p>
        {session ? (
          <><h2>ARCHIWUM OTWARTEֻǱ˞