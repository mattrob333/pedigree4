// Data adapter to transform static demo data for use with OrgChart component

// Types that match the static demo data structure
interface StaticHuman {
  id: string;
  name: string;
  initials: string;
  role: string;
  dept: string;
  manager: string | null;
  status: string;
  highlight?: boolean;
  appOwner?: boolean;
}

interface StaticAgent {
  id: string;
  name: string;
  parent: string | null;
  sponsor: string | null;
  techOwner: string | null;
  platform: string;
  purpose: string;
  apps: string[];
  risk: string;
  status: string;
  approval: string;
  lastActive: string;
  permissions: Array<{
    scope: string;
    ok: boolean;
    reason?: string;
  }>;
  findings: Array<{
    type: string;
    severity: string;
    evidence: string;
    action: string;
  }>;
  flagship?: boolean;
  orphan?: boolean;
}

interface StaticDemoData {
  humans: StaticHuman[];
  agents: StaticAgent[];
}

// Types expected by OrgChart component
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

// Transform function to convert static data to OrgChart format
export function adaptStaticData(staticData: StaticDemoData): DemoData {
  const humans: Human[] = staticData.humans.map(h => ({
    id: h.id,
    name: h.name,
    initials: h.initials,
    role: h.role,
    dept: h.dept,
    manager: h.manager,
    status: h.status
  }));

  const agents: Agent[] = staticData.agents.map(a => ({
    id: a.id,
    name: a.name,
    parent: a.parent,
    platform: a.platform,
    risk: a.risk,
    status: a.status
  }));

  return { humans, agents };
}

// Helper function to load static demo data from the global window object
export function loadStaticDemoData(): DemoData | null {
  if (typeof window !== 'undefined' && (window as any).PEDIGREE_DATA) {
    return adaptStaticData((window as any).PEDIGREE_DATA);
  }
  return null;
}

// Create a fallback demo dataset for when static data is not available
export function createFallbackDemoData(): DemoData {
  return {
    humans: [
      { id: 'h1', name: 'Evelyn Carter', initials: 'EC', role: 'CIO', dept: 'Technology', manager: null, status: 'Active' },
      { id: 'h2', name: 'Marcus Reed', initials: 'MR', role: 'VP, Revenue Operations', dept: 'Revenue', manager: 'h1', status: 'Active' },
      { id: 'h3', name: 'Priya Nair', initials: 'PN', role: 'VP, Finance Systems', dept: 'Finance', manager: 'h1', status: 'Active' },
      { id: 'h4', name: 'Alex Moreno', initials: 'AM', role: 'Director, People Operations', dept: 'HR', manager: 'h1', status: 'Active' },
      { id: 'h5', name: 'Jane Smith', initials: 'JS', role: 'Sales Operations Manager', dept: 'Revenue', manager: 'h2', status: 'Active' },
      { id: 'h6', name: 'Tom Yamada', initials: 'TY', role: 'Engineering Manager, Data', dept: 'Technology', manager: 'h1', status: 'Active' },
    ],
    agents: [
      { id: 'a1', name: 'Renewal Email Agent', parent: 'h5', platform: 'Copilot Studio', risk: 'medium', status: 'Active' },
      { id: 'a2', name: 'Forecast Cleanup Agent', parent: 'h5', platform: 'LangGraph', risk: 'high', status: 'Active' },
      { id: 'a3', name: 'Invoice Match Agent', parent: 'h3', platform: 'MCP Workflow', risk: 'critical', status: 'Active' },
      { id: 'a4', name: 'Candidate Screen Agent', parent: 'h4', platform: 'Copilot Studio', risk: 'high', status: 'Active' },
      { id: 'a5', name: 'Pipeline Monitor', parent: 'h6', platform: 'Internal Builder', risk: 'medium', status: 'Active' },
    ]
  };
}
