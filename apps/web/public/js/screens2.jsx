// Risk Findings, HR Sim, Approvals, Audit, Settings screens

// ============ RISK FINDINGS ============
const RiskFindingsScreen = ({ goScreen, onSelectAgent, filter, setFilter }) => {
  const toast = useToast();
  const stats = {
    total: D.agents.length,
    critical: D.findings.filter(f => f.severity === 'critical').length,
    high: D.findings.filter(f => f.severity === 'high').length,
    orphaned: D.agents.filter(a => !a.parent).length,
    missingApprovals: D.findings.filter(f => f.type.toLowerCase().includes('approval')).length,
    hrExposure: 1,
  };

  const filters = ['all', 'critical', 'high', 'orphaned', 'over-permissioned', 'missing-approval', 'stale', 'hr-event'];
  const filterLabels = { all:'All', critical:'Critical', high:'High', orphaned:'Orphaned', 'over-permissioned':'Over-permissioned', 'missing-approval':'Missing Approval', stale:'Stale', 'hr-event':'HR Event' };

  const filteredFindings = D.findings.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'critical' || filter === 'high') return f.severity === filter;
    if (filter === 'orphaned') return f.type.toLowerCase().includes('orphan');
    if (filter === 'over-permissioned') return f.type.toLowerCase().includes('exceed');
    if (filter === 'missing-approval') return f.type.toLowerCase().includes('approval');
    if (filter === 'stale') return f.type.toLowerCase().includes('exception') || f.type.toLowerCase().includes('expire');
    if (filter === 'hr-event') return false;
    return true;
  });

  return (
    <div className="page scroll">
      <div className="page-head">
        <div>
          <div className="page-kicker">Security &amp; IAM view</div>
          <h1>Risk Findings</h1>
          <div className="page-sub">Prioritized actions across the agent workforce. Every finding maps back to a human owner and a recommended remediation.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => { toast.add('CSV export generated.'); }}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => goScreen('audit')}>Open Audit Packet</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="label">Total Agents</div><div className="value">{stats.total}</div></div>
        <div className="stat-card critical"><div className="label">Critical</div><div className="value">{stats.critical}</div></div>
        <div className="stat-card high"><div className="label">High</div><div className="value">{stats.high}</div></div>
        <div className="stat-card"><div className="label">Orphaned</div><div className="value">{stats.orphaned}</div></div>
        <div className="stat-card"><div className="label">Missing Approvals</div><div className="value">{stats.missingApprovals}</div></div>
        <div className="stat-card"><div className="label">HR Exposure</div><div className="value">{stats.hrExposure}</div></div>
      </div>

      <div className="filter-chips">
        {filters.map(f => (
          <div key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{filterLabels[f]}</div>
        ))}
      </div>

      <div className="findings-table">
        <table>
          <thead>
            <tr>
              <th style={{width: 110}}>Severity</th>
              <th>Finding</th>
              <th>Agent</th>
              <th>Human parent</th>
              <th>App owner</th>
              <th>Evidence</th>
              <th>Recommended action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFindings.map(f => {
              const agent = getAgent(f.agentId);
              const parent = f.parentId ? getHuman(f.parentId) : null;
              const appOwner = agent.apps.map(app => D.appOwners[app]).find(x => x);
              return (
                <tr key={f.id} onClick={() => onSelectAgent(f.agentId)}>
                  <td><div className="sev-cell"><span className={`risk-dot risk-${f.severity}-bg`}></span>{f.severity[0].toUpperCase() + f.severity.slice(1)}</div></td>
                  <td style={{fontWeight: 500}}>{f.type}</td>
                  <td>{agent.name}</td>
                  <td>{parent ? parent.name : <span style={{color: 'var(--risk-critical)'}}>Unknown</span>}</td>
                  <td>{appOwner ? getHuman(appOwner).name : 'Data Platform'}</td>
                  <td><div className="evidence">{f.evidence}</div></td>
                  <td className="action-cell">{f.action}</td>
                  <td>
                    <a className="link-action" onClick={(e) => { e.stopPropagation(); goScreen('approvals'); toast.add('Opened approval queue.'); }}>
                      Route →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============ HR SIMULATION ============
const HRSimScreen = ({ goScreen, onSuspend }) => {
  const toast = useToast();
  const [running, setRunning] = uS(false);
  const [step, setStep] = uS(0);
  const [human, setHuman] = uS('h5');
  const [event, setEvent] = uS('Termination');
  const [policy, setPolicy] = uS('Recommended actions');

  const run = () => {
    setRunning(true);
    setStep(0);
    const run = (s) => {
      if (s > 5) return;
      setStep(s);
      setTimeout(() => run(s + 1), 750);
    };
    run(1);
  };

  const humanObj = getHuman(human);
  const children = D.agents.filter(a => a.parent === human);

  return (
    <div className="page scroll">
      <div className="page-head">
        <div>
          <div className="page-kicker">Lifecycle cascade</div>
          <h1>HR Event Simulation</h1>
          <div className="page-sub">See what happens to child agents when a human leaves, changes roles, or moves teams — before the event lands.</div>
        </div>
      </div>

      <div className="sim-controls">
        <div className="sim-field">
          <label>Human</label>
          <select value={human} onChange={e => { setHuman(e.target.value); setRunning(false); setStep(0); }}>
            {D.humans.filter(h => D.agents.some(a => a.parent === h.id)).map(h => (
              <option key={h.id} value={h.id}>{h.name} · {h.role}</option>
            ))}
          </select>
        </div>
        <div className="sim-field">
          <label>Event type</label>
          <select value={event} onChange={e => setEvent(e.target.value)}>
            <option>Termination</option>
            <option>Role Change</option>
            <option>Leave of Absence</option>
            <option>Team Transfer</option>
          </select>
        </div>
        <div className="sim-field">
          <label>Effective date</label>
          <input type="text" defaultValue="Friday, May 15, 2026"/>
        </div>
        <div className="sim-field">
          <label>Policy mode</label>
          <select value={policy} onChange={e => setPolicy(e.target.value)}>
            <option>Audit-only</option>
            <option>Recommended actions</option>
            <option>Enforcement-ready</option>
          </select>
        </div>
        <button className="btn btn-accent" onClick={run} style={{padding: '11px 22px'}}>{running ? 'Re-run Simulation' : 'Run Simulation'} →</button>
      </div>

      {running && (
        <div className="stepper">
          <div className={`step-card ${step >= 1 ? (step > 1 ? 'complete' : 'active') : ''}`}>
            <div className="step-head"><div className="step-num">1</div><h4>HR event received</h4></div>
            <div className="step-body">
              <div><strong>{humanObj.name}</strong> marked <span className="chip risk-high" style={{marginLeft: 4}}>{event} Pending</span></div>
              <ul>
                <li>Manager resolved: {getHuman(humanObj.manager)?.name || '—'}</li>
                <li>Department: {humanObj.dept}</li>
                <li>Effective date: Friday, May 15, 2026</li>
              </ul>
            </div>
          </div>

          <div className={`step-card ${step >= 2 ? (step > 2 ? 'complete' : 'active') : ''}`}>
            <div className="step-head"><div className="step-num">2</div><h4>Agent subtree discovered</h4></div>
            <div className="step-body">
              <div><strong>{children.length}</strong> child agent{children.length === 1 ? '' : 's'} found</div>
              <ul>{children.map(c => <li key={c.id}>{c.name} · {c.platform}</li>)}</ul>
            </div>
          </div>

          <div className={`step-card ${step >= 3 ? (step > 3 ? 'complete' : 'active') : ''}`}>
            <div className="step-head"><div className="step-num">3</div><h4>Permission &amp; approval evaluation</h4></div>
            <div className="step-body">
              <ul>
                <li>1 agent exceeds parent scope</li>
                <li>1 agent missing app-owner approval</li>
                <li>2 agents eligible for sponsor transfer</li>
                <li>1 agent eligible for immediate suspension</li>
              </ul>
            </div>
          </div>

          <div className={`step-card ${step >= 4 ? (step > 4 ? 'complete' : 'active') : ''}`}>
            <div className="step-head"><div className="step-num">4</div><h4>Recommended lifecycle actions</h4></div>
            <div className="step-body">
              <table className="rec-table">
                <thead><tr><th>Agent</th><th>Action</th><th>Reason</th></tr></thead>
                <tbody>
                  <tr><td>Renewal Email Agent</td><td><span className="chip blue">Transfer → Marcus Reed</span></td><td>Business purpose still valid; approvals current.</td></tr>
                  <tr><td>Forecast Cleanup Agent</td><td><span className="chip risk-critical">Suspend immediately</span></td><td>Over-permissioned and missing Salesforce approval.</td></tr>
                  <tr><td>Quote Review Agent</td><td><span className="chip blue">Transfer → Marcus Reed</span></td><td>Approved low-risk workflow.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={`step-card ${step >= 5 ? 'complete' : ''}`}>
            <div className="step-head"><div className="step-num">5</div><h4>Evidence generated</h4></div>
            <div className="step-body">
              <ul>
                <li>HR event record</li>
                <li>Agent ownership impact</li>
                <li>Permission comparison</li>
                <li>Approval requirements</li>
                <li>Recommended actions</li>
                <li>Export packet available</li>
              </ul>
            </div>
          </div>

          {step >= 5 && (
            <div className="sim-final">
              <div className="sim-final-copy">
                <strong>Jane's termination</strong> impacts 3 active agents. Pedigree recommends <strong>suspending 1</strong>, <strong>transferring 2</strong>, and routing <strong>1 Salesforce approval</strong> before reassignment.
              </div>
              <div className="sim-final-actions">
                <button className="btn btn-white" onClick={() => { onSuspend('a2'); toast.add('Forecast Cleanup Agent suspended.'); }}>Apply recommendations</button>
                <button className="btn btn-ghost" style={{color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent'}} onClick={() => goScreen('audit')}>Open Audit Packet</button>
                <button className="btn btn-ghost" style={{color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'transparent'}} onClick={() => goScreen('approvals')}>View Approvals</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!running && (
        <div className="card" style={{padding: '40px', textAlign: 'center'}}>
          <div style={{fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-400)', marginBottom: 14}}>Simulation idle</div>
          <div style={{fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 8}}>Pick a human and click <em>Run Simulation</em>.</div>
          <div style={{fontSize: 14, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto'}}>Pedigree walks the agent subtree, evaluates permissions, and recommends suspension, transfer, or approval routing — before the HR event takes effect.</div>
        </div>
      )}
    </div>
  );
};

// ============ APPROVALS ============
const ApprovalsScreen = () => {
  const toast = useToast();
  const [tab, setTab] = uS('pending');
  const [statuses, setStatuses] = uS({ c1: 'pending', c2: 'pending', c3: 'pending' });

  const act = (id, next, msg) => {
    setStatuses(s => ({ ...s, [id]: next }));
    toast.add(msg);
  };

  const cards = [
    {
      id: 'c1',
      title: 'Salesforce export approval required',
      sub: 'Forecast Cleanup Agent · Jane Smith',
      status: statuses.c1,
      meta: [
        { k: 'Agent', v: 'Forecast Cleanup Agent' },
        { k: 'Requested scope', v: 'Salesforce: export opportunities' },
        { k: 'Human parent', v: 'Jane Smith' },
        { k: 'App owner', v: 'Omar Patel' },
      ],
      evidence: [
        'Parent (Jane Smith) does not have export entitlement',
        'Agent last used export action 18 minutes ago',
        'Business purpose: Forecast cleanup',
        'HR event pending for parent — simulation run Apr 22',
      ],
      actions: [
        { label: 'Approve exception', kind: 'btn-success', onClick: () => act('c1', 'approved', 'Approved exception · expires in 30 days. Notified Jane Smith.') },
        { label: 'Reject', kind: 'btn-danger', onClick: () => act('c1', 'rejected', 'Rejected · finding re-opened.') },
        { label: 'Request more info', kind: 'btn-ghost', onClick: () => toast.add('Comment thread created.') },
      ],
    },
    {
      id: 'c2',
      title: 'Finance secondary approval required',
      sub: 'Invoice Match Agent · Nina Brooks',
      status: statuses.c2,
      meta: [
        { k: 'Agent', v: 'Invoice Match Agent' },
        { k: 'Requested action', v: 'NetSuite: update invoice status' },
        { k: 'Human parent', v: 'Nina Brooks' },
        { k: 'App owner', v: 'Priya Nair (Finance)' },
      ],
      evidence: [
        'Finance approval present; payment action approval missing',
        'Agent processed 412 invoices in last 7 days',
        'Exceeds $10,000 threshold for single approver',
      ],
      actions: [
        { label: 'Approve', kind: 'btn-success', onClick: () => act('c2', 'approved', 'Approved · single approver sufficient.') },
        { label: 'Require dual control', kind: 'btn-accent', onClick: () => act('c2', 'approved', 'Dual control enforced. Routed to Evelyn Carter.') },
        { label: 'Reject', kind: 'btn-danger', onClick: () => act('c2', 'rejected', 'Rejected · agent suspended.') },
      ],
    },
    {
      id: 'c3',
      title: 'Orphaned Snowflake write access',
      sub: 'Legacy Data Cleanup Agent · no sponsor',
      status: statuses.c3,
      meta: [
        { k: 'Agent', v: 'Legacy Data Cleanup Agent' },
        { k: 'Requested action', v: 'Snowflake: update account metadata' },
        { k: 'Human parent', v: 'Unknown' },
        { k: 'App owner', v: 'Data Platform Owner' },
      ],
      evidence: [
        'No human sponsor; active 47 days without review',
        'Running as service account svc-legacy-cleanup',
        'Last created 2023 by former employee (deprovisioned)',
      ],
      actions: [
        { label: 'Disable', kind: 'btn-danger', onClick: () => act('c3', 'rejected', 'Agent disabled. Finding resolved.') },
        { label: 'Assign sponsor', kind: 'btn-accent', onClick: () => act('c3', 'approved', 'Sponsor assigned → Evelyn Carter (interim).') },
        { label: 'Request investigation', kind: 'btn-ghost', onClick: () => toast.add('Investigation ticket created in ServiceNow.') },
      ],
    },
  ];

  const pending = cards.filter(c => c.status === 'pending');
  const approved = cards.filter(c => c.status === 'approved');
  const rejected = cards.filter(c => c.status === 'rejected');
  const visibleCards = tab === 'pending' ? pending : tab === 'approved' ? approved : tab === 'rejected' ? rejected : [];

  return (
    <div className="page scroll">
      <div className="page-head">
        <div>
          <div className="page-kicker">App owner workflow</div>
          <h1>Approval Queue</h1>
          <div className="page-sub">Approvals routed from the lineage graph. App owners see exactly what's being requested, why it's out-of-bounds, and who's asking.</div>
        </div>
      </div>

      <div className="approval-tabs">
        <div className={`approval-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending <span className="count">{pending.length}</span></div>
        <div className={`approval-tab ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>Approved <span className="count">{approved.length}</span></div>
        <div className={`approval-tab ${tab === 'rejected' ? 'active' : ''}`} onClick={() => setTab('rejected')}>Rejected <span className="count">{rejected.length}</span></div>
        <div className={`approval-tab ${tab === 'expiring' ? 'active' : ''}`} onClick={() => setTab('expiring')}>Expiring Exceptions <span className="count">1</span></div>
      </div>

      {visibleCards.map(c => (
        <div key={c.id} className={`approval-card ${c.status}`}>
          <div className="ac-head">
            <div className="ac-title-wrap">
              <h3 className="ac-title">{c.title}</h3>
              <div className="ac-sub">{c.sub}</div>
            </div>
            {c.status !== 'pending' && (
              <span className={`ac-status-badge ${c.status}`}>{c.status === 'approved' ? '✓ Approved' : '✕ Rejected'}</span>
            )}
          </div>
          <div className="ac-meta-grid">
            {c.meta.map((m, i) => (
              <div key={i} className="ac-meta">
                <div className="k">{m.k}</div>
                <div className="v">{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-500)', marginBottom: 8, fontWeight: 500}}>Evidence</div>
          <ul className="ac-evidence">
            {c.evidence.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
          {c.status === 'pending' && (
            <div className="ac-actions">
              {c.actions.map((a, i) => (
                <button key={i} className={`btn ${a.kind}`} onClick={a.onClick}>{a.label}</button>
              ))}
            </div>
          )}
        </div>
      ))}

      {tab === 'expiring' && (
        <div className="approval-card">
          <div className="ac-head">
            <div className="ac-title-wrap">
              <h3 className="ac-title">Exception expiring soon</h3>
              <div className="ac-sub">Payment Exception Agent · Nina Brooks</div>
            </div>
            <span className="chip risk-medium">14 days</span>
          </div>
          <div className="ac-meta-grid">
            <div className="ac-meta"><div className="k">Approved</div><div className="v">Apr 8, 2026</div></div>
            <div className="ac-meta"><div className="k">Expires</div><div className="v">May 7, 2026</div></div>
            <div className="ac-meta"><div className="k">Approver</div><div className="v">Priya Nair</div></div>
            <div className="ac-meta"><div className="k">Scope</div><div className="v">Slack finance channel</div></div>
          </div>
          <div className="ac-actions">
            <button className="btn btn-success" onClick={() => toast.add('Exception renewed for 90 days.')}>Renew</button>
            <button className="btn btn-danger" onClick={() => toast.add('Exception revoked.')}>Revoke</button>
          </div>
        </div>
      )}

      {visibleCards.length === 0 && tab !== 'expiring' && (
        <div className="card" style={{padding: 40, textAlign: 'center', color: 'var(--text-muted)'}}>
          <div style={{fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text)', marginBottom: 6}}>No items in {tab}.</div>
          <div style={{fontSize: 13.5}}>Decisions routed from the org chart will appear here.</div>
        </div>
      )}
    </div>
  );
};

// ============ AUDIT PACKET ============
const AuditPacketScreen = () => {
  const toast = useToast();
  const [section, setSection] = uS(0);
  const sections = [
    'Executive summary',
    'Agent inventory',
    'Human lineage map',
    'Permission comparison',
    'HR lifecycle simulation',
    'App-owner approvals',
    'Exceptions and expirations',
    'Recommended remediation',
  ];

  return (
    <div className="page scroll">
      <div className="page-head">
        <div>
          <div className="page-kicker">Deliverable</div>
          <h1>Audit Evidence Packet</h1>
          <div className="page-sub">Generated from the current Apex Industrial agent lineage graph. Structured for security, IAM, app owners, and external auditors.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => toast.add('CSV export generated.')}>Export CSV</button>
          <button className="btn btn-ghost" onClick={() => toast.add('Evidence sent to 4 app owners.')}>Send to App Owners</button>
          <button className="btn btn-primary" onClick={() => toast.add('Demo export generated.')}>Download PDF</button>
        </div>
      </div>

      <div className="audit-layout">
        <div className="packet-nav">
          <h4>Packet sections</h4>
          {sections.map((s, i) => (
            <div key={i} className={`pn-item ${section === i ? 'active' : ''}`} onClick={() => setSection(i)}>
              <span className="pn-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="packet-doc">
          <div className="packet-doc-head">
            <div>
              <div style={{fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-500)', marginBottom: 6}}>Pedigree Evidence Packet · v0.9</div>
              <h3>Apex Industrial Group — Agent Lineage Audit</h3>
              <div className="meta">GENERATED APR 23, 2026 · SCOPE: REVENUE, FINANCE, HR OPS</div>
            </div>
            <div className="seal">Audit<br/>Ready</div>
          </div>

          <div className="packet-page">
            {section === 0 && (
              <>
                <h4>Executive summary</h4>
                <p>Pedigree identified <strong>9 active agents</strong> across Apex Industrial Group. <strong>1 agent is orphaned</strong>, <strong>2 agents exceed their parent's permission boundary</strong>, and <strong>3 agent actions require app-owner approval</strong>. A simulated termination of Jane Smith impacts <strong>3 active child agents</strong> and requires <strong>1 immediate suspension</strong>.</p>

                <div className="packet-summary-grid">
                  <div><div className="ps-label">Agents reviewed</div><div className="ps-value">9</div></div>
                  <div><div className="ps-label">Human owners</div><div className="ps-value">8</div></div>
                  <div><div className="ps-label">Open findings</div><div className="ps-value">6</div></div>
                  <div><div className="ps-label">Critical findings</div><div className="ps-value critical">2</div></div>
                  <div><div className="ps-label">Missing approvals</div><div className="ps-value">3</div></div>
                  <div><div className="ps-label">HR exposure</div><div className="ps-value">1</div></div>
                </div>

                <h5>Key findings</h5>
                <ul style={{paddingLeft: 18, color: 'var(--text-2)'}}>
                  <li style={{marginBottom: 6}}><strong>Forecast Cleanup Agent</strong> exceeds Jane Smith's approved Salesforce access; export scope is not held by parent.</li>
                  <li style={{marginBottom: 6}}><strong>Legacy Data Cleanup Agent</strong> is orphaned with Snowflake write access; last active 47 days ago.</li>
                  <li style={{marginBottom: 6}}><strong>Invoice Match Agent</strong> requires secondary approval for NetSuite invoice status updates.</li>
                  <li style={{marginBottom: 6}}>Jane Smith termination scheduled May 15 will cascade to 3 child agents.</li>
                </ul>
              </>
            )}

            {section === 1 && (
              <>
                <h4>Agent inventory</h4>
                <p>Complete register of all discovered agents in scope, with sponsor, platform, and current risk posture.</p>
                <div className="packet-inv">
                  <table>
                    <thead><tr><th>Agent</th><th>Platform</th><th>Sponsor</th><th>Apps</th><th>Risk</th><th>Last active</th></tr></thead>
                    <tbody>
                      {D.agents.map(a => (
                        <tr key={a.id}>
                          <td style={{fontWeight: 500}}>{a.name}</td>
                          <td>{a.platform}</td>
                          <td>{a.sponsor ? getHuman(a.sponsor).name : <span style={{color: 'var(--risk-critical)'}}>Missing</span>}</td>
                          <td>{a.apps.join(', ')}</td>
                          <td><RiskChip risk={a.risk}/></td>
                          <td style={{color: 'var(--text-muted)', fontSize: 12}}>{a.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {section === 2 && (
              <>
                <h4>Human lineage map</h4>
                <p>Each agent is linked to a creator, sponsor, technical owner, and app owner. Sponsors are required; exceptions must be approved by the CIO.</p>
                <div className="packet-inv">
                  <table>
                    <thead><tr><th>Human</th><th>Role</th><th>Agents sponsored</th><th>Subtree risk</th></tr></thead>
                    <tbody>
                      {D.humans.map(h => {
                        const count = D.agents.filter(a => a.sponsor === h.id).length;
                        return (
                          <tr key={h.id}><td style={{fontWeight: 500}}>{h.name}</td><td>{h.role}</td><td className="font-mono">{count}</td><td>{count > 0 ? <RiskChip risk={count >= 2 ? 'high' : 'low'}/> : <span style={{color: 'var(--text-muted)'}}>—</span>}</td></tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {section === 3 && (
              <>
                <h4>Permission comparison</h4>
                <p>Agent-to-parent scope diff. Violations indicate agents with scopes not held by their human sponsor.</p>
                <div className="packet-inv">
                  <table>
                    <thead><tr><th>Agent</th><th>Scope</th><th>Parent has</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Forecast Cleanup</td><td className="font-mono" style={{fontSize: 11.5}}>Salesforce: export opportunities</td><td><span className="v-no-icon">✕ No</span></td><td style={{color: 'var(--risk-critical)', fontWeight: 600}}>Violation</td></tr>
                      <tr><td>Forecast Cleanup</td><td className="font-mono" style={{fontSize: 11.5}}>Snowflake: read customer revenue</td><td><span className="v-no-icon">✕ No</span></td><td style={{color: 'var(--risk-critical)', fontWeight: 600}}>Violation</td></tr>
                      <tr><td>Invoice Match</td><td className="font-mono" style={{fontSize: 11.5}}>NetSuite: update invoice status</td><td><span className="v-yes-icon">✓ Yes</span></td><td style={{color: 'var(--risk-high)', fontWeight: 600}}>Dual control req</td></tr>
                      <tr><td>Legacy Data Cleanup</td><td className="font-mono" style={{fontSize: 11.5}}>Snowflake: update account metadata</td><td>—</td><td style={{color: 'var(--risk-critical)', fontWeight: 600}}>No sponsor</td></tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {section === 4 && (
              <>
                <h4>HR lifecycle simulation</h4>
                <p><strong>Simulated event:</strong> Jane Smith, Sales Operations Manager, termination effective May 15, 2026.</p>
                <div style={{background: 'var(--surface-2)', padding: 18, borderRadius: 10, marginTop: 16}}>
                  <div style={{fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-500)', marginBottom: 10}}>Recommended actions</div>
                  <div style={{marginBottom: 8}}>→ <strong>Renewal Email Agent</strong> · Transfer sponsor to Marcus Reed</div>
                  <div style={{marginBottom: 8}}>→ <strong>Forecast Cleanup Agent</strong> · <span style={{color: 'var(--risk-critical)'}}>Suspend immediately</span> (over-permissioned)</div>
                  <div>→ <strong>Quote Review Agent</strong> · Transfer sponsor to Marcus Reed</div>
                </div>
              </>
            )}

            {section === 5 && (
              <>
                <h4>App-owner approvals</h4>
                <p>All exception approvals logged with timestamp, approver, and expiration. Complete audit trail for downstream SOX / ISO 27001 review.</p>
                <div className="packet-inv">
                  <table>
                    <thead><tr><th>Request</th><th>App owner</th><th>Status</th><th>Expires</th></tr></thead>
                    <tbody>
                      <tr><td>Salesforce export · Forecast Cleanup</td><td>Omar Patel</td><td style={{color: 'var(--risk-critical)'}}>Pending</td><td>—</td></tr>
                      <tr><td>NetSuite invoice status · Invoice Match</td><td>Priya Nair</td><td style={{color: 'var(--risk-critical)'}}>Pending</td><td>—</td></tr>
                      <tr><td>Slack finance channel · Payment Exception</td><td>Priya Nair</td><td style={{color: 'var(--risk-low)'}}>Approved</td><td>May 7, 2026</td></tr>
                      <tr><td>Workday candidate read · Candidate Screen</td><td>Alex Moreno</td><td style={{color: 'var(--risk-low)'}}>Approved</td><td>Jul 1, 2026</td></tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {section === 6 && (
              <>
                <h4>Exceptions and expirations</h4>
                <p>Payment Exception Agent exception (Slack finance channel write) expires in 14 days. No other exceptions within 30-day window.</p>
              </>
            )}

            {section === 7 && (
              <>
                <h4>Recommended remediation</h4>
                <p>Pedigree's recommended 14-day remediation plan:</p>
                <ol style={{color: 'var(--text-2)', paddingLeft: 18}}>
                  <li style={{marginBottom: 8}}><strong>Week 1:</strong> Disable Legacy Data Cleanup Agent. Assign interim sponsor or decommission. Revoke Snowflake write access.</li>
                  <li style={{marginBottom: 8}}><strong>Week 1:</strong> Suspend Forecast Cleanup Agent's export scope. Route approval to Omar Patel or remove scope.</li>
                  <li style={{marginBottom: 8}}><strong>Week 2:</strong> Enforce dual control for Invoice Match Agent's NetSuite status updates.</li>
                  <li style={{marginBottom: 8}}><strong>Week 2:</strong> Complete Jane Smith termination cascade: transfer 2 agents to Marcus Reed, suspend 1.</li>
                  <li><strong>Ongoing:</strong> Quarterly attestation on all high-risk agent sponsors.</li>
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SETTINGS ============
const SettingsScreen = () => (
  <div className="page scroll">
    <div className="page-head">
      <div>
        <div className="page-kicker">Configuration</div>
        <h1>Settings &amp; Integrations</h1>
        <div className="page-sub">Data sources, policy rules, and risk scoring. Integrations shown for demo purposes — production connectors sync HRIS, IdP, agent platforms, and app-owner systems.</div>
      </div>
    </div>

    <h4 style={{fontFamily:'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-500)', margin: '0 0 14px', fontWeight: 500}}>Data sources</h4>
    <div className="settings-grid" style={{marginBottom: 32}}>
      {[
        { n: 'Workday', k: 'HRIS', s: 'Synced · 8 humans', d: 'WD' },
        { n: 'Microsoft Entra', k: 'Identity provider', s: 'Synced · 512 identities', d: 'AZ' },
        { n: 'Copilot Studio', k: 'Agent platform', s: 'Connected · 3 agents', d: 'CS' },
        { n: 'LangGraph', k: 'Agent platform', s: 'Connected · 1 agent', d: 'LG' },
        { n: 'ServiceNow', k: 'Agent platform + App', s: 'Connected · 1 agent', d: 'SN' },
        { n: 'Salesforce', k: 'App', s: 'Approval routing active', d: 'SF' },
        { n: 'Snowflake', k: 'App', s: 'Read-only inventory', d: 'SW' },
        { n: 'NetSuite', k: 'App', s: 'Approval routing active', d: 'NS' },
      ].map((src, i) => (
        <div key={i} className="source-card">
          <div className="source-icon">{src.d}</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div className="src-name">{src.n}</div>
            <div className="src-status">{src.k} · {src.s}</div>
          </div>
          <span className="status-dot"/>
        </div>
      ))}
    </div>

    <h4 style={{fontFamily:'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-500)', margin: '0 0 14px', fontWeight: 500}}>Policy rules</h4>
    <div style={{marginBottom: 32}}>
      {[
        'Agent must have a human sponsor',
        'Agent cannot exceed parent access',
        'High-risk app access requires app-owner approval',
        'Agent must have expiration or owner review date',
        'Parent termination triggers child-agent lifecycle review',
      ].map((rule, i) => (
        <div key={i} className="policy-rule">
          <div className="pi">{i + 1}</div>
          <div className="label">{rule}</div>
          <div className="toggle"/>
        </div>
      ))}
    </div>

    <h4 style={{fontFamily:'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--slate-500)', margin: '0 0 14px', fontWeight: 500}}>Risk scoring factors</h4>
    <div className="stats-row" style={{gridTemplateColumns: 'repeat(6, 1fr)'}}>
      {[
        { l: 'App sensitivity', v: '×2.5' },
        { l: 'Permission level', v: '×2.0' },
        { l: 'Missing owner', v: '+40' },
        { l: 'Missing approval', v: '+30' },
        { l: 'HR lifecycle', v: '+25' },
        { l: 'Last activity', v: '×0.5' },
      ].map((s, i) => (
        <div key={i} className="stat-card">
          <div className="label">{s.l}</div>
          <div className="value" style={{fontSize: 24, color: 'var(--pedigree-blue)'}}>{s.v}</div>
        </div>
      ))}
    </div>
  </div>
);

Object.assign(window, { RiskFindingsScreen, HRSimScreen, ApprovalsScreen, AuditPacketScreen, SettingsScreen });
