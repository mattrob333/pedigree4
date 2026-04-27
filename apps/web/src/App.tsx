import { useEffect, useMemo, useState } from 'react';
import { getAgents, getDemoSummary, getHumans, simulateTermination } from './api';
import type { Agent, CascadeResponse, DemoSummary, Human } from './types';

interface LoadState {
  summary: DemoSummary | null;
  humans: Human[];
  agents: Agent[];
}

const initialState: LoadState = {
  summary: null,
  humans: [],
  agents: [],
};

function statusClass(status: string) {
  if (status === 'active') return 'chip chip-ok';
  if (status === 'orphaned' || status === 'terminated') return 'chip chip-danger';
  return 'chip chip-warn';
}

function riskLabel(score: number) {
  if (score >= 70) return 'High';
  if (score >= 45) return 'Medium';
  return 'Low';
}

export function App() {
  const [state, setState] = useState<LoadState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cascade, setCascade] = useState<CascadeResponse | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [summary, humans, agents] = await Promise.all([
          getDemoSummary(),
          getHumans(),
          getAgents(),
        ]);
        setState({ summary, humans: humans.data, agents: agents.data });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API data');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const humansById = useMemo(() => {
    return new Map(state.humans.map((human) => [human.human_id, human]));
  }, [state.humans]);

  const terminatedHumans = state.humans.filter((human) => human.status === 'terminated');
  const simulationTarget = terminatedHumans[0] ?? state.humans[0];

  async function runCascade() {
    if (!simulationTarget) return;
    try {
      setSimulating(true);
      const result = await simulateTermination(simulationTarget.external_id);
      setCascade(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate HR event');
    } finally {
      setSimulating(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">API-backed MVP slice</p>
          <h1>Pedigree turns the org chart into the control plane for AI agents.</h1>
          <p className="hero-copy">
            This page is the first real app surface: it loads humans, agents, lineage risk, and HR
            cascade plans from the FastAPI backend instead of static browser globals.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/demo.html">Open preserved clickable demo</a>
            <a className="button secondary" href="/index.html">Open marketing prototype</a>
          </div>
        </div>
        <div className="invariant-card">
          <span>Non-negotiable invariant</span>
          <strong>Every agent needs an active HRIS-verified human parent.</strong>
        </div>
      </section>

      {loading && <div className="notice">Loading Pedigree API data…</div>}
      {error && <div className="notice error">{error}</div>}

      {state.summary && (
        <section className="stats-grid" aria-label="Demo summary">
          <Stat label="Humans" value={state.summary.humans} />
          <Stat label="Agents" value={state.summary.agents} />
          <Stat label="Orphaned agents" value={state.summary.orphaned_agents} tone="danger" />
          <Stat label="High risk" value={state.summary.high_risk_agents} tone="warn" />
          <Stat label="Policies" value={state.summary.policies} />
        </section>
      )}

      <section className="workspace-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Lineage graph seed</p>
              <h2>Humans</h2>
            </div>
          </div>
          <div className="list">
            {state.humans.map((human) => (
              <article className="row-card" key={human.human_id}>
                <div>
                  <strong>{human.full_name}</strong>
                  <span>{human.job_title ?? 'Unassigned role'} · {human.department ?? 'No department'}</span>
                </div>
                <span className={statusClass(human.status)}>{human.status}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Agent workforce</p>
              <h2>Agents with parent lineage</h2>
            </div>
          </div>
          <div className="agent-list">
            {state.agents.map((agent) => {
              const parent = agent.owner_human_id ? humansById.get(agent.owner_human_id) : null;
              return (
                <article className="agent-card" key={agent.agent_id}>
                  <div className="agent-topline">
                    <div>
                      <strong>{agent.name}</strong>
                      <span>{agent.platform.replace(/_/g, ' ')}</span>
                    </div>
                    <span className={statusClass(agent.status)}>{agent.status}</span>
                  </div>
                  <p>{agent.description}</p>
                  <div className="agent-meta">
                    <span>Parent: {parent?.full_name ?? 'No active parent'}</span>
                    <span>Risk: {riskLabel(agent.risk_score)} · {agent.risk_score}</span>
                  </div>
                  <div className="pill-row">
                    {(agent.scope_snapshot.actions ?? []).map((action) => (
                      <span className="pill" key={action}>{action}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel cascade-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">HR lifecycle cascade</p>
            <h2>Simulate termination impact</h2>
          </div>
          <button className="button primary" type="button" onClick={runCascade} disabled={simulating || !simulationTarget}>
            {simulating ? 'Simulating…' : `Run for ${simulationTarget?.full_name ?? 'employee'}`}
          </button>
        </div>

        {cascade ? (
          <div className="cascade-result">
            <p>
              <strong>{cascade.human.full_name}</strong> affects {cascade.agents_affected.length} agent(s).
            </p>
            <div className="list">
              {cascade.recommended_actions.map((action) => (
                <article className="row-card" key={`${action.agent_id}-${action.action}`}>
                  <div>
                    <strong>{action.agent_name}</strong>
                    <span>{action.reason}</span>
                  </div>
                  <span className="chip chip-warn">{action.action} → {action.target_owner}</span>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">Run the simulation to create a backend-generated cascade plan and audit event.</p>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'danger' | 'warn' }) {
  return (
    <article className={`stat-card ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
