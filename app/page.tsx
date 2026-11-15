"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Ładowanie archiwum…");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!supabase) { setMessage("Uzupełnij zmienne Supabase w ustawieniach projektu Vercel."); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setMessage(""); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error?.message ?? "Zalogowano.");
  }
  async function signOut() { await supabase?.auth.signOut(); }

  return <main className="shell">
    <section className="panel">
      <p className="eyebrow">ARCHIWUM • TAJNE • WARSZAWA</p>
      <h1>ŚWIAT MROKU</h1><p className="year">1997</p>
      {session ? <><h2>ARCHIWUM OTWARTE</h2><p>{session.user.email}</p><button onClick={signOut}>Wyloguj</button></> :
        <><h2>DOSTĘP DO ARCHIWUM</h2><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Hasło<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label><button onClick={signIn}>Zaloguj</button></>}
      {message && <p className="message">{message}</p>}
      <p className="foot">Nie każdy sekret powinien ujrzeć światło dzienne.</p>
    </section>
  </main>;
}