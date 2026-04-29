// Pedigree Org Chart Widget — React Flow + Dagre
// Mounts as a self-contained widget into any DOM element.
// Used by the Babel-based demo (apps/web/public/demo.html) to replace the
// hand-rolled tree with a React Flow layout, while keeping all other demo
// screens, sidebar, topbar, and drawers intact.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
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
import '@xyflow/react/dist/style.css';

// Mark the widget script as loading immediately so the bridge knows we're alive
(window as any).__orgChartFlowLoading = true;
console.log('[OrgChartFlow] widget module loading');

// ============ TYPES ============
interface Human {
  id: string;
  name: string;
  initials: string;
  role: string;
  dept: string;
  manager: string | null;
  subtree?: number;
  highlight?: boolean;
}

interface Agent {
  id: string;
  name: string;
  parent: string | null;
  platform: string;
  risk: 'low' | 'medium' | 'high' | 'critical' | string;
}

interface WidgetProps {
  humans: Human[];
  agents: Agent[];
  revealed: boolean;
  selHuman?: string | null;
  selAgent?: string | null;
  suspendedAgents?: string[];
  onSelectHuman: (id: string) => void;
  onSelectAgent: (id: string) => void;
}

// ============ LAYOUT ============
const HUMAN_W = 260;
const HUMAN_H = 88;
const AGENT_W = 240;
const AGENT_H = 38;
const HUMAN_GAP_X = 80;
const HUMAN_GAP_Y = 110;
const AGENT_GAP_Y = 10;
const AGENT_INDENT_X = 28;
const AGENT_TOP_PAD = 22;
const AGENT_BOTTOM_PAD = 24;

function computeLayout(humans: Human[], agents: Agent[], expanded: boolean) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: HUMAN_GAP_X, ranksep: HUMAN_GAP_Y, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));

  humans.forEach((hu) => g.setNode(hu.id, { width: HUMAN_W, height: HUMAN_H }));
  humans.forEach((hu) => { if (hu.manager) g.setEdge(hu.manager, hu.id); });
  dagre.layout(g);

  const humanPos: Record<string, { x: number; y: number }> = {};
  humans.forEach((hu) => {
    const n = g.node(hu.id);
    humanPos[hu.id] = { x: n.x - HUMAN_W / 2, y: n.y - HUMAN_H / 2 };
  });

  const agentsByOwner: Record<string, Agent[]> = {};
  agents.forEach((a) => { if (a.parent) (agentsByOwner[a.parent] ||= []).push(a); });

  const stackHeight: Record<string, number> = {};
  humans.forEach((hu) => {
    const owned = agentsByOwner[hu.id] || [];
    stackHeight[hu.id] = !expanded || owned.length === 0
      ? 0
      : AGENT_TOP_PAD + owned.length * AGENT_H + (owned.length - 1) * AGENT_GAP_Y + AGENT_BOTTOM_PAD;
  });

  const depth: Record<string, number> = {};
  const visit = (id: string, d: number) => {
    depth[id] = d;
    humans.filter((hu) => hu.manager === id).forEach((c) => visit(c.id, d + 1));
  };
  humans.filter((hu) => hu.manager === null).forEach((r) => visit(r.id, 0));

  const maxByTier: Record<number, number> = {};
  humans.forEach((hu) => {
    const d = depth[hu.id];
    if (d === undefined) return;
    if (!(d in maxByTier)) maxByTier[d] = 0;
    if (stackHeight[hu.id] > maxByTier[d]) maxByTier[d] = stackHeight[hu.id];
  });

  const tiers = Object.keys(maxByTier).map(Number).sort((a, b) => a - b);
  const cumPush: Record<number, number> = {};
  let acc = 0;
  tiers.forEach((t) => { cumPush[t] = acc; acc += maxByTier[t]; });
  humans.forEach((hu) => {
    const d = depth[hu.id];
    if (d !== undefined) humanPos[hu.id].y += cumPush[d];
  });

  const agentPos: Record<string, { x: number; y: number }> = {};
  if (expanded) {
    humans.forEach((hu) => {
      const owned = agentsByOwner[hu.id] || [];
      if (!owned.length) return;
      const baseX = humanPos[hu.id].x + AGENT_INDENT_X;
      const baseY = humanPos[hu.id].y + HUMAN_H + AGENT_TOP_PAD;
      owned.forEach((a, i) => {
        agentPos[a.id] = { x: baseX, y: baseY + i * (AGENT_H + AGENT_GAP_Y) };
      });
    });
  }

  return { humanPos, agentPos };
}

