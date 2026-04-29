// Shared components for Pedigree demo
const { useState, useEffect, useMemo, useRef } = React;

const D = window.PEDIGREE_DATA;

// ============ ICONS ============
const Icon = ({ name, size = 16 }) => {
  const s = size;
  const stroke = "currentColor";
  const icons = {
    org: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 12h14v5M12 12v5"/></svg>,
    risk: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>,
    hr: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 11 2 2 4-4"/></svg>,
    approval: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>,
    audit: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M10 13h4M10 17h4M8 9h2"/></svg>,
    settings: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
    dashboard: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
    integrations: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m7 7 3 3M17 7l-3 3M7 17l3-3M17 17l-3-3"/></svg>,
    bot: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M9 14h.01M15 14h.01M2 14h2M20 14h2"/></svg>,
    export: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/></svg>,
    search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    chev: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
    arrow: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  };
  return icons[name] || null;
};

// ============ TOAST CONTEXT ============
const ToastCtx = React.createContext({ add: () => {} });
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const add = (msg) => {
    const id = Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3400);
  };
  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className="toast"><span className="t-icon">✓</span>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => React.useContext(ToastCtx);

// ============ CHIPS & HELPERS ============
const RiskChip = ({ risk }) => {
  const label = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical', unknown: 'Unknown' }[risk];
  return <span className={`chip risk-${risk}`}>{label}</span>;
};
const PlatformChip = ({ platform }) => <span className="chip neutral">{platform}</span>;

// ============ HUMAN NODE ============
const HumanNode = ({ human, selected, onSelect, compact }) => (
  <div
    className={`hnode ${selected ? 'selected' : ''} ${human.highlight ? 'highlighted' : ''}`}
    onClick={() => onSelect(human.id)}
  >
    <div className="avatar">{human.initials}</div>
    <div className="hnode-main">
      <div className="hnode-name">{human.name}</div>
      <div className="hnode-role">{human.role}</div>
      {!compact && (
        <div className="hnode-meta">
          <span className="dept-chip">{human.dept}</span>
          <span className="hnode-count">{human.subtree} {human.subtree === 1 ? 'agent' : 'agents'}</span>
        </div>
      )}
    </div>
  </div>
);

// ============ AGENT NODE ============
const AgentNode = ({ agent, selected, onSelect, suspended }) => (
  <div
    className={`anode risk-${agent.risk} ${selected ? 'selected' : ''} ${suspended ? 'suspended' : ''}`}
    onClick={(e) => { e.stopPropagation(); onSelect(agent.id); }}
  >
    <div className="bot"><Icon name="bot" size={13} /></div>
    <span className="aname">{agent.name}</span>
    <span className="platform">{agent.platform}</span>
    <span className={`risk-dot risk-${agent.risk}-bg`}></span>
  </div>
);

// ============ TOPBAR ============
const TopBar = ({ scenario, setScenario, goScreen }) => {
  const [scenOpen, setScenOpen] = useState(false);
  const toast = useToast();
  const scenarios = [
    { id: 'pre-audit', name: 'Pre-Audit Agent Review', sub: 'Inventory + risk posture' },
    { id: 'termination', name: 'Employee Termination', sub: 'Jane Smith · HR cascade' },
    { id: 'approvals', name: 'App Owner Approval Queue', sub: 'Salesforce + Finance' },
  ];
  const current = scenarios.find(s => s.id === scenario) || scenarios[0];
  return (
    <div className="topbar">
      <div className="tb-logo">
        <span className="logo-mark"></span>
        Pedigree
      </div>
      <span className="tb-env">Demo Workspace</span>
      <a href="index.html" className="tb-back">← Website</a>
      <div className="tb-search">
        <Icon name="search" size={14} />
        <span>Search humans, agents, apps, findings…</span>
        <span className="kbd">⌘K</span>
      </div>
      <div className="tb-right">
        <div className="dropdown">
          <div className="tb-scenario" onClick={() => setScenOpen(o => !o)}>
            <span style={{opacity:0.5, fontFamily:'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Scenario</span>
            <span>{current.name}</span>
            <span className="chev">▾</span>
          </div>
          {scenOpen && (
            <div className="dropdown-menu" onMouseLeave={() => setScenOpen(false)}>
              {scenarios.map(s => (
                <div
                  key={s.id}
                  className={`dd-item ${scenario === s.id ? 'active' : ''}`}
                  onClick={() => { setScenario(s.id); setScenOpen(false); }}
                >
                  <div>{s.name}</div>
                  <div className="dd-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="tb-export" onClick={() => { toast.add('Evidence packet generated.'); goScreen('audit'); }}>
          Export Packet
        </button>
        <div className="tb-avatar">MS</div>
      </div>
    </div>
  );
};

// ============ SIDEBAR ============
const Sidebar = ({ screen, setScreen, startWalkthrough }) => {
  const items = [
    { id: 'dashboard', label: 'Risk Dashboard', icon: 'dashboard' },
    { id: 'org', label: 'Agent Org Chart', icon: 'org' },
    { id: 'risk', label: 'Risk Findings', icon: 'risk', badge: D.findings.length },
    { id: 'hr', label: 'HR Simulation', icon: 'hr' },
    { id: 'approvals', label: 'Approvals', icon: 'approval', badge: 3 },
    { id: 'audit', label: 'Audit Packet', icon: 'audit' },
    { id: 'integrations', label: 'Integrations', icon: 'integrations' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  return (
    <div className="sidebar">
      <div className="sb-section">Workspace</div>
      {items.map(it => (
        <div
          key={it.id}
          className={`nav-item ${screen === it.id ? 'active' : ''}`}
          onClick={() => setScreen(it.id)}
        >
          <span className="icon"><Icon name={it.icon} size={15} /></span>
          <span>{it.label}</span>
          {it.badge && <span className="badge">{it.badge}</span>}
        </div>
      ))}
      <div style={{marginTop: 14, padding: '0 10px'}}>
        <button onClick={startWalkthrough} style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          background: 'var(--pedigree-blue-soft)', color: 'var(--pedigree-blue-dark)',
          fontSize: 12.5, fontWeight: 600, border: '1px solid rgba(59,130,246,0.2)',
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
        }}>
          ▶ Start Risk Walkthrough
        </button>
      </div>
      <div className="sb-foot">
        <div style={{fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-400)', marginBottom: 6}}>Workspace</div>
        <div style={{fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2}}>Apex Industrial Group</div>
        <div>{D.humans.length} humans · {D.agents.length} agents</div>
      </div>
    </div>
  );
};

// Export to window for cross-file scope
Object.assign(window, {
  Icon, ToastProvider, useToast, RiskChip, PlatformChip,
  HumanNode, AgentNode, TopBar, Sidebar, D,
  getHuman: window.getHuman, getAgent: window.getAgent
});
