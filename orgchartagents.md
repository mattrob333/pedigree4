<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Org Chart — Indented Agent Stack</title>
<link rel="stylesheet" href="https://esm.sh/@xyflow/react@12/dist/style.css" />
<style>
  :root {
    --bg: #0b0d0e;
    --bg-elev: #14171a;
    --bg-elev-2: #1a1e22;
    --border: #262a2f;
    --border-strong: #3a3f46;
    --text: #e8eaed;
    --text-dim: #9aa0a6;
    --text-faint: #5f6368;
    --accent: #7ee0c1;
    --accent-dim: #4ea791;
    --warn: #f4a261;
    --danger: #e57373;
    --purple: #b39ddb;
  }
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; padding: 0; background: var(--bg); }
  body {
    font-family: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, monospace;
    color: var(--text);
    overflow: hidden;
  }
  .toolbar {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 20px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 10px;
  }
  .stat { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
  .stat-num { color: var(--accent); font-variant-numeric: tabular-nums; }
  .stat-num-warn { color: var(--warn); }
  .stat-label { color: var(--text-dim); }
  .toggle-btn {
    margin-left: 8px;
    padding: 8px 14px;
    background: var(--accent);
    color: #0b0d0e;
    border: none;
    border-radius: 6px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms ease;
  }
  .toggle-btn:hover { background: #92eacc; }
  .toggle-btn.active { background: var(--bg-elev-2); color: var(--accent); border: 1px solid var(--accent-dim); }

  .human-node {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    width: 240px;
    height: 76px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 160ms ease;
  }
  .human-node.selected { border-color: var(--purple); }
  .human-node:hover { border-color: var(--border-strong); }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-elev-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .human-node.selected .avatar {
    background: rgba(179, 157, 219, 0.15);
    color: var(--purple);
    border-color: var(--purple);
  }
  .human-info { flex: 1; min-width: 0; }
  .human-name { font-size: 14px; font-weight: 500; color: var(--text); margin: 0 0 2px; }
  .human-title { font-size: 12px; color: var(--text-dim); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tags { display: flex; gap: 6px; margin-top: 6px; }
  .tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-dim);
    padding: 2px 6px;
    background: var(--bg-elev-2);
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  .agent-node {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 8px 14px 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 240px;
    height: 36px;
    font-size: 12px;
    border-left: 2px solid var(--accent-dim);
  }
  .agent-node.warn { border-left-color: var(--warn); }
  .agent-node.danger { border-left-color: var(--danger); }
  .agent-icon {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    flex-shrink: 0;
  }
  .agent-name { color: var(--text); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .agent-platform {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-dim);
    background: var(--bg-elev-2);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }
  .agent-status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }
  .agent-status.warn { background: var(--warn); }
  .agent-status.danger { background: var(--danger); }

  .react-flow__node { font-family: inherit; }
  .react-flow__handle {
    background: transparent;
    border: none;
    width: 1px;
    height: 1px;
    min-width: 1px;
    min-height: 1px;
    opacity: 0;
  }
  .react-flow__edge-path {
    stroke: var(--border-strong);
    stroke-width: 1px;
  }
  .react-flow__edge.agent-edge .react-flow__edge-path {
    stroke: var(--border);
    stroke-dasharray: 3 3;
  }
  .react-flow__background { background: var(--bg); }
  .react-flow__controls {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: none;
  }
  .react-flow__controls button {
    background: var(--bg-elev);
    border-bottom: 1px solid var(--border);
    color: var(--text);
    fill: var(--text);
  }
  .react-flow__controls button:hover { background: var(--bg-elev-2); }
  .react-flow__attribution { background: transparent; color: var(--text-faint); }
  .react-flow__attribution a { color: var(--text-dim); }

  #boot-error {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--danger);
    font-size: 14px;
    background: var(--bg-elev);
    padding: 16px 20px;
    border: 1px solid var(--danger);
    border-radius: 8px;
    max-width: 560px;
    z-index: 100;
  }
