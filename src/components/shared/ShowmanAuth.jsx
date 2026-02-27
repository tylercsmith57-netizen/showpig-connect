import { useState } from "react";
import { supabase } from '../../supabaseClient';
import { css, labelStyle, inputStyle } from '../../lib/styles';

function ShowmanSignup({ onSignup, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [club, setClub] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, account_type: "showman" } }
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    // Create showman profile
    const { error: profileError } = await supabase.from("showman_profiles").insert({
      id: authData.user.id,
      name, email, city: city || null, state: state || null, club: club || null
    });
    setLoading(false);
    if (profileError) { setError("Account created but profile failed. Please contact support."); return; }
    onSignup();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Create Showman Account</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>Track your pigs, log weights, record show results — all in one place.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={labelStyle}>Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tyler Owens" style={inputStyle} autoFocus /></div>
            <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={labelStyle}>City</label><input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Abilene" style={inputStyle} /></div>
              <div><label style={labelStyle}>State</label><input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="TX" style={inputStyle} /></div>
            </div>
            <div><label style={labelStyle}>4-H / FFA Club (optional)</label><input type="text" value={club} onChange={e => setClub(e.target.value)} placeholder="Taylor County 4-H" style={inputStyle} /></div>
            <div><label style={labelStyle}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>
            <div><label style={labelStyle}>Confirm Password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} placeholder="••••••••" style={inputStyle} /></div>
            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>{error}</div>}
            <button className="btn btn-primary" onClick={handleSignup} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px", background: "var(--green)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  SHOWMAN LOGIN 
function ShowmanLogin({ onLogin, onBack, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError("Invalid email or password."); setLoading(false); return; }
    // Load showman profile
    const { data: profile } = await supabase.from("showman_profiles").select("*").eq("id", authData.user.id).single();
    setLoading(false);
    if (!profile) { setError("No showman account found. Please sign up first."); return; }
    onLogin(profile);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Showman Sign In</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>Access your pig tracking dashboard.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="you@example.com" style={inputStyle} autoFocus /></div>
            <div><label style={labelStyle}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={inputStyle} /></div>
            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>{error}</div>}
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px", background: "var(--green)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
              {loading ? "Signing in..." : "Enter Dashboard →"}
            </button>
            <button onClick={onSignup} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Space Grotesk', sans-serif", textAlign: "center", padding: "4px", fontWeight: 600 }}>
              No account? <span style={{ color: "var(--green)" }}>Sign up free →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  SHOWMAN DASHBOARD 

//  SHOWMAN TASKS 

export { ShowmanSignup, ShowmanLogin };