// ============ NODE COMPONENTS (use existing demo .hnode / .anode CSS) ============
function HumanFlowNode({ data }: { data: any }) {
  const { human, selected, onSelect } = data;
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(human.id);
  };
  return (
    <>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div
        className={`hnode ${selected ? 'selected' : ''} ${human.highlight ? 'highlighted' : ''}`}
        onClick={handleClick}
        onPointerDown={(event) => event.stopPropagation()}
        style={{ cursor: 'pointer', width: HUMAN_W, pointerEvents: 'auto' }}
      >
        <div className="avatar">{human.initials}</div>
        <div className="hnode-main">
          <div className="hnode-name">{human.name}</div>
          <div className="hnode-role">{human.role}</div>
          <div className="hnode-meta">
            <span className="dept-chip">{human.dept}</span>
            {typeof human.subtree === 'number' && (
              <span className="hnode-count">{human.subtree} {human.subtree === 1 ? 'agent' : 'agents'}</span>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </>
  );
}

function AgentFlowNode({ data }: { data: any }) {
  const { agent, selected, suspended, onSelect } = data;
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(agent.id);
  };
  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div
        className={`anode risk-${agent.risk} ${selected ? 'selected' : ''} ${suspended ? 'suspended' : ''}`}
        onClick={handleClick}
        onPointerDown={(event) => event.stopPropagation()}
        style={{ cursor: 'pointer', width: AGENT_W, pointerEvents: 'auto' }}
      >
        <div className="bot">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
          </svg>
        </div>
        <span className="aname">{agent.name}</span>
        <span className="platform">{agent.platform}</span>
        <span className={`risk-dot risk-${agent.risk}-bg`}></span>
      </div>
    </>
  );
}

const handleStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  opacity: 0,
};

// ============ INNER FLOW COMPONENT ============
function OrgChartInner(props: WidgetProps) {
  const { humans, agents, revealed, selHuman, selAgent, suspendedAgents = [], onSelectHuman, onSelectAgent } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({ human: HumanFlowNode, agent: AgentFlowNode }), []);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (node.type === 'human' && node.data?.human?.id) {
      onSelectHuman(node.data.human.id);
    }
    if (node.type === 'agent' && node.data?.agent?.id) {
      onSelectAgent(node.data.agent.id);
    }
  }, [onSelectHuman, onSelectAgent]);

  const rebuild = useCallback(() => {
    const { humanPos, agentPos } = computeLayout(humans, agents, revealed);

    const humanNodes = humans
      .filter((hu) => humanPos[hu.id])
      .map((hu) => ({
        id: hu.id,
        type: 'human',
        position: humanPos[hu.id],
        data: { human: hu, selected: selHuman === hu.id, onSelect: onSelectHuman },
        draggable: false,
        selectable: false,
      }));

    const agentNodes = revealed
      ? agents.filter((a) => a.parent && agentPos[a.id]).map((a) => ({
          id: a.id,
          type: 'agent',
          position: agentPos[a.id],
          data: {
            agent: a,
            selected: selAgent === a.id,
            suspended: suspendedAgents.includes(a.id),
            onSelect: onSelectAgent,
          },
          draggable: false,
          selectable: false,
        }))
      : [];

    const humanEdges = humans
      .filter((hu) => hu.manager && humans.some((p) => p.id === hu.manager))
      .map((hu) => ({
        id: `e-${hu.manager}-${hu.id}`,
        source: hu.manager!,
        target: hu.id,
        type: 'smoothstep',
        style: { stroke: '#CBD5E1', strokeWidth: 1 },
      }));

    const agentEdges = revealed
      ? agents
          .filter((a) => a.parent && humans.some((hu) => hu.id === a.parent))
          .map((a) => ({
            id: `e-${a.parent}-${a.id}`,
            source: a.parent!,
            target: a.id,
            type: 'smoothstep',
            style: { stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '3 3' },
          }))
      : [];

    setNodes(([] as any[]).concat(humanNodes, agentNodes));
    setEdges(([] as any[]).concat(humanEdges, agentEdges));

    setTimeout(() => fitView({ padding: 0.15, duration: 350 }), 60);
  }, [humans, agents, revealed, selHuman, selAgent, suspendedAgents, onSelectHuman, onSelectAgent, setNodes, setEdges, fitView]);

  useEffect(() => { rebuild(); }, [rebuild]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.3}
      maxZoom={1.5}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#E2E8F0" gap={24} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function OrgChartWidget(props: WidgetProps) {
  return (
    <ReactFlowProvider>
      <OrgChartInner {...props} />
    </ReactFlowProvider>
  );
}

// ============ IMPERATIVE MOUNT API ============
const roots = new WeakMap<HTMLElement, Root>();

function mount(el: HTMLElement, props: WidgetProps) {
  let root = roots.get(el);
  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
  }
  root.render(<OrgChartWidget {...props} />);
}

function update(el: HTMLElement, props: WidgetProps) {
  mount(el, props);
}

function unmount(el: HTMLElement) {
  const root = roots.get(el);
  if (root) {
    root.unmount();
    roots.delete(el);
  }
}

// Expose globally for the Babel-based demo
try {
  (window as any).OrgChartFlow = { mount, update, unmount };
  console.log('[OrgChartFlow] widget ready, window.OrgChartFlow installed');
  window.dispatchEvent(new CustomEvent('orgchartflow:ready'));
} catch (err) {
  console.error('[OrgChartFlow] failed to install widget on window', err);
}
