// Pedigree demo app root
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "teal",
  "density": "comfortable",
  "animateRisk": true
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [entryOpen, setEntryOpen] = React.useState(true);
  const [screen, setScreen] = React.useState('dashboard');
  const [scenario, setScenario] = React.useState('pre-audit');
  const [revealed, setRevealed] = React.useState(false);
  const [selHuman, setSelHuman] = React.useState(null);
  const [selAgent, setSelAgent] = React.useState(null);
  const [riskFilter, setRiskFilter] = React.useState('all');
  const [suspended, setSuspended] = React.useState([]);
  const [walkStep, setWalkStep] = React.useState(null);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-accent', tweaks.accent);
    document.documentElement.setAttribute('data-density', tweaks.density);
    document.documentElement.setAttribute('data-animate-risk', String(tweaks.animateRisk));
    const accentMap = { blue: '#3B82F6', violet: '#7C3AED', teal: '#14B8A6', amber: '#F59E0B' };
    const accentDark = { blue: '#2563EB', violet: '#6D28D9', teal: '#0D9488', amber: '#D97706' };
    const accentSoft = { blue: '#DBEAFE', violet: '#EDE9FE', teal: '#CCFBF1', amber: '#FEF3C7' };
    document.documentElement.style.setProperty('--pedigree-blue', accentMap[tweaks.accent]);
    document.documentElement.style.setProperty('--pedigree-blue-dark', accentDark[tweaks.accent]);
    document.documentElement.style.setProperty('--pedigree-blue-soft', accentSoft[tweaks.accent]);
  }, [tweaks.theme, tweaks.accent, tweaks.density, tweaks.animateRisk]);

  const selectHuman = (id) => { setSelAgent(null); setSelHuman(id); };
  const selectAgent = (id) => { setSelHuman(null); setSelAgent(id); };
  const closeDrawer = () => { setSelHuman(null); setSelAgent(null); };
  const toggleSuspend = (id) => setSuspended(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const goScreen = (s) => {
    setScreen(s);
    if (s !== 'org') closeDrawer();
  };

  React.useEffect(() => {
    if (scenario === 'termination') { setScreen('hr'); }
    else if (scenario === 'approvals') { setScreen('approvals'); }
    else { setScreen('dashboard'); }
  }, [scenario]);

  const startWalkthrough = () => { setWalkStep(0); setEntryOpen(false); };
  const drawerOpen = !!(selHuman || selAgent);

  return (
    <ToastProvider>
      <div className="shell">
        <TopBar scenario={scenario} setScenario={setScenario} goScreen={goScreen} />
        <Sidebar screen={screen} setScreen={goScreen} startWalkthrough={startWalkthrough} />
        <div className={`main ${drawerOpen ? 'with-drawer' : ''}`}>
          {screen === 'dashboard' && <DashboardScreen goScreen={goScreen}/>}
          {screen === 'org' && (
            <OrgChartScreen revealed={revealed} setRevealed={setRevealed} onSelectHuman={selectHuman} onSelectAgent={selectAgent} selHuman={selHuman} selAgent={selAgent} goScreen={goScreen} suspendedAgents={suspended}/>
          )}
          {screen === 'risk' && (
            <RiskFindingsScreen goScreen={goScreen} onSelectAgent={(id) => { goScreen('org'); setRevealed(true); selectAgent(id); }} filter={riskFilter} setFilter={setRiskFilter}/>
          )}
          {screen === 'hr' && <HRSimScreen goScreen={goScreen} onSuspend={toggleSuspend} />}
          {screen === 'approvals' && <ApprovalsScreen />}
          {screen === 'audit' && <AuditPacketScreen />}
          {screen === 'integrations' && <IntegrationsScreen />}
          {screen === 'settings' && <SettingsScreen />}

          {selHuman && <HumanDrawer human={getHuman(selHuman)} onClose={closeDrawer} goScreen={goScreen}/>}
          {selAgent && <AgentDrawer agent={getAgent(selAgent)} onClose={closeDrawer} goScreen={goScreen} onSuspend={toggleSuspend} suspended={suspended.includes(selAgent)}/>}
        </div>

        {entryOpen && <EntryScreen scenario={scenario} setScenario={setScenario} onStart={() => { setEntryOpen(false); }} onWalkthrough={startWalkthrough} />}
        {walkStep !== null && <Walkthrough step={walkStep} setStep={setWalkStep} onClose={() => setWalkStep(null)} goScreen={goScreen} setRevealed={setRevealed} selectAgent={selectAgent}/>}

        <TweaksPanel title="Tweaks">
          <TweakSection label="Appearance">
            <TweakRadio label="Theme" value={tweaks.theme} options={[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}]} onChange={v => setTweak('theme', v)} />
            <TweakRadio label="Accent" value={tweaks.accent} options={[{value: 'blue', label: 'Blue'}, {value: 'violet', label: 'Violet'}, {value: 'teal', label: 'Teal'}, {value: 'amber', label: 'Amber'}]} onChange={v => setTweak('accent', v)} />
            <TweakRadio label="Density" value={tweaks.density} options={[{value: 'comfortable', label: 'Cozy'}, {value: 'compact', label: 'Compact'}]} onChange={v => setTweak('density', v)} />
          </TweakSection>
          <TweakSection label="Behavior">
            <TweakToggle label="Animate risk pulses" value={tweaks.animateRisk} onChange={v => setTweak('animateRisk', v)} />
            <TweakButton label="Replay walkthrough" onClick={startWalkthrough} />
            <TweakButton label="Reset demo" secondary onClick={() => { setRevealed(false); setSuspended([]); setEntryOpen(true); }} />
          </TweakSection>
        </TweaksPanel>
      </div>
    </ToastProvider>
  );
};

const EntryScreen = ({ scenario, setScenario, onStart, onWalkthrough }) => {
  const scenarios = [
    { id: 'pre-audit', num: '01', title: 'Pre-Audit Agent Review', desc: 'Walk the graph, surface 11 orphaned and 7 high-risk agents, produce evidence.' },
    { id: 'termination', num: '02', title: 'Employee Termination', desc: 'Jane Smith leaves. See the lifecycle cascade across 3 child agents.' },
    { id: 'approvals', num: '03', title: 'App Owner Approvals', desc: 'Salesforce export, NetSuite payments, orphaned Snowflake write access.' },
  ];
  return (
    <div className="entry-screen">
      <div className="entry-inner">
        <div className="entry-kicker">Demo Workspace · Apex Industrial Group · 42 agents discovered</div>
        <h1>Your AI agents need <em>managers too</em>.</h1>
        <p className="sub">Pedigree maps every agent to a human owner, permission boundary, approval trail, and HR lifecycle event — so security teams can govern the agent workforce before it becomes the next audit problem.</p>
        <div className="scenarios">
          {scenarios.map(s => (
            <div key={s.id} className={`scenario-card ${scenario === s.id ? 'selected' : ''}`} onClick={() => setScenario(s.id)}>
              <div className="sc-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center'}}>
          <button className="btn btn-white" style={{padding: '14px 28px', fontSize: 15}} onClick={onWalkthrough}>▶ Start 3-Minute Risk Walkthrough</button>
          <button onClick={onStart} style={{padding: '14px 22px', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 14, cursor: 'pointer'}}>Or explore freely</button>
          <a href="index.html" style={{color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 12}}>← Website</a>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