</style>
</head>
<body>
<div id="root"></div>
<div id="boot-error"></div>

<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom": "https://esm.sh/react-dom@18.3.1",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
    "@xyflow/react": "https://esm.sh/@xyflow/react@12?deps=react@18.3.1,react-dom@18.3.1",
    "dagre": "https://esm.sh/dagre@0.8.5"
  }
}
</script>

<script type="module">
window.addEventListener('error', (e) => {
  const el = document.getElementById('boot-error');
  el.style.display = 'block';
  el.textContent = 'Boot error: ' + (e.error?.message || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  const el = document.getElementById('boot-error');
  el.style.display = 'block';
  el.textContent = 'Module error: ' + (e.reason?.message || e.reason);
});

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import dagre from 'dagre';

const h = React.createElement;

const orgData = {
  humans: [
    { id: 'ec', name: 'Evelyn Carter', title: 'CIO', initials: 'EC', dept: 'TECHNOLOGY', parent: null },
    { id: 'mr', name: 'Marcus Reed', title: 'VP, Revenue Operations', initials: 'MR', dept: 'REVENUE', parent: 'ec' },
    { id: 'pn', name: 'Priya Nair', title: 'VP, Finance Systems', initials: 'PN', dept: 'FINANCE', parent: 'ec' },
    { id: 'am', name: 'Alex Moreno', title: 'Director, People Operations', initials: 'AM', dept: 'HR', parent: 'ec' },
    { id: 'ty', name: 'Tom Yamada', title: 'Engineering Manager, Data', initials: 'TY', dept: 'TECHNOLOGY', parent: 'ec' },
    { id: 'js', name: 'Jane Smith', title: 'Sales Operations Manager', initials: 'JS', dept: 'REVENUE', parent: 'mr' },
    { id: 'nb', name: 'Nina Brooks', title: 'Finance Automation Lead', initials: 'NB', dept: 'FINANCE', parent: 'pn' },
  ],
  agents: [
    { id: 'a-fcst', name: 'Forecast Roll-up Bot', platform: 'LangGraph', status: 'warn', owner: 'mr' },
    { id: 'a-deal', name: 'Deal Desk Reviewer', platform: 'Internal', status: 'warn', owner: 'mr' },
    { id: 'a-comp', name: 'Comp Plan Updater', platform: 'Internal', status: 'warn', owner: 'mr' },
    { id: 'a-exp', name: 'Expense Summarizer', platform: 'Copilot', status: 'ok', owner: 'pn' },
    { id: 'a-ap', name: 'AP Intake Agent', platform: 'Make', status: 'warn', owner: 'pn' },
    { id: 'a-vrb', name: 'Vendor Risk Bot', platform: 'Copilot', status: 'ok', owner: 'pn' },
    { id: 'a-cs', name: 'Candidate Screen Agent', platform: 'Copilot', status: 'ok', owner: 'am' },
    { id: 'a-on', name: 'Onboarding Helper', platform: 'Copilot', status: 'ok', owner: 'am' },
    { id: 'a-off', name: 'Offboarding Auditor', platform: 'Internal', status: 'warn', owner: 'am' },
    { id: 'a-pm', name: 'Pipeline Monitor', platform: 'Internal', status: 'warn', owner: 'ty' },
    { id: 'a-sd', name: 'Schema Doc Bot', platform: 'GitHub', status: 'ok', owner: 'ty' },
    { id: 'a-cw', name: 'Cost Anomaly Watcher', platform: 'Internal', status: 'warn', owner: 'ty' },
    { id: 'a-pr', name: 'PR Summarizer', platform: 'GitHub', status: 'ok', owner: 'ty' },
    { id: 'a-rea', name: 'Renewal Email Agent', platform: 'Copilot', status: 'warn', owner: 'js' },
    { id: 'a-im', name: 'Invoice Match Agent', platform: 'MCP', status: 'ok', owner: 'nb' },
  ],
};

const HUMAN_W = 240;
const HUMAN_H = 76;
const AGENT_H = 36;
const HUMAN_GAP_X = 60;
const HUMAN_GAP_Y = 90;
const AGENT_GAP_Y = 12;
const AGENT_INDENT_X = 32;
const AGENT_TOP_PAD = 24;
const AGENT_BOTTOM_PAD = 24;

function computeLayout(humans, agents, expanded) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: HUMAN_GAP_X, ranksep: HUMAN_GAP_Y, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  humans.forEach((hu) => g.setNode(hu.id, { width: HUMAN_W, height: HUMAN_H }));
  humans.forEach((hu) => { if (hu.parent) g.setEdge(hu.parent, hu.id); });
  dagre.layout(g);

  const humanPos = {};
  humans.forEach((hu) => {
    const n = g.node(hu.id);
    humanPos[hu.id] = { x: n.x - HUMAN_W / 2, y: n.y - HUMAN_H / 2 };
  });

  const agentsByOwner = {};
  agents.forEach((a) => { (agentsByOwner[a.owner] ||= []).push(a); });

  const stackHeight = {};
  humans.forEach((hu) => {
    const owned = agentsByOwner[hu.id] || [];
    if (!expanded || owned.length === 0) {
      stackHeight[hu.id] = 0;
    } else {
      stackHeight[hu.id] = AGENT_TOP_PAD + owned.length * AGENT_H + (owned.length - 1) * AGENT_GAP_Y + AGENT_BOTTOM_PAD;
    }
  });

  const depth = {};
  const visit = (id, d) => {
    depth[id] = d;
    humans.filter((hu) => hu.parent === id).forEach((c) => visit(c.id, d + 1));
  };
  humans.filter((hu) => hu.parent === null).forEach((r) => visit(r.id, 0));

  const maxByTier = {};
  humans.forEach((hu) => {
    const d = depth[hu.id];
    if (d === undefined) return;
    if (!(d in maxByTier)) maxByTier[d] = 0;
    if (stackHeight[hu.id] > maxByTier[d]) maxByTier[d] = stackHeight[hu.id];
  });

  const tiers = Object.keys(maxByTier).map(Number).sort((a, b) => a - b);
  const cumPush = {};
  let acc = 0;
  tiers.forEach((t) => { cumPush[t] = acc; acc += maxByTier[t]; });

  humans.forEach((hu) => {
    const d = depth[hu.id];
    if (d !== undefined) humanPos[hu.id].y += cumPush[d];
  });

  const agentPos = {};
  if (expanded) {
    humans.forEach((hu) => {
      const owned = agentsByOwner[hu.id] || [];
      if (owned.length === 0) return;
      const baseX = humanPos[hu.id].x + AGENT_INDENT_X;
      const baseY = humanPos[hu.id].y + HUMAN_H + AGENT_TOP_PAD;
      owned.forEach((a, i) => {
        agentPos[a.id] = { x: baseX, y: baseY + i * (AGENT_H + AGENT_GAP_Y) };
      });
    });
  }

  return { humanPos, agentPos };
}

