// Pedigree demo screens
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// ============ ORG CHART SCREEN ============
const OrgChartScreen = ({ revealed, setRevealed, onSelectHuman, onSelectAgent, selHuman, selAgent, goScreen, suspendedAgents }) => {
  const humans = D.humans;
  const agents = D.agents;

  // Layout: CIO at top, 3 VPs + HR + App Owners
  const root = humans.find(h => h.id === 'h1');
  const vps = humans.filter(h => h.manager === 'h1' && h.id !== 'h6');
  const managers = humans.filter(h => ['h5', 'h7', 'h8'].includes(h.id));

  const agentsFor = (humanId) => agents.filter(a => a.parent === humanId);
  const orphans = agents.filter(a => !a.parent);

  return (
    <div className="orgchart-wrap scroll">
      <div className="reveal-banner">
        <div className="stat"><strong>9</strong><span>agents mapped</span></div>
        <div className="divider"/>
        <div className="stat"><strong style={{color:'var(--risk-critical)'}}>4</strong><span>findings require review</span></div>
        <div className="divider"/>
        <div className="stat"><strong>1</strong><span>orphaned agent</span></div>
        <button
          className={`btn reveal-btn ${revealed ? 'btn-ghost' : 'btn-accent'}`}
          onClick={() => setRevealed(!revealed)}
        >
          {revealed ? 'Hide Agent Workforce' : 'Reveal Agent Workforce'} →
        </button>
      </div>

      <div className="orgchart">
        <div className="org-title">Apex Industrial Group · Org Chart</div>

        {/* CIO level */}
        <div className="tree-level">
          <div className="tree-branch">
            <HumanNode human={root} selected={selHuman === root.id} onSelect={onSelectHuman} />
          </div>
        </div>

        <TreeSVG revealed={revealed} />

        {/* VP level */}
        <div className="tree-level" style={{marginTop: 24}}>
          {vps.map(vp => (
            <div key={vp.id} className="tree-branch" style={{flex: 1, maxWidth: 300}}>
              <HumanNode human={vp} selected={selHuman === vp.id} onSelect={onSelectHuman} />
              {/* Agents directly under VP (Priya has Expense Summarizer) */}
              {revealed && agentsFor(vp.id).length > 0 && (
                <div className={`agents-row ${revealed ? 'revealed' : ''}`}>
                  {agentsFor(vp.id).map(a => (
                    <AgentNode key={a.id} agent={a} selected={selAgent === a.id} onSelect={onSelectAgent} suspended={suspendedAgents.includes(a.id)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Manager level — Jane under Marcus, Nina under Priya */}
        <div className="tree-level" style={{marginTop: 36}}>
          <div className="tree-branch">
            <HumanNode human={getHuman('h5')} selected={selHuman === 'h5'} onSelect={onSelectHuman} />
            {revealed && (
              <div className={`agents-row revealed`}>
                {agentsFor('h5').map(a => (
                  <AgentNode key={a.id} agent={a} selected={selAgent === a.id} onSelect={onSelectAgent} suspended={suspendedAgents.includes(a.id)} />
                ))}
              </div>
            )}
          </div>
          <div className="tree-branch">
            <HumanNode human={getHuman('h8')} selected={selHuman === 'h8'} onSelect={onSelectHuman} />
            {revealed && (
              <div className={`agents-row revealed`}>
                {agentsFor('h8').map(a => (
                  <AgentNode key={a.id} agent={a} selected={selAgent === a.id} onSelect={onSelectAgent} suspended={suspendedAgents.includes(a.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* App owners row */}
        <div className="tree-level" style={{marginTop: 36}}>
          <HumanNode human={getHuman('h7')} selected={selHuman === 'h7'} onSelect={onSelectHuman} compact />
          <HumanNode human={getHuman('h6')} selected={selHuman === 'h6'} onSelect={onSelectHuman} compact />
          {revealed && (
            <div className={`agents-row revealed`} style={{marginLeft: 0, maxWidth: 240}}>
              {agentsFor('h6').map(a => (
                <AgentNode key={a.id} agent={a} selected={selAgent === a.id} onSelect={onSelectAgent} suspended={suspendedAgents.includes(a.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Orphan lane */}
        {revealed && (
          <div className="orphan-lane">
            <div className="orphan-lane-head">Unmapped agents — missing human sponsor</div>
            <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
              {orphans.map(a => (
                <AgentNode key={a.id} agent={a} selected={selAgent === a.id} onSelect={onSelectAgent} />
              ))}
              <span style={{alignSelf:'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'}}>
                Last active 47 days · write access to Snowflake
              </span>
            </div>
          </div>
        )}

        {/* Callout near Jane */}
        {revealed && !selHuman && !selAgent && (
          <div className="focus-area" style={{marginTop: 24, color: 'white', padding: '14px 18px', borderRadius: 10, fontSize: 13.5, lineHeight: 1.5, maxWidth: 520}}>
            <div style={{fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 4}}>Focus area</div>
            Jane owns 3 active agents. One exceeds her Salesforce access and one requires app-owner review. <span onClick={() => onSelectHuman('h5')} style={{color: '#93C5FD', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3}}>Inspect Jane →</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TreeSVG = () => (
  <svg width="100%" height="32" style={{display: 'block', marginTop: -4}}>
    <path d="M 50% 0 V 16 H 15% V 32 M 50% 16 H 50% V 32 M 50% 16 H 85% V 32" stroke="#CBD5E1" strokeWidth="1" fill="none" />
  </svg>
);

// ============ HUMAN DRAWER ============
const HumanDrawer = ({ human, onClose, goScreen }) => {
  const [tab, setTab] = uS('agents');
  const toast = useToast();
  if (!human) return null;
  const children = D.agents.filter(a => a.parent === human.id);
  const apps = [...new Set(children.flatMap(a => a.apps))];
  const manager = human.manager ? getHuman(human.manager) : null;
  const subtreeRisk = children.some(a => a.risk === 'critical') ? 'critical'
    : children.some(a => a.risk === 'high') ? 'high'
    : children.some(a => a.risk === 'medium') ? 'medium' : 'low';

  return (
    <div className="drawer open">
      <div className="drawer-head">
        <div className="avatar" style={{width: 44, height: 44, borderRadius: '50%', background: 'var(--navy-900)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, display: 'grid', placeItems: 'center', flexShrink: 0}}>{human.initials}</div>
        <div style={{flex: 1, minWidth: 0}}>
          <h2 className="name">{human.name}</h2>
          <div className="subrow">{human.role} · {human.dept}</div>
        </div>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="drawer-body scroll">
        <div className="d-section" style={{marginTop: 0}}>
          <div className="d-row"><span className="k">Manager</span><span className="v">{manager ? manager.name : '—'}</span></div>
          <div className="d-row"><span className="k">Status</span><span className="v">{human.status}</span></div>
          <div className="d-row"><span className="k">Child agents</span><span className="v">{children.length}</span></div>
          <div className="d-row"><span className="k">Apps touched</span><span className="v">{apps.length ? apps.join(', ') : '—'}</span></div>
          <div className="d-row"><span className="k">Subtree risk</span><span className="v"><RiskChip risk={subtreeRisk}/></span></div>
        </div>

        <div className="tabs">
          <div className={`tab ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}>Child Agents</div>
          <div className={`tab ${tab === 'perms' ? 'active' : ''}`} onClick={() => setTab('perms')}>Permissions</div>
          <div className={`tab ${tab === 'hr' ? 'active' : ''}`} onClick={() => setTab('hr')}>HR Lifecycle</div>
          <div className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>Audit</div>
        </div>

        <div className="d-section">
          {tab === 'agents' && (
            <div>
              {children.length === 0 ? <div style={{fontSize: 13, color: 'var(--text-muted)'}}>No agents owned.</div> :
                children.map(a => (
                  <div key={a.id} style={{padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12}}>
                    <div className="bot" style={{width: 26, height: 26, borderRadius: '50%', background: 'var(--lineage-violet-soft)', display: 'grid', placeItems: 'center', color: 'var(--lineage-violet)'}}>
                      <Icon name="bot" size={14}/>
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontSize: 13, fontWeight: 600}}>{a.name}</div>
                      <div style={{fontSize: 11.5, color: 'var(--text-muted)'}}>{a.platform} · {a.approval.substring(0, 30)}{a.approval.length > 30 ? '…' : ''}</div>
                    </div>
                    <RiskChip risk={a.risk}/>
                  </div>
                ))
              }
            </div>
          )}
          {tab === 'perms' && human.id === 'h5' && (
            <table className="perm-table">
              <thead><tr><th>Permission</th><th>Jane</th><th>Agent</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td className="scope">SF: read opportunities</td><td><span className="v-yes-icon">✓</span></td><td>Renewal</td><td style={{color: 'var(--risk-low)'}}>Allowed</td></tr>
                <tr className="perm-violation"><td className="scope">SF: export opportunities</td><td><span className="v-no-icon">✕</span></td><td>Forecast</td><td><strong>Violation</strong></td></tr>
                <tr className="perm-violation"><td className="scope">Snowflake: customer rev.</td><td><span className="v-no-icon">✕</span></td><td>Forecast</td><td><strong>Violation</strong></td></tr>
                <tr><td className="scope">CPQ: read discount policy</td><td><span className="v-yes-icon">✓</span></td><td>Quote Rev.</td><td style={{color: 'var(--risk-low)'}}>Allowed</td></tr>
              </tbody>
            </table>
          )}
          {tab === 'perms' && human.id !== 'h5' && (
            <div style={{fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5}}>Permission comparison available when agent children are present. Drill into individual agents for scope details.</div>
          )}
          {tab === 'hr' && (
            <div>
              <div style={{background: 'var(--surface-2)', padding: 16, borderRadius: 10, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)'}}>
                {human.id === 'h5' ? (
                  <>If <strong>Jane Smith</strong> leaves, Pedigree will evaluate <strong>3 child agents</strong>, disable <strong>1</strong>, transfer <strong>2</strong> for sponsor review, and require Salesforce app-owner approval for <strong>1</strong>.</>
                ) : children.length ? (
                  <>If {human.name} leaves, Pedigree will evaluate {children.length} child agent{children.length === 1 ? '' : 's'} and recommend sponsor reassignment and access review.</>
                ) : (
                  <>No child agents. No lifecycle cascade required.</>
                )}
              </div>
              <button className="btn btn-accent" style={{marginTop: 16}} onClick={() => goScreen('hr')}>Run HR Event Simulation →</button>
            </div>
          )}
          {tab === 'audit' && (
            <div style={{fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55}}>
              <div style={{padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between'}}>
                <span>Created in Pedigree</span><span className="font-mono" style={{fontSize: 12}}>Mar 08, 2026</span>
              </div>
              <div style={{padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between'}}>
                <span>Last attestation</span><span className="font-mono" style={{fontSize: 12}}>Apr 14, 2026</span>
              </div>
              <div style={{padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between'}}>
                <span>Sponsor of</span><span className="font-mono" style={{fontSize: 12}}>{children.length} agent(s)</span>
              </div>
              <div style={{padding: '10px 0', display: 'flex', justifyContent: 'space-between'}}>
                <span>Open findings</span><span className="font-mono" style={{fontSize: 12, color: 'var(--risk-critical)'}}>{D.findings.filter(f => children.some(c => c.id === f.agentId)).length}</span>
              </div>
            </div>
          )}
        </div>

        <div className="action-row">
          <button className="btn btn-primary" onClick={() => goScreen('audit')}>Open Audit Evidence</button>
          <button className="btn btn-ghost" onClick={() => { toast.add('Attestation request sent.'); }}>Request attestation</button>
        </div>
      </div>
    </div>
  );
};

// ============ AGENT DRAWER ============
const AgentDrawer = ({ agent, onClose, goScreen, onSuspend, suspended }) => {
  const toast = useToast();
  if (!agent) return null;
  const parent = agent.parent ? getHuman(agent.parent) : null;
  const sponsor = agent.sponsor ? getHuman(agent.sponsor) : null;
  const techOwner = agent.techOwner ? getHuman(agent.techOwner) : null;
  const appOwnerId = agent.apps.map(app => D.appOwners[app]).find(x => x);
  const appOwner = appOwnerId ? getHuman(appOwnerId) : null;
  const hasViolation = agent.permissions.some(p => !p.ok);
  const alertSeverity = agent.risk === 'critical' ? 'critical' : 'high';

  return (
    <div className="drawer open">
      <div className="drawer-head">
        <div className="bot" style={{width: 44, height: 44, borderRadius: '50%', background: 'var(--lineage-violet-soft)', display: 'grid', placeItems: 'center', color: 'var(--lineage-violet)', flexShrink: 0}}>
          <Icon name="bot" size={22}/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div className="title-row">
            <h2 className="name">{agent.name}</h2>
          </div>
          <div className="subrow" style={{display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4}}>
            <RiskChip risk={agent.risk}/>
            <PlatformChip platform={agent.platform}/>
            <span style={{fontSize: 12}}>· {agent.lastActive}</span>
          </div>
        </div>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="drawer-body scroll">
        {agent.findings.length > 0 && (
          <div className={`alert-box ${alertSeverity}`}>
            <strong>{agent.findings[0].type}</strong>
            {agent.findings[0].evidence}
          </div>
        )}

        <div className="d-section">
          <h4>Lineage</h4>
          <div className="d-row"><span className="k">Created by</span><span className="v">{parent?.name || <span style={{color: 'var(--risk-critical)'}}>Unknown</span>}</span></div>
          <div className="d-row"><span className="k">Sponsor</span><span className="v">{sponsor?.name || <span style={{color: 'var(--risk-critical)'}}>Missing</span>}</span></div>
          <div className="d-row"><span className="k">Technical owner</span><span className="v">{techOwner?.name || <span style={{color: 'var(--text-muted)'}}>—</span>}</span></div>
          <div className="d-row"><span className="k">App owner required</span><span className="v">{appOwner?.name || <span style={{color: 'var(--text-muted)'}}>Data Platform</span>}</span></div>
          <div className="d-row"><span className="k">Approval status</span><span className="v" style={{color: agent.approval.toLowerCase().includes('missing') ? 'var(--risk-critical)' : 'var(--text)'}}>{agent.approval}</span></div>
        </div>

        <div className="d-section">
          <h4>Purpose</h4>
          <div style={{fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-2)'}}>{agent.purpose}</div>
        </div>

        <div className="d-section">
          <h4>Connected tools &amp; scopes</h4>
          <table className="perm-table">
            <thead><tr><th>Scope</th><th>Status</th></tr></thead>
            <tbody>
              {agent.permissions.map((p, i) => (
                <tr key={i} className={!p.ok ? 'perm-violation' : ''}>
                  <td className="scope">{p.scope}</td>
                  <td>{p.ok ? <span className="v-yes-icon">✓ Allowed</span> : <span className="v-no-icon">✕ {p.reason || 'Violation'}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {agent.findings.length > 0 && (
          <div className="d-section">
            <h4>Findings</h4>
            {agent.findings.map((f, i) => (
              <div key={i} className={`finding-card severity-${f.severity}`}>
                <div className="finding-card-head">
                  <RiskChip risk={f.severity === 'critical' ? 'critical' : f.severity === 'high' ? 'high' : 'medium'}/>
                </div>
                <h5>{f.type}</h5>
                <div className="ev">{f.evidence}</div>
                <div className="rec"><strong>Recommended:</strong> {f.action}</div>
              </div>
            ))}
          </div>
        )}

        <div className="action-row">
          {agent.findings.some(f => f.type.toLowerCase().includes('approval') || f.type.toLowerCase().includes('exceed')) && (
            <button className="btn btn-accent" onClick={() => { toast.add(`Approval routed to ${appOwner?.name || 'app owner'}.`); goScreen('approvals'); }}>Request Approval</button>
          )}
          <button
            className={`btn ${suspended ? 'btn-ghost' : 'btn-danger'}`}
            onClick={() => { onSuspend(agent.id); toast.add(`${agent.name} ${suspended ? 'resumed' : 'suspended'} in demo state.`); }}
          >
            {suspended ? 'Resume Agent' : 'Suspend Agent'}
          </button>
          <button className="btn btn-ghost" onClick={() => goScreen('audit')}>Open Audit Evidence</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { OrgChartScreen, HumanDrawer, AgentDrawer });
