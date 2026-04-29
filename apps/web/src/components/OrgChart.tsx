import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Node,
  Edge,
} from '@xyflow/react';
import dagre from 'dagre';

// Types for our demo data
interface Human {
  id: string;
  name: string;
  initials: string;
  role: string;
  dept: string;
  manager: string | null;
  status: string;
}

interface Agent {
  id: string;
  name: string;
  parent: string | null;
  platform: string;
  risk: string;
  status: string;
}

interface DemoData {
  humans: Human[];
  agents: Agent[];
}

// Props for the OrgChart component
interface OrgChartProps {
  data: DemoData;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

// Layout constants
const HUMAN_W = 240;
const HUMAN_H = 76;
const AGENT_H = 36;
const HUMAN_GAP_X = 60;
const HUMAN_GAP_Y = 90;
const AGENT_GAP_Y = 12;
const AGENT_INDENT_X = 32;
const AGENT_TOP_PAD = 24;
const AGENT_BOTTOM_PAD = 24;

// Compute layout using Dagre
function computeLayout(humans: Human[], agents: Agent[], expanded: boolean) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: HUMAN_GAP_X, ranksep: HUMAN_GAP_Y, marginx: 40, marginy: 40 });
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
  agents.forEach((a) => { 
    if (a.parent) {
      (agentsByOwner[a.parent] ||= []).push(a);
    }
  });

  const stackHeight: Record<string, number> = {};
  humans.forEach((hu) => {
    const owned = agentsByOwner[hu.id] || [];
    if (!expanded || owned.length === 0) {
      stackHeight[hu.id] = 0;
    } else {
      stackHeight[hu.id] = AGENT_TOP_PAD + owned.length * AGENT_H + (owned.length - 1) * AGENT_GAP_Y + AGENT_BOTTOM_PAD;
    }
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

// Human Node Component
function HumanNode({ data, selected }: { data: Record<string, any>; selected: boolean }) {
  return (
    <div className={`human-node ${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="avatar">{data.initials}</div>
      <div className="human-info">
        <p className="human-name">{data.name}</p>
        <p className="human-title">{data.role}</p>
        <div className="tags">
          <span className="tag">{data.dept}</span>
          <span className="tag">agents</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Agent Node Component
function AgentNode({ data }: { data: Record<string, any> }) {
  const statusClass = data.risk === 'critical' ? 'danger' : data.risk === 'high' ? 'warn' : '';
  
  return (
    <div className={`agent-node ${statusClass}`}>
      <Handle type="target" position={Position.Left} style={{ left: 0 }} />
      <div className="agent-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
        </svg>
      </div>
      <span className="agent-name">{data.name}</span>
      <span className="agent-platform">{data.platform}</span>
      <span className={`agent-status ${statusClass}`} />
    </div>
  );
}

// Main OrgChart Component
function OrgChart({ data, expanded = false, onToggleExpanded }: OrgChartProps) {
  console.log('OrgChart: Rendering with data', data, 'expanded:', expanded);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const toggleExpanded = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpanded?.();
  }, [isExpanded, onToggleExpanded]);

  const rebuild = useCallback(() => {
    console.log('OrgChart: Rebuilding layout...');
    const { humanPos, agentPos } = computeLayout(data.humans, data.agents, isExpanded);
    console.log('OrgChart: Computed positions', { humanPos, agentPos });

    const humanNodes: Node[] = data.humans.map((hu) => ({
      id: hu.id,
      type: 'human',
      position: humanPos[hu.id],
      data: hu as Record<string, any>,
      draggable: false,
    }));

    const agentNodes: Node[] = isExpanded
      ? data.agents
          .filter((a) => a.parent && agentPos[a.id])
          .map((a) => ({
            id: a.id,
            type: 'agent',
            position: agentPos[a.id],
            data: { ...a, statusClass: a.risk } as Record<string, any>,
            draggable: false,
          }))
      : [];

    const humanEdges: Edge[] = data.humans
      .filter((hu) => hu.manager)
      .map((hu) => ({
        id: `e-${hu.manager}-${hu.id}`,
        source: hu.manager!,
        target: hu.id,
        type: 'smoothstep',
      }));

    const agentEdges: Edge[] = isExpanded
      ? data.agents
          .filter((a) => a.parent && data.humans.some((hu) => hu.id === a.parent))
          .map((a) => ({
            id: `e-${a.parent}-${a.id}`,
            source: a.parent!,
            target: a.id,
            type: 'smoothstep',
            className: 'agent-edge',
          }))
      : [];

    console.log('OrgChart: Created nodes and edges', { 
      humanNodes: humanNodes.length, 
      agentNodes: agentNodes.length,
      humanEdges: humanEdges.length,
      agentEdges: agentEdges.length
    });

    setNodes(humanNodes.concat(agentNodes));
    setEdges(humanEdges.concat(agentEdges));

    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [data, isExpanded, setNodes, setEdges, fitView]);

  useEffect(() => {
    rebuild();
  }, [rebuild]);

  const stats = useMemo(() => {
    const findings = data.agents.filter((a) => a.risk === 'critical' || a.risk === 'high').length;
    const orphans = data.agents.filter((a) => !a.parent).length;
    return { 
      humans: data.humans.length, 
      agents: data.agents.length, 
      findings,
      orphans 
    };
  }, [data]);

  const nodeTypes = useMemo(() => ({
    human: HumanNode,
    agent: AgentNode,
  }), []);

  return (
    <>
      <div className="toolbar">
        <div className="stat">
          <span className="stat-num">{stats.humans}</span>
          <span className="stat-label">humans</span>
        </div>
        <div className="stat">
          <span className="stat-num">{stats.agents}</span>
          <span className="stat-label">agents</span>
        </div>
        {stats.findings > 0 && (
          <div className="stat">
            <span className="stat-num stat-num-warn">{stats.findings}</span>
            <span className="stat-label">findings</span>
          </div>
        )}
        {stats.orphans > 0 && (
          <div className="stat">
            <span className="stat-num stat-num-warn">{stats.orphans}</span>
            <span className="stat-label">orphans</span>
          </div>
        )}
        <button
          className={`toggle-btn${isExpanded ? ' active' : ''}`}
          onClick={toggleExpanded}
        >
          {isExpanded ? 'Hide Agent Workforce →' : 'Reveal Agent Workforce →'}
        </button>
      </div>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background color="#1a1e22" gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </>
  );
}

// Wrapper component with ReactFlowProvider
export default function OrgChartWithProvider(props: OrgChartProps) {
  return (
    <ReactFlowProvider>
      <OrgChart {...props} />
    </ReactFlowProvider>
  );
}
