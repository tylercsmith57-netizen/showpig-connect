// ─── STYLES & FORM STYLES ─────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: #06090F; --charcoal: #0D1117; --card-bg: #131A26; --surface: #1A2236;
    --border: #222D42; --blue: #1D4ED8; --blue-bright: #3B82F6; --blue-glow: rgba(29,78,216,0.3);
    --blue-dim: rgba(59,130,246,0.1); --text: #E8F0FF; --muted: #5C6B88; --subtle: #263049;
    --green: #10B981; --red: #EF4444; --amber: #F59E0B; --shadow: rgba(0,0,0,0.6);
  }
  body { background: var(--black); font-family: 'Space Grotesk', sans-serif; color: var(--text); }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
  ::selection { background: var(--blue); color: white; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: var(--charcoal); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .app { display: flex; min-height: 100vh; width: 100%; }
  .sidebar { width: 232px; min-width: 232px; background: var(--charcoal); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow: hidden; }
  .sidebar-brand { padding: 28px 22px 22px; border-bottom: 1px solid var(--border); position: relative; overflow: hidden; }
  .sidebar-brand::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%); }
  .sidebar-brand h1 { font-size: 1.4rem; line-height: 1.1; letter-spacing: -0.03em; background: linear-gradient(135deg, #ffffff 0%, var(--blue-bright) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .sidebar-brand p { font-size: 0.67rem; color: var(--muted); margin-top: 6px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500; }
  .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nav-section { padding: 14px 22px 4px; font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--subtle); font-weight: 700; }
  .nav-item { display: flex; align-items: center; gap: 11px; padding: 11px 22px; cursor: pointer; transition: all 0.15s; font-size: 0.875rem; font-weight: 500; color: var(--muted); border-left: 2px solid transparent; }
  .nav-item:hover { background: rgba(255,255,255,0.03); color: var(--text); }
  .nav-item.active { background: var(--blue-dim); color: var(--blue-bright); border-left-color: var(--blue-bright); }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
  .main { flex: 1; padding: 36px 44px; max-width: 1120px; overflow-y: auto; margin: 0 auto; }
  .page-header { margin-bottom: 32px; }
  .page-header h2 { font-size: 2rem; color: var(--text); letter-spacing: -0.04em; }
  .page-header p { color: var(--muted); margin-top: 5px; font-size: 0.875rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 14px; }
  .card { background: var(--card-bg); border-radius: 14px; padding: 22px 24px; border: 1px solid var(--border); cursor: pointer; transition: transform 0.18s, box-shadow 0.2s, border-color 0.2s; position: relative; overflow: hidden; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px var(--shadow), 0 0 0 1px rgba(59,130,246,0.5); border-color: rgba(59,130,246,0.5); }
  .card-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--blue-bright); margin-bottom: 7px; }
  .card h3 { font-size: 1.18rem; color: var(--text); margin-bottom: 4px; letter-spacing: -0.02em; }
  .card-meta { font-size: 0.8rem; color: var(--muted); margin-top: 2px; }
  .card-stats { display: flex; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .stat { text-align: center; flex: 1; min-width: 55px; padding: 2px 4px; }
  .stat + .stat { border-left: 1px solid var(--border); }
  .stat-val { font-size: 1.25rem; font-family: 'Syne', sans-serif; font-weight: 800; color: var(--blue-bright); }
  .stat-label { font-size: 0.62rem; color: var(--muted); letter-spacing: 0.07em; text-transform: uppercase; margin-top: 2px; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
  .badge-sold { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
  .badge-available { background: rgba(245,158,11,0.1); color: var(--amber); border: 1px solid rgba(245,158,11,0.22); }
  .badge-gilt { background: rgba(236,72,153,0.1); color: #f472b6; border: 1px solid rgba(236,72,153,0.22); }
  .badge-barrow { background: var(--blue-dim); color: var(--blue-bright); border: 1px solid rgba(59,130,246,0.3); }
  .detail-back { display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--blue-bright); font-size: 0.82rem; font-weight: 600; margin-bottom: 22px; }
  .detail-back:hover { color: var(--text); }
  .detail-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 28px; }
  .detail-header h2 { font-size: 2rem; letter-spacing: -0.04em; }
  .section-card { background: var(--card-bg); border-radius: 14px; padding: 22px 24px; margin-bottom: 14px; border: 1px solid var(--border); }
  .section-card h4 { font-size: 0.72rem; color: var(--blue-bright); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.12em; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
  .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .info-item label { display: block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 4px; font-weight: 600; }
  .info-item span { font-size: 0.92rem; font-weight: 500; color: var(--text); }
  table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
  th { text-align: left; padding: 9px 14px; background: var(--surface); color: var(--muted); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
  th:first-child { border-radius: 8px 0 0 8px; } th:last-child { border-radius: 0 8px 8px 0; }
  td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--text); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .dash-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(178px, 1fr)); gap: 14px; margin-bottom: 36px; }
  .dash-stat-card { background: var(--card-bg); border-radius: 14px; padding: 20px 22px; border: 1px solid var(--border); position: relative; overflow: hidden; }
  .dash-stat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--blue) 0%, transparent 80%); }
  .dash-stat-card .big { font-family: 'Syne', sans-serif; font-size: 2.4rem; font-weight: 800; color: var(--text); line-height: 1; }
  .dash-stat-card .label { font-size: 0.68rem; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; }
  .accent-bar { height: 2px; border-radius: 1px; background: linear-gradient(90deg, var(--blue), var(--blue-bright)); margin-bottom: 14px; }
  .lineage { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .lineage-box { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px; text-align: center; }
  .lineage-box .role { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--blue-bright); font-weight: 700; }
  .lineage-box .name { font-size: 0.92rem; font-weight: 600; margin-top: 3px; color: var(--text); }
  .lineage-arrow { font-size: 1rem; color: var(--subtle); }
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px; border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.84rem; font-weight: 600; transition: all 0.15s; }
  .btn-primary { background: var(--blue); color: white; box-shadow: 0 0 20px var(--blue-glow); }
  .btn-primary:hover { background: var(--blue-bright); transform: translateY(-1px); box-shadow: 0 4px 24px rgba(59,130,246,0.45); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--muted); }
  .btn-outline:hover { border-color: var(--blue-bright); color: var(--blue-bright); }
  .btn-danger { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
  .btn-danger:hover { background: rgba(239,68,68,0.2); }
  .btn-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: var(--green); }
  .btn-success:hover { background: rgba(16,185,129,0.25); }
  .empty { text-align: center; padding: 44px; color: var(--muted); font-size: 0.875rem; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(6,9,15,0.85); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal-box { background: var(--card-bg); border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px var(--border); max-height: 90vh; overflow-y: auto; }
  .modal-header { padding: 24px 28px 0; display: flex; justify-content: space-between; align-items: center; }
  .modal-header h3 { font-family: 'Syne', sans-serif; font-size: 1.3rem; color: var(--text); letter-spacing: -0.02em; }
  .modal-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: var(--muted); line-height: 1; padding: 4px; }
  .modal-body { padding: 20px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
  .tab-bar { display: flex; gap: 4px; background: var(--surface); border-radius: 10px; padding: 4px; border: 1px solid var(--border); margin-bottom: 24px; }
  .tab-btn { flex: 1; padding: 9px 12px; border-radius: 7px; border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 700; transition: all 0.15s; background: transparent; color: var(--muted); }
  .tab-btn.active { background: var(--blue-dim); color: var(--blue-bright); border: 1px solid rgba(59,130,246,0.25); }
  .report-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .report-kpi { background: var(--surface); border-radius: 10px; padding: 14px 16px; border: 1px solid var(--border); }
  .report-kpi .val { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; line-height: 1; }
  .report-kpi .lbl { font-size: 0.62rem; color: var(--muted); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; }
  .tag-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
`;

const labelStyle = { display: "block", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem", color: "var(--text)", background: "var(--surface)", outline: "none" };
const textareaStyle = { ...inputStyle, resize: "vertical", minHeight: 72 };

//  STATUS PILLS 

export { css, labelStyle, inputStyle, textareaStyle };