function HumanNode({ data, selected }) {
  return h('div', { className: 'human-node' + (selected ? ' selected' : '') },
    h(Handle, { type: 'target', position: Position.Top }),
    h('div', { className: 'avatar' }, data.initials),
    h('div', { className: 'human-info' },
      h('p', { className: 'human-name' }, data.name),
      h('p', { className: 'human-title' }, data.title),
      h('div', { className: 'tags' },
        h('span', { className: 'tag' }, data.dept),
        h('span', { className: 'tag' }, 'agents'),
      ),
    ),
    h(Handle, { type: 'source', position: Position.Bottom }),
  );
}

function AgentNode({ data }) {
  const cls = 'agent-node' + (data.status === 'warn' ? ' warn' : '') + (data.status === 'danger' ? ' danger' : '');
  return h('div', { className: cls },
    h(Handle, { type: 'target', position: Position.Left, style: { left: 0 } }),
    h('div', { className: 'agent-icon' },
      h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
        h('rect', { x: 3, y: 11, width: 18, height: 10, rx: 2 }),
        h('circle', { cx: 12, cy: 5, r: 2 }),
        h('path', { d: 'M12 7v4' }),
      ),
    ),
    h('span', { className: 'agent-name' }, data.name),
    h('span', { className: 'agent-platform' }, data.platform),
    h('span', { className: 'agent-status ' + data.status }),
  );
}

