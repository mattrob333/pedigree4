// Executive Risk Dashboard, Integration Map, Walkthrough overlay
const D = window.PEDIGREE_DATA;

// ============ EXECUTIVE RISK DASHBOARD ============
const DashboardScreen = ({ goScreen }) => {
  const s = D.stats;
  const platforms = {};
  D.agents.forEach(a => { platforms[a.platform] = (platforms[a.platform] || 0) + 1; });
  const platformList = Object.entries(platforms).sort((a, b) => b[1] - a[1]);

  const topRisks = D.findings.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 6);

  return (
    <div className="page scroll">
      <div className="page-head">
        <div>
          <div className="page-kicker">Executive view · Apex Industrial Group</div>
          <h1>Risk Dashboard</h1>
          <div className="page-sub">A snapshot of the agent workforce. Discovery, accountability, lifecycle, and audit readiness — in one view.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => goScreen('audit')}>Open Audit Packet</button>
          <button className="btn btn-primary" onClick={() => goScreen('org')}>Walk the org chart →</button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18}}>
        <div className="stat-card"><div className="label">Agents Discovered</div><div className="value">{s.total}</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>Across 8 platforms</div></div>
        <div className="stat-card"><div className="label">Mapped to Human Owner</div><div className="value" style={{color: 'var(--risk-low)'}}>{s.mapped}</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>{Math.round(s.mapped / s.total * 100)}% accountability</div></div>
        <div className="stat-card critical"><div className="label">Orphaned Agents</div><div className="value">{s.orphaned}</div><div style={{fontSize: 11.5, color: 'var(--risk-critical)', marginTop: 6}}>No human sponsor</div></div>
        <div className="stat-card high"><div className="label">High-Risk Agents</div><div className="value">{s.highRisk}</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>Critical or high severity</div></div>
        <div className="stat-card"><div className="label">Stale Access</div><div className="value">{s.stale}</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>No activity 7+ days</div></div>
        <div className="stat-card"><div className="label">Missing Approvals</div><div className="value" style={{color: 'var(--risk-high)'}}>{s.missingApprovals}</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>App-owner sign-off</div></div>
        <div className="stat-card"><div className="label">HR Events Active</div><div className="value">{s.hrExposed}</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>Pending lifecycle review</div></div>
        <div className="stat-card"><div className="label">Audit Readiness</div><div className="value" style={{color: 'var(--risk-medium)'}}>{s.auditReady}%</div><div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6}}>Evidence completeness</div></div>
      </div>

      <div className="dash-cta" style={{
        padding: '24px 28px',
        borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24
      }}>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#FCA5A5', marginBottom: 6}}>Sales conversation starter</div>
          <div style={{fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.15}}>
            Would you walk into an audit with <span style={{color: '#FCA5A5'}}>{s.orphaned} orphaned agents</span> still in production?
          </div>
        </div>
        <button className="btn btn-white" onClick={() => goScreen('risk')}>Show me the risks →</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18}}>
        <div className="card">
          <div className="card-head"><h3 style={{margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22, letterSpacing: '-0.01em'}}>Top risks</h3></div>
          <div className="card-body" style={{padding: 0}}>
            {topRisks.map(f => {
              const a = getAgent(f.agentId);
              return (
                <div key={f.id} style={{padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer'}} onClick={() => goScreen('risk')}>
                  <span className={`risk-dot risk-${f.severity}-bg`} style={{width: 10, height: 10}}/>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontWeight: 600, fontSize: 13.5, marginBottom: 2}}>{f.type}</div>
                    <div style={{fontSize: 12, color: 'var(--text-muted)'}}>{a.name} · {a.platform}</div>
                  </div>
                  <RiskChip risk={f.severity}/>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 style={{margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 22, letterSpacing: '-0.01em'}}>Agents by platform</h3></div>
          <div className="card-body">
            {platformList.map(([p, n]) => (
              <div key={p} style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
                <div style={{width: 130, fontSize: 13, fontWeight: 500}}>{p}</div>
                <div style={{flex: 1, height: 8, background: 'var(--slate-100)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{width: `${n / s.total * 100}%`, height: '100%', background: 'var(--pedigree-blue)'}}/>
                </div>
                <div style={{fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', width: 28, textAlign: 'right'}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ INTEGRATION MAP ============
const IntegrationsScreen = () => {
  const cats = [
    { title: 'HRIS & Identity', items: [
      { n: 'Workday', d: 'HRIS · 8 humans synced', s: 'Connected' },
      { n: 'Microsoft Entra ID', d: 'Identity · 512 identities', s: 'Connected' },
      { n: 'Okta', d: 'Identity · ready', s: 'Available' },
      { n: 'BambooHR', d: 'HRIS · ready', s: 'Available' },
    ]},
    { title: 'Agent Platforms', items: [
      { n: 'Microsoft Copilot Studio', d: '12 agents discovered', s: 'Connected' },
      { n: 'LangGraph', d: '4 agents discovered', s: 'Connected' },
      { n: 'Zapier', d: '3 agents discovered', s: 'Connected' },
      { n: 'Make', d: '3 agents discovered', s: 'Connected' },
      { n: 'GitHub Actions', d: '4 agents discovered', s: 'Connected' },
      { n: 'OpenAI / Azure OpenAI', d: 'API call inventory', s: 'Connected' },
      { n: 'MCP Workflows', d: '2 agents discovered', s: 'Connected' },
    ]},
    { title: 'Apps & Data', items: [
      { n: 'Salesforce', d: 'Approval routing active', s: 'Connected' },
      { n: 'NetSuite', d: 'Approval routing active', s: 'Connected' },
      { n: 'Snowflake', d: 'Read-only inventory', s: 'Connected' },
      { n: 'ServiceNow', d: 'Tickets + approvals', s: 'Connected' },
      { n: 'GitHub', d: 'Repo access map', s: 'Connected' },
      { n: 'HubSpot', d: 'Marketing apps', s: 'Connected' },
      { n: 'Slack', d: 'Channel posts inventory', s: 'Connected' },
    ]},
    { title: 'Internal & Custom', items: [
      { n: 'CSV import', d: 'Bulk agent registry', s: 'Available' },
      { n: 'Internal agent registries', d: 'Custom adapter', s: 'Available' },
      { n: 'REST API + Webhooks', d: 'Pedigree API', s: 'Available' },
    ]},
  ];

  return (
    <div className="page scroll">
      <div className="page-head">
        <div>
          <div className="page-kicker">Where Pedigree finds your agents</div>
          <h1>Integration Map</h1>
          <div className="page-sub">Pedigree ingests from agent platforms, identity providers, HRIS, and downstream apps. All ingestion is read-only first; enforcement is opt-in.</div>
        </div>
      </div>

      <div style={{
        background: '#F0FDF4', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10,
        padding: '14px 20px', marginBottom: 24, fontSize: 13.5, color: '#166534', display: 'flex', gap: 14, alignItems: 'center'
      }}>
        <div style={{width: 28, height: 28, borderRadius: '50%', background: 'var(--risk-low)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0}}>✓</div>
        <div><strong>Read-only by default.</strong> No agent runtime changes. No identity provider replacement. Pedigree sits beside Okta, Entra, Workday, and ServiceNow — never in front of them.</div>
      </div>

      {cats.map(c => (
        <div key={c.title} style={{marginBottom: 28}}>
          <h4 style={{fontFamily:'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-500)', margin: '0 0 12px', fontWeight: 500}}>{c.title}</h4>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
            {c.items.map(it => (
              <div key={it.n} className="source-card">
                <div className="source-icon">{it.n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="src-name">{it.n}</div>
                  <div className="src-status">{it.d}</div>
                </div>
                <span className="status-dot" style={{background: it.s === 'Connected' ? 'var(--risk-low)' : 'var(--slate-300)', boxShadow: it.s === 'Connected' ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none'}}/>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============ WALKTHROUGH OVERLAY ============
const Walkthrough = ({ step, setStep, onClose, goScreen, setRevealed, selectAgent }) => {
  const steps = [
    { title: 'Discovery', screen: 'dashboard', body: <>Pedigree found <strong>42 agents</strong> across Copilot Studio, LangGraph, Zapier, GitHub Actions, and 4 other platforms. Most enterprises have no central register.</>, cta: 'See lineage map' },
    { title: 'Lineage Mapping', screen: 'org', after: () => setRevealed(true), body: <><strong>31 agents</strong> are mapped to a human sponsor. <strong>11 are orphaned</strong> with no owner of record.</>, cta: 'Show me the orphans' },
    { title: 'Risk Finding', screen: 'risk', body: <>One agent has <strong>Snowflake write access and no sponsor</strong>. Another exports Salesforce data without app-owner approval. Six findings need review now.</>, cta: 'Simulate a termination' },
    { title: 'HR Event Simulation', screen: 'hr', body: <><strong>Jane Smith</strong> is leaving. Three of her agents would remain active unless reviewed. Pedigree cascades the lifecycle automatically.</>, cta: 'Generate evidence' },
    { title: 'Audit Packet', screen: 'audit', body: <>Export evidence for security, IAM, and external audit. Inventory, lineage, permissions, approvals, and remediation — one PDF.</>, cta: 'Finish walkthrough' },
  ];
  const s = steps[step];
  if (!s) return null;
  React.useEffect(() => {
    if (s) {
      goScreen(s.screen);
      if (s.after) setTimeout(s.after, 300);
    }
  }, [step]);

  return (
    <div className="walkthrough-popup" style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 60, width: 420,
      color: 'white', borderRadius: 14,
      boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
    }}>
      <div style={{padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{fontFamily: 'var(--font-mono)', fontSize: 11, color: '#93C5FD', letterSpacing: '0.1em', textTransform: 'uppercase'}}>
          Step {step + 1} of {steps.length}
        </div>
        <div style={{flex: 1, display: 'flex', gap: 4}}>
          {steps.map((_, i) => (
            <div key={i} style={{flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#3B82F6' : 'rgba(255,255,255,0.12)'}}/>
          ))}
        </div>
        <button onClick={onClose} style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, padding: 0}}>×</button>
      </div>
      <div style={{padding: '20px 22px 22px'}}>
        <div style={{fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.015em', marginBottom: 12, lineHeight: 1.1}}>{s.title}</div>
        <div style={{fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, marginBottom: 18}}>{s.body}</div>
        <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={{padding: '8px 14px', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, fontSize: 13, cursor: 'pointer'}}>Back</button>}
          <button onClick={() => step === steps.length - 1 ? onClose() : setStep(step + 1)} className="btn btn-white" style={{marginLeft: 'auto'}}>{s.cta} →</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DashboardScreen, IntegrationsScreen, Walkthrough });
