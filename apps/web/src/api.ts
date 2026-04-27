import type { Agent, ApiList, CascadeResponse, DemoSummary, Human } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getDemoSummary() {
  return request<DemoSummary>('/v1/demo/summary');
}

export function getHumans() {
  return request<ApiList<Human>>('/v1/humans?limit=100');
}

export function getAgents() {
  return request<ApiList<Agent>>('/v1/agents');
}

export function simulateTermination(employeeId: string) {
  return request<CascadeResponse>('/v1/webhooks/hris/termination', {
    method: 'POST',
    body: JSON.stringify({
      employee_id: employeeId,
      termination_date: new Date().toISOString(),
      reason: 'api_backed_demo',
    }),
  });
}