const nodeTypes = { human: HumanNode, agent: AgentNode };

function OrgChart() {
  const [expanded, setExpanded] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const rebuild = useCallback(() => {
    const { humanPos, agentPos } = computeLayout(orgData.humans, orgData.agents, expanded);

    const humanNodes = orgData.humans.map((hu) => ({
      id: hu.id, type: 'human', position: humanPos[hu.id], data: hu, draggable: false,
    }));

    const agentNodes = expanded
      ? orgData.agents.filter((a) => agentPos[a.id]).map((a) => ({
          id: a.id, type: 'agent', position: agentPos[a.id], data: a, draggable: false,
        }))
      : [];

    const humanEdges = orgData.humans.filter((hu) => hu.parent).map((hu) => ({
      id: 'e-' + hu.parent + '-' + hu.id, source: hu.parent, target: hu.id, type: 'smoothstep',
    }));

    const agentEdges = expanded
      ? orgData.agents
          .filter((a) => orgData.humans.some((hu) => hu.id === a.owner))
          .map((a) => ({
            id: 'e-' + a.owner + '-' + a.id, source: a.owner, target: a.id,
            type: 'smoothstep', className: 'agent-edge',
          }))
      : [];

    setNodes([...humanNodes, ...agentNodes]);
    setEdges([...humanEdges, ...agentEdges]);

    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [expanded, setNodes, setEdges, fitView]);

  useEffect(() => { rebuild(); }, [rebuild]);

  const stats = useMemo(() => {
    const findings = orgData.agents.filter((a) => a.status !== 'ok').length;
    return { humans: orgData.humans.length, agents: orgData.agents.length, findings };
  }, []);

  return h(React.Fragment, null,
    h('div', { className: 'toolbar' },
      h('div', { className: 'stat' },
        h('span', { className: 'stat-num' }, stats.humans),
        h('span', { className: 'stat-label' }, 'humans'),
      ),
      h('div', { className: 'stat' },
        h('span', { className: 'stat-num' }, stats.agents),
        h('span', { className: 'stat-label' }, 'agents'),
      ),
      stats.findings > 0 && h('div', { className: 'stat' },
        h('span', { className: 'stat-num stat-num-warn' }, stats.findings),
        h('span', { className: 'stat-label' }, 'findings'),
      ),
      h('button', {
        className: 'toggle-btn' + (expanded ? ' active' : ''),
        onClick: () => setExpanded((e) => !e),
      }, expanded ? 'Hide Agent Workforce →' : 'Reveal Agent Workforce →'),
    ),
    h('div', { style: { width: '100vw', height: '100vh' } },
      h(ReactFlow, {
        nodes, edges, nodeTypes, onNodesChange, onEdgesChange,
        fitView: true,
        fitViewOptions: { padding: 0.15 },
        minZoom: 0.2, maxZoom: 1.5,
        nodesDraggable: false, nodesConnectable: false, elementsSelectable: true,
      },
        h(Background, { color: '#1a1e22', gap: 24, size: 1 }),
        h(Controls, { showInteractive: false }),
      ),
    ),
  );
}

function App() {
  return h(ReactFlowProvider, null, h(OrgChart, null));
}

const root = createRoot(document.getElementById('root'));
root.render(h(App, null));
</script>
</body>
</html>
