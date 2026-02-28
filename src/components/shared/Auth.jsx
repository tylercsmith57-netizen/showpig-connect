import { useState } from "react";
import { supabase } from '../../supabaseClient';
import { css, labelStyle, inputStyle } from '../../lib/styles';

function CustomerPortal({ customer, data, onUpdatePig, onLogout }) {
  const myPigs = (customer.pigIds || []).map(id => data.pigs.find(p => p.id === id)).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <style>{css}</style>
      {/* Top bar */}
      <div style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #fff 0%, var(--blue-bright) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ShowPig Connect</div>
          <div style={{ width: 1, height: 18, background: "var(--border)" }} />
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>My Pigs</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>{customer.name}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{customer.club || customer.city}</div>
          </div>
          
          <button onClick={onLogout} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 12px" }}>Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 6 }}>Welcome back</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8 }}>Hey, {customer.name.split(" ")[0]}</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {data.farm.name} · {myPigs.length} pig{myPigs.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>

        {myPigs.length === 0 ? (
          <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "60px 40px", textAlign: "center" }}>
            
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>No Pigs Assigned Yet</div>
            <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>Your breeder hasn't assigned any pigs to your account yet. Check back soon!</div>
          </div>
        ) : (
          myPigs.map((pig, i) => (
            <CustomerPigCard key={pig.id} pig={pig} data={data} onUpdatePig={onUpdatePig} defaultOpen={myPigs.length === 1 || i === 0} />
          ))
        )}
      </div>
    </div>
  );
}

//  CUSTOMER LOGIN 
function CustomerLogin({ data, onLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!name.trim() || !email.trim()) { setError("Please enter both your name and email address."); return; }
    setLoading(true);
    setTimeout(() => {
      const match = data.showmen.find(sm =>
        sm.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        sm.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      setLoading(false);
      if (match) { onLogin(match); }
      else { setError("No account found matching that name and email. Contact your breeder to confirm your details."); }
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}></div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Customer Sign In</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>Enter the name and email your breeder has on file for you.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Tyler Owens" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="tyler@example.com" style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)", lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px" }}>
              {loading ? "Checking..." : "View My Pigs →"}
            </button>
          </div>
          <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--surface)", borderRadius: 8, fontSize: "0.73rem", color: "var(--muted)", lineHeight: 1.6, textAlign: "center" }}>
            <strong style={{ color: "var(--text)" }}>Demo credentials:</strong><br />
            Name: <em>Tyler Owens</em> · Email: <em>tyler@example.com</em>
          </div>
        </div>
      </div>
    </div>
  );
}

//  PASSWORD RESET MODAL 
function PasswordResetModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/?reset=true",
    });
    setLoading(false);
    if (error) { setError(error.message); } else { setSent(true); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>Reset Password</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {sent ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>📬</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Check your email</div>
              <div style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                We sent a password reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click the link in the email to set a new password.
              </div>
              <button className="btn btn-outline" onClick={onClose} style={{ marginTop: 20 }}>Close</button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "0.84rem", color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
                Enter your account email and we'll send you a link to reset your password.
              </p>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReset()} placeholder="you@example.com" style={inputStyle} autoFocus />
              </div>
              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleReset} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

//  BREEDER LOGIN 
function BreederLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Invalid email or password.");
    } else {
      onLogin();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Breeder Sign In</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>
              Access your full farm management dashboard.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="you@example.com" style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px" }}>
              {loading ? "Signing in..." : "Enter Dashboard →"}
            </button>
            <button onClick={() => setShowReset(true)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Space Grotesk', sans-serif", textAlign: "center", padding: "2px 0", textDecoration: "underline" }}>
              Forgot password?
            </button>
          </div>
        </div>
      </div>
      {showReset && <PasswordResetModal onClose={() => setShowReset(false)} />}
    </div>
  );
}
function BreederSignup({ onSignup, onBack }) {
  const [farmName, setFarmName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!farmName.trim()) { setError("Please enter your farm name."); return; }
    if (!ownerName.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { farm_name: farmName, full_name: ownerName } }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onSignup();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Create Your Account</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>Start your 14-day free trial. No credit card required.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Farm Name</label>
              <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="e.g. Ridgeline Show Pigs" style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Jake Harmon" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignup()} placeholder="••••••••" style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSignup} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px" }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  LANDING PAGE 
function LandingPage({ onSelectBreeder, onSelectCustomer, onSignup, onSignupShowman }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(29,78,216,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 300, height: 200, background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 52, position: "relative" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.4rem, 6vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, background: "linear-gradient(135deg, #ffffff 0%, var(--blue-bright) 60%, #93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>
          ShowPig Connect
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: 380, margin: "0 auto", lineHeight: 1.7 }}>
          Farm management & showman portal for show pig breeders.
        </p>
      </div>

      {/* Role selection */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, width: "100%", maxWidth: 640, position: "relative" }}>
        {/* Breeder column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onSelectBreeder} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 28px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "left", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(29,78,216,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 140, height: 140, background: "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 8 }}>For the Breeder</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 10 }}>Breeder Dashboard</div>
            <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
              Full farm management — sow herd, breeding cycles, litters, financials, and customer management.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--blue-bright)", fontSize: "0.82rem", fontWeight: 700 }}>
              Sign In <span style={{ fontSize: "1rem" }}>→</span>
            </div>
          </button>
          <button onClick={onSignup} style={{ background: "transparent", border: "1px dashed var(--border)", borderRadius: 20, padding: "16px 28px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "center", transition: "all 0.2s", color: "var(--muted)", fontSize: "0.84rem", fontWeight: 600 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue-bright)"; e.currentTarget.style.color = "var(--blue-bright)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
            New breeder? <strong style={{ color: "var(--blue-bright)" }}>Create a free account →</strong>
          </button>
        </div>

        {/* Showman column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onSelectCustomer} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 28px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "left", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(16,185,129,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 140, height: 140, background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--green)", marginBottom: 8 }}>For the Showman</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 10 }}>Showman Portal</div>
            <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
              Track your pigs, log weights, record feed programs, vaccinations, and show results.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: "0.82rem", fontWeight: 700 }}>
              Sign In <span style={{ fontSize: "1rem" }}>→</span>
            </div>
          </button>
          <button onClick={onSignupShowman} style={{ background: "transparent", border: "1px dashed var(--border)", borderRadius: 20, padding: "16px 28px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "center", transition: "all 0.2s", color: "var(--muted)", fontSize: "0.84rem", fontWeight: 600 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.color = "var(--green)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
            New showman? <strong style={{ color: "var(--green)" }}>Create a free account →</strong>
          </button>
        </div>
      </div>

      <div style={{ marginTop: 36, fontSize: "0.72rem", color: "var(--subtle)", textAlign: "center" }}>
        Secure access · Customers only see their own pigs
      </div>
    </div>
  );
}


function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => onDone(), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>✓</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>Password Updated</div>
              <div style={{ color: "var(--muted)", fontSize: "0.84rem" }}>Redirecting you to sign in...</div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Set New Password</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>Choose a new password for your account.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} autoFocus />
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} placeholder="••••••••" style={inputStyle} />
                </div>
                {error && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>
                    {error}
                  </div>
                )}
                <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: "100%", justifyContent: "center", fontSize: "0.9rem", padding: "12px", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Saving..." : "Save New Password →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

//  APP SHELL 
// Portal state: "landing" | "breeder-login" | "breeder-signup" | "breeder" | "showman-login" | "showman-signup" | "showman" | "customer-login" | "customer"

export { CustomerLogin, BreederLogin, BreederSignup, LandingPage, CustomerPortal, ResetPasswordScreen };
