# Pedigree Clickable Demo and Website Design Spec

## Purpose

Build a polished, clickable HTML prototype that can be shown to a potential client in a 7 minute sales conversation. The prototype should make Pedigree instantly understandable:

> Pedigree is the org chart for your AI workforce. Every AI agent is mapped to a human owner, permission boundary, app-owner approval, and lifecycle event.

This spec includes two connected experiences:

1. **Marketing website** - A public-facing landing page that explains the problem and drives the user to a demo CTA.
2. **Clickable product demo** - A simulated product experience showing agent lineage, risk findings, HR-triggered lifecycle actions, and audit evidence.

This should be built as a static clickable HTML demo, not a production SaaS app. No real backend, real auth, real integrations, or live data are required.

---

# Part 1: Design Principles

## Product feeling

Pedigree should feel like enterprise infrastructure, not a generic AI toy.

The design should communicate:

- Governance
- Trust
- Control
- Auditability
- Human accountability
- Enterprise readiness
- Clear business value

## Brand personality

Tone:

- Confident
- Precise
- Direct
- Enterprise-grade
- Slightly provocative, but not gimmicky

Avoid:

- Cartoonish AI visuals
- Generic robot imagery
- Overused glowing circuit boards
- Buzzword-heavy security language
- Claims that feel impossible to prove

## Core visual metaphor

The central visual metaphor is:

> A human org chart with AI agents as child nodes under the humans who created, sponsor, or own them.

Human nodes should look like people in an org chart. Agent nodes should look related, but visibly different.

Suggested difference:

- Human nodes: structured rectangles with profile initials, title, department
- Agent nodes: rounded capsule cards with small bot/agent icon, platform chip, risk chip
- Edges: clean parent-child lines
- Risk: subtle colored side rail or badge, not overwhelming warning graphics

---

# Part 2: Shared Visual System

## Suggested color palette

Use this as a starting point. Designer may adjust, but stay in this direction.

### Primary colors

- Deep navy: `#07111F`
- Midnight blue: `#0E1B2E`
- Slate panel: `#111827`
- White: `#FFFFFF`
- Off-white background: `#F7F9FC`

### Accent colors

- Pedigree blue: `#3B82F6`
- Lineage violet: `#7C3AED`
- Agent teal: `#14B8A6`
- Approval green: `#22C55E`
- Warning amber: `#F59E0B`
- Critical red: `#EF4444`

### Risk mapping

- Low: green
- Medium: amber
- High: orange/red
- Critical: red
- Unknown: gray

## Typography

Recommended:

- Headings: Inter, Geist, Satoshi, or similar modern sans-serif
- Body: Inter or system sans-serif
- Monospace snippets: JetBrains Mono or IBM Plex Mono

Type style:

- Large hero headlines
- Dense but readable enterprise UI
- Strong hierarchy in product surfaces
- Avoid tiny gray text for core product claims

## Icon style

Use simple line icons or filled minimal icons.

Needed icons:

- Human/user
- Agent/bot
- Org chart
- Shield
- Key/permissions
- HR event/person exiting
- App/database
- Audit/report
- Warning/risk
- Check/approval
- Lock
- Lightning/automation

## Layout style

- Website: clean landing page, generous whitespace, high-contrast hero
- Demo: SaaS dashboard shell with left nav, top bar, large visualization canvas, right-side detail panel
- Product UI should feel realistic enough that a client believes this could become a real product quickly

---

# Part 3: Website Design Spec

## Website objective

Convert a visitor into either:

1. Viewing the interactive demo
2. Booking an Agent Lineage Assessment
3. Requesting a design partner conversation

The main CTA should lead to the mock demo.

Primary CTA:

> View Interactive Demo

Secondary CTA:

> Book Agent Lineage Assessment

## Recommended website route structure

For the clickable prototype:

- `/` - Landing page
- `/demo` - Clickable product demo
- `/assessment` - Simple CTA section or modal, optional

A single-page website is acceptable if the top CTA opens the demo page or scrolls to a demo preview section.

## Landing page structure

### 1. Header navigation

Left:

- Pedigree logo
- Optional tagline: Every Agent Has a Pedigree

Center nav:

- Product
- How It Works
- Use Cases
- Assessment
- FAQ

Right:

- Secondary button: Book Assessment
- Primary button: View Demo

Header behavior:

- Sticky on scroll
- Demo button should always be visible on desktop
- On mobile, show hamburger or simplified CTA

### 2. Hero section

Purpose:

Make the thesis obvious in the first 5 seconds.

Hero headline:

> Every Agent Has a Pedigree.

Subheadline:

> The org chart for your AI workforce. Pedigree maps every AI agent to a human owner, permission boundary, app-owner approval, and lifecycle event before your next audit.

Primary CTA:

> View Interactive Demo

Secondary CTA:

> Run an Agent Lineage Assessment

Hero visual:

Split-screen visual:

Left side:

- A normal human org chart
- Clean, familiar, controlled

Right side:

- The same org chart expanded with hidden AI agent nodes underneath employees
- Some agents have risk badges
- One employee has an alert: 3 child agents affected by HR event

Small proof strip below hero:

- Human ownership
- Permission inheritance
- HR-triggered lifecycle
- App-owner approvals
- Audit evidence

Suggested hero microcopy:

> Your employees are building agents faster than your IAM stack can govern them. Pedigree gives every agent a documented human parent and a lifecycle tied to the real org chart.

### 3. Problem section

Section headline:

> Your company has two org charts. Only one is governed.

Three problem cards:

1. **Hidden agent workforce**
   - Agents are scattered across Copilot Studio, internal tools, notebooks, SaaS apps, and automation platforms.
2. **No human accountability**
   - When an agent makes a change, teams struggle to prove who owns it, who approved it, and why it exists.
3. **Lifecycle gaps**
   - When employees leave or change roles, their agents can remain active, over-permissioned, or orphaned.

Supporting visual:

- A clean Workday-style org chart on the left
- A messy cloud of agent nodes on the right
- A line connecting them through Pedigree

### 4. Thesis section

Section headline:

> Govern agents like the humans who created them.

Visual:

A large org chart with agent child nodes.

Copy blocks:

- Every agent has a human sponsor
- Every agent has a business purpose
- Every agent has a permission boundary
- Every agent has app-owner approval
- Every agent has an HR-linked lifecycle

CTA:

> See the Agent Org Chart

CTA destination:

- `/demo`

### 5. How it works section

Section headline:

> From agent sprawl to audit-ready lineage in five steps.

Five-step horizontal or vertical diagram:

1. **Import humans**
   - Bring in the org chart from HRIS, IdP, or CSV.
2. **Register agents**
   - Map agents from builder tools, MCP servers, service accounts, or manual import.
3. **Attach lineage**
   - Link every agent to a creator, sponsor, technical owner, and app owner.
4. **Evaluate risk**
   - Flag orphaned agents, over-permissioned agents, stale agents, and missing approvals.
5. **Prove control**
   - Simulate HR events and export audit evidence.

### 6. Use case section

Section headline:

> Built for the teams getting asked, “Who owns this agent?”

Use case cards:

#### CISO and IAM

Headline:

> Stop rogue agents before they become audit findings.

Copy:

> See every agent, who owns it, what it can touch, and whether it exceeds its parent’s approved access.

#### App owners

Headline:

> Know every agent calling your system.

Copy:

> Salesforce, ServiceNow, HR, and finance owners get a clear approval queue instead of mystery automations.

#### CIO and AI leaders

Headline:

> Unblock agent rollout without losing control.

Copy:

> Give teams a path to build agents safely while security gets the evidence it needs.

### 7. Product preview section

Section headline:

> See the hidden agent workforce underneath your org chart.

Embed a static screenshot-like visual of the demo UI:

- Left nav
- Org chart canvas
- Right-side risk panel
- Agent nodes under humans
- Critical finding highlighted

CTA:

> Launch Interactive Demo

CTA behavior:

- Goes to `/demo`
- Demo should open directly into the product shell, not another landing page

### 8. Assessment offer section

Section headline:

> Start with an Agent Lineage Assessment.

Copy:

> We help you inventory known agents, map them to human owners, flag orphaned and over-permissioned agents, simulate HR lifecycle events, and produce an audit-ready evidence packet.

Deliverables list:

- Agent inventory
- Human ownership map
- Orphaned agent report
- Over-permissioned agent report
- HR event blast-radius simulation
- App-owner review queue
- Audit evidence packet

CTA:

> Book Assessment

For prototype:

- CTA can open a modal with a form
- Form fields: name, email, company, role, notes
- Form does not need to submit
- On submit, show success state: “Assessment request captured for demo purposes.”

### 9. Differentiation section

Section headline:

> Discovery tells you what exists. Pedigree tells you who owns it and what happens next.

Comparison table:

| Capability | Discovery Tools | IAM Tools | Pedigree |
|---|---:|---:|---:|
| Agent inventory | Yes | Partial | Yes |
| Human-lineage mapping | Partial | Partial | Yes |
| App-owner approval queue | No | Partial | Yes |
| HR lifecycle simulation | No | Partial | Yes |
| Audit evidence packet | Partial | Partial | Yes |
| Agent org chart UI | No | No | Yes |

Do not overstate production enforcement in the clickable prototype. The demo may show enforcement concepts, but the website should emphasize lineage, lifecycle, and audit readiness first.

### 10. FAQ section

Use short enterprise objection-handling copy.

FAQ 1:

**Is this replacing Entra, Okta, Workday, or ServiceNow?**

No. Pedigree sits above and between them as the lineage and evidence layer for AI agents. It connects human ownership, app-owner approvals, permission boundaries, and HR lifecycle events.

FAQ 2:

**What about agents that need to outlive their creator?**

Pedigree supports org-owned agents with explicit exception workflows, sponsor reassignment, and audit evidence. Human-parented is the default. Exceptions are visible and reviewable.

FAQ 3:

**Do we need runtime enforcement on day one?**

No. Many teams start with read-only lineage, risk findings, and audit evidence. Runtime enforcement can come later after the ownership graph is trusted.

FAQ 4:

**What is the first step?**

Run an Agent Lineage Assessment. Start with known agents, map ownership, identify risk, and build the first governance baseline.

### 11. Footer

Footer links:

- Product
- Demo
- Assessment
- Security
- Contact

Footer tagline:

> Every Agent Has a Pedigree.

---

# Part 4: Clickable Product Demo Design Spec

## Demo objective

In 7 minutes, the demo should prove four things:

1. Pedigree reveals the hidden agent workforce under the human org chart.
2. Pedigree identifies orphaned, over-permissioned, stale, and unapproved agents.
3. Pedigree simulates what happens when a human leaves or changes roles.
4. Pedigree produces an audit-ready evidence packet.

## Demo format

Build as a static clickable HTML prototype.

Recommended implementation:

- React or vanilla HTML/CSS/JS is fine
- If React is used, Vite is preferred for speed
- Use a static dataset in JSON
- No backend
- No auth required
- No real API calls
- All buttons and transitions should feel real
- All pages should be reachable through left navigation

## Demo dimensions

Primary target:

- Desktop browser
- 1440 x 900 presentation display

Secondary:

- 1280 x 800 laptop

Mobile responsiveness:

- Website should be mobile-friendly
- Product demo can be desktop-first
- On mobile demo, show message: “Interactive product demo is optimized for desktop.”

## Demo shell layout

### Top bar

Left:

- Pedigree logo
- Environment label: Demo Workspace

Center:

- Search bar placeholder: Search humans, agents, apps, or findings

Right:

- Scenario selector: Pre-Audit Review, Employee Termination, App Owner Review
- Button: Export Evidence Packet
- User avatar: MS

### Left navigation

Items:

1. Agent Org Chart
2. Risk Findings
3. HR Event Simulation
4. App Owner Approvals
5. Audit Packet
6. Settings

Active state should be clear.

### Main content region

Changes based on selected nav item.

### Right-side insight panel

Persistent or context-sensitive panel showing:

- Selected human or agent details
- Current risk summary
- Recommended action
- Related findings
- Approval status

Panel should slide open when a node or finding is clicked.

---

# Part 5: Demo Dataset

Use fictional company name:

> Apex Industrial Group

Do not use real logos or imply a real customer unless approved.

## Humans

### Executive layer

1. **Evelyn Carter**
   - Role: CIO
   - Department: Technology
   - Status: Active
   - Risk summary: 9 agents in subtree

2. **Marcus Reed**
   - Role: VP, Revenue Operations
   - Department: Revenue
   - Manager: Evelyn Carter
   - Status: Active
   - Risk summary: 4 agents in subtree

3. **Priya Nair**
   - Role: VP, Finance Systems
   - Department: Finance
   - Manager: Evelyn Carter
   - Status: Active
   - Risk summary: 2 agents in subtree

4. **Alex Moreno**
   - Role: Director, People Operations
   - Department: HR
   - Manager: Evelyn Carter
   - Status: Active
   - Risk summary: 1 agent in subtree

### Manager layer

5. **Jane Smith**
   - Role: Sales Operations Manager
   - Department: Revenue
   - Manager: Marcus Reed
   - Status: Active in baseline, Termination Pending in simulation
   - Risk summary: 3 agents owned

6. **Dana Lee**
   - Role: ServiceNow App Owner
   - Department: Technology
   - Manager: Evelyn Carter
   - Status: Active
   - Risk summary: Approval owner

7. **Omar Patel**
   - Role: Salesforce App Owner
   - Department: Revenue Systems
   - Manager: Marcus Reed
   - Status: Active
   - Risk summary: Approval owner

8. **Nina Brooks**
   - Role: Finance Automation Lead
   - Department: Finance
   - Manager: Priya Nair
   - Status: Active
   - Risk summary: 2 agents owned

## Agents

### Agent 1: Renewal Email Agent

- Parent human: Jane Smith
- Sponsor: Jane Smith
- Technical owner: Marcus Reed
- Platform: Copilot Studio
- Purpose: Draft renewal emails using Salesforce opportunity data
- Apps touched: Salesforce, Outlook
- Risk: Medium
- Status: Active
- Approval: Salesforce app owner approved
- Last active: 2 hours ago
- Permissions:
  - Salesforce: read opportunities
  - Salesforce: read accounts
  - Outlook: draft emails
- Finding: None

### Agent 2: Forecast Cleanup Agent

- Parent human: Jane Smith
- Sponsor: Jane Smith
- Technical owner: Jane Smith
- Platform: LangGraph
- Purpose: Clean pipeline stages and produce forecast notes
- Apps touched: Salesforce, Snowflake
- Risk: High
- Status: Active
- Approval: Missing Salesforce export approval
- Last active: 18 minutes ago
- Permissions:
  - Salesforce: read opportunities
  - Salesforce: export opportunities
  - Snowflake: read customer revenue table
- Finding:
  - Agent exceeds parent access
  - Missing app-owner approval

### Agent 3: Quote Review Agent

- Parent human: Jane Smith
- Sponsor: Jane Smith
- Technical owner: Marcus Reed
- Platform: Internal agent builder
- Purpose: Compare quote terms against approved discount policy
- Apps touched: Salesforce, CPQ
- Risk: Low
- Status: Active
- Approval: Approved
- Last active: 1 day ago
- Permissions:
  - Salesforce: read quotes
  - CPQ: read discount policy
- Finding: None

### Agent 4: Invoice Match Agent

- Parent human: Nina Brooks
- Sponsor: Priya Nair
- Technical owner: Nina Brooks
- Platform: MCP workflow
- Purpose: Match invoices to purchase orders and flag exceptions
- Apps touched: NetSuite, ServiceNow
- Risk: Critical
- Status: Active
- Approval: Finance approval present, payment action approval missing
- Last active: 6 minutes ago
- Permissions:
  - NetSuite: read invoices
  - NetSuite: update invoice status
  - ServiceNow: create ticket
- Finding:
  - High-risk finance action requires secondary approval

### Agent 5: Payment Exception Agent

- Parent human: Nina Brooks
- Sponsor: Priya Nair
- Technical owner: Nina Brooks
- Platform: Internal agent builder
- Purpose: Escalate invoice mismatches over $50,000
- Apps touched: NetSuite, Slack
- Risk: High
- Status: Active
- Approval: Approved with exception
- Last active: 3 days ago
- Permissions:
  - NetSuite: read invoices
  - Slack: send message to finance channel
- Finding:
  - Exception expires in 14 days

### Agent 6: Candidate Screen Agent

- Parent human: Alex Moreno
- Sponsor: Alex Moreno
- Technical owner: HR Systems Team
- Platform: Copilot Studio
- Purpose: Summarize candidate profiles for recruiters
- Apps touched: Workday, Outlook
- Risk: High
- Status: Active
- Approval: HR app owner approved
- Last active: 4 hours ago
- Permissions:
  - Workday: read candidate profile
  - Outlook: draft recruiter summary
- Finding:
  - Uses sensitive HR data

### Agent 7: ServiceDesk Triage Agent

- Parent human: Dana Lee
- Sponsor: Dana Lee
- Technical owner: ITSM Team
- Platform: ServiceNow
- Purpose: Categorize support tickets and route them
- Apps touched: ServiceNow
- Risk: Low
- Status: Active
- Approval: Approved
- Last active: 12 minutes ago
- Permissions:
  - ServiceNow: read ticket
  - ServiceNow: update category
  - ServiceNow: assign ticket
- Finding: None

### Agent 8: Legacy Data Cleanup Agent

- Parent human: Unknown
- Sponsor: Empty
- Technical owner: Unknown
- Platform: Python script
- Purpose: Unknown
- Apps touched: Snowflake
- Risk: Critical
- Status: Active
- Approval: Missing
- Last active: 47 days ago
- Permissions:
  - Snowflake: read customer table
  - Snowflake: update account metadata
- Finding:
  - Orphaned agent
  - Missing sponsor
  - High-risk data access

---

# Part 6: Product Demo Screens

## Screen 1: Demo entry screen

Route:

- `/demo`

Purpose:

Let the presenter choose the demo path or jump into the main story.

Layout:

- Dark branded splash screen
- Headline: The org chart for your AI workforce
- Subheadline: See every agent, owner, permission, approval, and lifecycle event in one governed graph.
- Three scenario cards:
  1. Pre-Audit Agent Review
  2. Employee Termination Simulation
  3. App Owner Approval Queue

Primary button:

> Start 7-Minute Demo

Click behavior:

- Opens Agent Org Chart screen

Optional:

- Add small “Back to Website” link

## Screen 2: Agent Org Chart

Route:

- `/demo/org-chart`

Purpose:

This is the main “wow” screen. The user sees the normal org chart, then reveals agents underneath people.

Initial state:

- Show Apex Industrial Group org chart with human nodes only
- A banner at top says: “9 known agents mapped. 4 findings require review.”
- Button: Reveal Agent Workforce

After clicking Reveal Agent Workforce:

- Agent nodes animate into view under their human parent
- Hidden orphan agent appears in a separate “Unmapped agents” lane
- Risk chips appear
- Right panel updates with summary:
  - 9 agents discovered
  - 1 orphaned
  - 2 over-permissioned
  - 3 missing or expiring approvals
  - 1 critical HR lifecycle exposure

Main interaction:

- Click a human node to open human detail panel
- Click an agent node to open agent detail panel
- Click a risk badge to jump to Risk Findings screen filtered to that node

Human node design:

- Name
- Title
- Department chip
- Count of child agents
- Status chip: Active, Termination Pending, Role Change Pending

Agent node design:

- Agent name
- Platform chip
- Parent human
- Risk badge
- App icons touched
- Status chip

Specific visual callout:

Highlight Jane Smith and her 3 child agents.

Callout copy:

> Jane owns 3 active agents. One exceeds her Salesforce access and one requires app-owner review.

## Screen 3: Human detail panel

Triggered from:

- Click Jane Smith in org chart

Panel title:

> Jane Smith

Details:

- Role: Sales Operations Manager
- Department: Revenue
- Manager: Marcus Reed
- Status: Active
- Agent children: 3
- Apps touched by child agents: Salesforce, Outlook, Snowflake, CPQ
- Risk score: High

Tabs inside panel:

1. Child Agents
2. Permissions
3. HR Lifecycle
4. Audit Trail

Child Agents tab:

- Renewal Email Agent - Medium - Approved
- Forecast Cleanup Agent - High - Over-permissioned
- Quote Review Agent - Low - Approved

Permissions tab:

Show comparison:

| Permission | Jane | Agent Child | Status |
|---|---:|---:|---|
| Salesforce read opportunities | Yes | Yes | Allowed |
| Salesforce export opportunities | No | Forecast Cleanup Agent | Violation |
| Snowflake customer revenue table | No | Forecast Cleanup Agent | Violation |
| CPQ read discount policy | Yes | Quote Review Agent | Allowed |

HR Lifecycle tab:

Show simulated consequence:

> If Jane leaves, Pedigree will evaluate 3 child agents, disable 1, transfer 2 for sponsor review, and require Salesforce app-owner approval for 1.

CTA inside panel:

> Run HR Event Simulation

Click behavior:

- Opens HR Event Simulation screen with Jane selected

## Screen 4: Agent detail panel

Triggered from:

- Click Forecast Cleanup Agent in org chart

Panel title:

> Forecast Cleanup Agent

Top status:

- Risk: High
- Status: Active
- Platform: LangGraph
- Parent: Jane Smith
- Sponsor: Jane Smith
- Last active: 18 minutes ago

Primary alert:

> This agent exceeds its parent’s approved access.

Lineage section:

- Created by: Jane Smith
- Sponsored by: Jane Smith
- Managed by: Marcus Reed
- App owner required: Omar Patel
- Approval status: Missing

Connected tools section:

- Salesforce: read opportunities
- Salesforce: export opportunities
- Snowflake: read customer revenue table

Permission comparison section:

Show “Parent boundary” vs “Agent access.”

Visual:

- Parent allowed scopes in one column
- Agent scopes in another column
- Violating scopes highlighted

Findings section:

Finding 1:

- Type: Agent exceeds parent access
- Severity: High
- Evidence: Agent can export Salesforce opportunities. Parent does not have export entitlement.
- Recommended action: Suspend export scope or request Salesforce app-owner approval.

Finding 2:

- Type: Missing app-owner approval
- Severity: High
- Evidence: Salesforce export action requires app owner approval.
- Recommended action: Route to Omar Patel.

Action buttons:

- Request Approval
- Suspend Agent
- Open Audit Evidence

Click behavior:

- Request Approval opens App Owner Approval Queue filtered to Forecast Cleanup Agent
- Suspend Agent changes status chip to Suspended in demo state
- Open Audit Evidence opens Audit Packet screen

## Screen 5: Risk Findings dashboard

Route:

- `/demo/risk-findings`

Purpose:

Show security and IAM buyers that Pedigree turns the graph into prioritized action.

Top summary cards:

- Total agents: 9
- Critical findings: 2
- High findings: 4
- Orphaned agents: 1
- Missing approvals: 3
- HR lifecycle exposure: 1

Filter chips:

- All
- Critical
- High
- Orphaned
- Over-permissioned
- Missing Approval
- Stale
- HR Event

Findings table columns:

- Severity
- Finding
- Agent
- Human parent
- App owner
- Evidence
- Recommended action
- Status

Example rows:

1. Critical - Orphaned agent with Snowflake write access - Legacy Data Cleanup Agent - Unknown - Data Platform Owner - Missing sponsor and active write access - Disable or assign sponsor - Open
2. High - Agent exceeds parent access - Forecast Cleanup Agent - Jane Smith - Omar Patel - Export scope not held by parent - Remove scope or approve exception - Open
3. High - Missing app-owner approval - Forecast Cleanup Agent - Jane Smith - Omar Patel - Salesforce export approval missing - Route approval - Open
4. Critical - Finance action requires secondary approval - Invoice Match Agent - Nina Brooks - Priya Nair - Updates invoice status without second approval - Require finance approval - Open
5. Medium - Exception expires soon - Payment Exception Agent - Nina Brooks - Priya Nair - Exception expires in 14 days - Renew or revoke - Open

Interactions:

- Click row opens right detail drawer
- Click “Highlight in graph” jumps to org chart with node highlighted
- Click “Route approval” jumps to App Owner Approvals screen

## Screen 6: HR Event Simulation

Route:

- `/demo/hr-simulation`

Purpose:

Create the strongest sales moment: show how a human lifecycle event becomes an agent lifecycle event.

Initial screen:

Title:

> HR Event Simulation

Subtitle:

> See what happens to child agents when a human leaves, changes roles, or moves teams.

Simulation controls:

- Select human: Jane Smith
- Event type: Termination
- Effective date: Friday, May 15, 2026
- Policy mode: Audit-only / Recommended actions / Enforcement-ready

Primary button:

> Run Simulation

After clicking Run Simulation:

Show a staged animation or stepper:

Step 1: HR event received

- Jane Smith marked Termination Pending
- Manager and department resolved

Step 2: Agent subtree discovered

- 3 child agents found
- Renewal Email Agent
- Forecast Cleanup Agent
- Quote Review Agent

Step 3: Permission and approval evaluation

- 1 agent exceeds parent scope
- 1 agent missing app-owner approval
- 2 agents eligible for transfer
- 1 agent eligible for suspension

Step 4: Recommended lifecycle actions

| Agent | Recommended action | Reason |
|---|---|---|
| Renewal Email Agent | Transfer sponsor to Marcus Reed | Business purpose still valid |
| Forecast Cleanup Agent | Suspend immediately | Over-permissioned and missing Salesforce approval |
| Quote Review Agent | Transfer sponsor to Marcus Reed | Approved low-risk workflow |

Step 5: Evidence generated

- HR event record
- Agent ownership impact
- Permission comparison
- Approval requirements
- Recommended actions
- Export packet available

Final screen summary:

> Jane’s termination impacts 3 active agents. Pedigree recommends suspending 1, transferring 2, and routing 1 Salesforce approval before reassignment.

CTA buttons:

- Open Audit Packet
- View Approval Queue
- Highlight in Org Chart

## Screen 7: App Owner Approval Queue

Route:

- `/demo/approvals`

Purpose:

Show how app owners become governance participants instead of victims.

Top tabs:

- Pending
- Approved
- Rejected
- Expiring Exceptions

Approval cards:

### Card 1: Salesforce export approval required

Agent:

- Forecast Cleanup Agent

Requested access:

- Salesforce export opportunities

Human parent:

- Jane Smith

App owner:

- Omar Patel

Reason:

- Agent requests export action not included in parent’s approved entitlement boundary.

Evidence:

- Parent does not have export scope
- Agent last used export action 18 minutes ago
- Business purpose: Forecast cleanup
- HR event pending for parent

Buttons:

- Approve exception
- Reject
- Request more info

Click behavior:

- Approve exception changes card status to Approved with exception and shows expiration date selector
- Reject changes status to Rejected and updates risk finding
- Request more info opens comment field

### Card 2: Finance secondary approval required

Agent:

- Invoice Match Agent

Requested action:

- NetSuite update invoice status

App owner:

- Priya Nair

Buttons:

- Approve
- Require dual control
- Reject

### Card 3: Orphaned Snowflake write access

Agent:

- Legacy Data Cleanup Agent

Requested action:

- Snowflake write account metadata

App owner:

- Data Platform Owner

Buttons:

- Disable
- Assign sponsor
- Request investigation

## Screen 8: Audit Packet

Route:

- `/demo/audit-packet`

Purpose:

Show the tangible output a buyer can use internally.

Title:

> Audit Evidence Packet

Subtitle:

> Generated from the current Apex Industrial agent lineage graph.

Top summary:

- Company: Apex Industrial Group
- Generated: Current date
- Scope: Revenue Operations, Finance Systems, HR Operations
- Agents reviewed: 9
- Human owners reviewed: 8
- Open findings: 6
- Critical findings: 2

Left side:

Packet section list:

1. Executive summary
2. Agent inventory
3. Human lineage map
4. Permission comparison
5. HR lifecycle simulation
6. App-owner approvals
7. Exceptions and expirations
8. Recommended remediation plan

Right side:

Document preview with sample pages.

Sample executive summary copy:

> Pedigree identified 9 active agents across Apex Industrial Group. 1 agent is orphaned, 2 agents exceed their parent’s permission boundary, and 3 agent actions require app-owner approval. A simulated termination of Jane Smith impacts 3 active child agents and requires 1 immediate suspension.

CTA buttons:

- Download PDF
- Export CSV
- Send to App Owners

Click behavior:

- Buttons show toast: “Demo export generated.”
- Optional: open a static modal that previews the “downloaded” evidence packet

## Screen 9: Settings and integrations

Route:

- `/demo/settings`

Purpose:

Show credibility without needing real integrations.

Sections:

### Data sources

Cards:

- HRIS: Connected via CSV demo import
- IdP: Microsoft Entra placeholder
- Agent Platforms: Copilot Studio, LangGraph, ServiceNow, Internal Builder
- Apps: Salesforce, Snowflake, NetSuite, Workday, Outlook

### Policy rules

Show enabled rules:

1. Agent must have human sponsor
2. Agent cannot exceed parent access
3. High-risk app access needs app-owner approval
4. Agent must have expiration or owner review date
5. Parent termination triggers child-agent lifecycle review

### Risk scoring

Show simple scoring explanation:

- App sensitivity
- Permission level
- Missing owner
- Missing approval
- HR lifecycle status
- Last activity

---

# Part 7: Clickable Demo Storyboard

The prototype should support this exact talk track.

## Step 1: Open website

Presenter says:

> Most companies have a human org chart they trust and a hidden agent workforce they do not. Pedigree connects the two.

Click:

- View Interactive Demo

## Step 2: Reveal agent workforce

Presenter says:

> This is the normal org chart. Now we reveal the agents underneath each person.

Click:

- Reveal Agent Workforce

Expected visual:

- Agent child nodes appear
- Risk summary updates
- Orphan lane appears

## Step 3: Click Jane Smith

Presenter says:

> Jane owns three agents. One of them has more access than Jane herself.

Click:

- Jane Smith

Expected visual:

- Right panel shows Jane’s agents and permission comparison

## Step 4: Click Forecast Cleanup Agent

Presenter says:

> This agent can export Salesforce opportunities and read customer revenue data in Snowflake. Jane does not have those entitlements, and the Salesforce owner has not approved it.

Click:

- Forecast Cleanup Agent

Expected visual:

- Agent panel shows over-permission finding

## Step 5: Run HR simulation

Presenter says:

> Now watch what happens when Jane leaves the company.

Click:

- Run HR Event Simulation
- Run Simulation

Expected visual:

- Stepper evaluates Jane’s child agents
- Recommended actions appear

## Step 6: Open approval queue

Presenter says:

> Pedigree routes decisions to the app owner instead of leaving security to chase people manually.

Click:

- View Approval Queue

Expected visual:

- Forecast Cleanup Agent approval card shown

## Step 7: Open audit packet

Presenter says:

> The final output is an evidence packet security, IAM, app owners, and auditors can actually use.

Click:

- Open Audit Packet

Expected visual:

- PDF-like packet preview
- Summary metrics
- Export buttons

## Step 8: End with CTA

Presenter says:

> The first step is not deploying runtime enforcement. The first step is mapping the agent workforce and proving ownership.

Click:

- Book Agent Lineage Assessment

Expected visual:

- Assessment request modal or website section

---

# Part 8: Interaction Requirements

## Minimum clickable interactions

The demo must include at least these interactions:

1. Website CTA opens demo
2. Demo scenario card opens product shell
3. Reveal Agent Workforce button expands agent nodes
4. Click human node opens detail panel
5. Click agent node opens detail panel
6. Click risk finding opens detail drawer
7. Click “Highlight in graph” jumps to highlighted node
8. Click “Run HR Event Simulation” opens simulation page
9. Click “Run Simulation” animates staged results
10. Click “View Approval Queue” opens approval page
11. Click approval action changes card status
12. Click “Open Audit Packet” opens packet preview
13. Click “Download PDF” shows export toast
14. Click “Book Assessment” opens CTA modal

## Hover states

All clickable cards and nodes should have hover states.

Suggested hover behavior:

- Slight lift
- Border highlight
- Cursor pointer
- Tooltip for risk badges

## Selected states

Selected human or agent:

- Stronger border
- Subtle glow or shadow
- Connected edges highlighted
- Right panel populated

## Toasts

Use lightweight toasts for simulated actions:

- “Approval routed to Omar Patel.”
- “Agent suspended in demo state.”
- “Evidence packet generated.”
- “Assessment request captured.”

## Empty states

Do not show blank screens. If something is not implemented, show realistic demo placeholder copy.

Example:

> Integration settings are shown for demo purposes. Production connectors would sync HRIS, IdP, agent platforms, and app-owner systems.

---

# Part 9: Content Copy Bank

## Short taglines

- Every Agent Has a Pedigree.
- The org chart for your AI workforce.
- Govern agents like the humans who created them.
- Human accountability for every autonomous action.
- Stop agent sprawl before your next audit.

## Demo badges

- Human Parent Verified
- Missing Sponsor
- Over-Permissioned
- App Approval Required
- HR Event Impact
- Orphaned Agent
- Exception Expiring
- Audit Ready

## Risk finding language

Use plain English.

Good:

> Agent can export Salesforce opportunities, but parent human does not have export permission.

Avoid:

> Scope anomaly detected in entitlement substrate.

Good:

> Agent has no sponsor and retains write access to Snowflake.

Avoid:

> Non-human principal lacks attestation metadata.

## Button copy

- Reveal Agent Workforce
- Run Simulation
- Request Approval
- Suspend Agent
- Transfer Sponsor
- Open Audit Evidence
- Export Packet
- Book Assessment
- Back to Website

---

# Part 10: Website to Demo CTA Flow

## Primary CTA behavior

On the website, every “View Interactive Demo” button should go to:

- `/demo`

The demo should start with either:

1. A scenario selection screen
2. The main org chart with a “Start 7-Minute Demo” overlay

Recommended:

- Use scenario selection screen for polish
- Include “Start 7-Minute Demo” as the default path

## Secondary CTA behavior

“Book Agent Lineage Assessment” should open a modal or scroll to an assessment form.

Form fields:

- Name
- Work email
- Company
- Role
- Current agent platforms used
- Notes

Form submit behavior:

- No real submission required
- Show success state

Success copy:

> Request captured. In the real product, this would route to the Pedigree team for assessment scheduling.

## Demo exit CTA

Inside the demo, always provide a way back to the website or assessment CTA.

Suggested sticky bottom-right button:

> Book Assessment

Suggested top-left link:

> Back to Website

---

# Part 11: Responsive Behavior

## Website desktop

- Full hero split-screen
- Horizontal nav
- Multi-column cards
- Large product visuals

## Website tablet

- Hero stacks
- Product visual below copy
- Cards move to 2 columns

## Website mobile

- Single column
- Hide complex org chart details or simplify into stacked cards
- Primary CTA remains visible
- Demo CTA should still work, but product demo can warn that desktop is preferred

## Demo desktop

- Full SaaS dashboard layout
- Left nav visible
- Org chart canvas large
- Right panel visible

## Demo mobile

Show simplified message:

> This product demo is optimized for desktop. Open on a larger screen to explore the interactive agent org chart.

Include button:

> View Website

---

# Part 12: Accessibility and Usability

Minimum requirements:

- Text contrast should pass basic accessibility standards
- Buttons need visible focus states
- All clickable cards should be keyboard reachable if possible
- Avoid relying only on color for risk status
- Use labels as well as color chips
- Keep animations under control and avoid excessive motion

---

# Part 13: Acceptance Criteria

The build is good enough for a client demo when:

1. A visitor can land on the website and understand the product in under 10 seconds.
2. The primary CTA clearly opens the interactive demo.
3. The demo reveals agent nodes under human org-chart nodes.
4. Human and agent nodes are clickable.
5. The demo clearly shows at least one over-permissioned agent.
6. The demo clearly shows at least one orphaned agent.
7. The HR event simulation creates a visible cascade of recommended actions.
8. The app-owner approval queue feels like a real workflow.
9. The audit packet preview feels tangible and executive-ready.
10. The whole demo can be presented in 7 minutes without explaining missing features.
11. All fake actions are clearly simulated but polished.
12. The design looks credible enough for a CISO, CIO, or Head of IAM conversation.

---

# Part 14: Deliverables for AI Designer

Ask the AI designer to produce:

1. Static website landing page
2. Static clickable product demo
3. Shared design system styles
4. Seeded demo data in a local JSON file or JS object
5. Clickable navigation between screens
6. Realistic hover, selected, active, modal, toast, and drawer states
7. Desktop-first product demo
8. Mobile-friendly website
9. Exportable folder or zip containing HTML, CSS, JS, and assets

Suggested file structure:

```text
/pedigree-demo
  /index.html
  /demo.html
  /assets
    logo.svg
    icons.svg
  /css
    styles.css
  /js
    demo-data.js
    demo.js
```

If using React:

```text
/pedigree-demo
  /src
    /components
    /data
    /pages
    /styles
  package.json
  vite.config.js
```

---

# Part 15: Builder Prompt for AI Designer

Use this prompt directly with the AI designer:

```text
Build a polished clickable HTML prototype for a startup called Pedigree.

Pedigree is the org chart for an enterprise AI workforce. It maps every AI agent to a human owner, permission boundary, app-owner approval, and HR lifecycle event.

Create two connected experiences:

1. A marketing landing page with the hero headline “Every Agent Has a Pedigree.” The main CTA should say “View Interactive Demo” and open the clickable product demo. The secondary CTA should say “Book Agent Lineage Assessment.”

2. A clickable product demo that looks like a modern enterprise SaaS dashboard. The main screen is an org chart for a fictional company called Apex Industrial Group. Human nodes appear first. A button labeled “Reveal Agent Workforce” expands AI agent nodes underneath humans. Agent nodes show risk, platform, apps touched, and owner.

The demo must include these screens:
- Agent Org Chart
- Risk Findings
- HR Event Simulation
- App Owner Approvals
- Audit Packet
- Settings

Use seeded data only. No backend. No real auth. No real API calls.

Key story:
Jane Smith is a Sales Operations Manager with 3 child agents. One agent, Forecast Cleanup Agent, is over-permissioned because it can export Salesforce opportunities and read Snowflake customer revenue data even though Jane does not have those entitlements. When Jane’s termination is simulated, Pedigree recommends suspending Forecast Cleanup Agent, transferring two approved agents to Marcus Reed, and routing one approval to Omar Patel, the Salesforce app owner.

The demo should include:
- Clickable human and agent nodes
- Right-side detail drawer
- Risk findings dashboard
- HR event simulation stepper
- App-owner approval queue
- Audit packet preview
- Toasts for simulated actions
- Polished hover and selected states
- Desktop-first layout, optimized for 1440 x 900

Design style:
Enterprise-grade, modern, confident, clean. Use deep navy, white, slate, blue, violet, teal, amber, and red risk accents. Avoid cartoon robots and generic AI imagery. The core visual metaphor is a real org chart with AI agents as child nodes.

The final prototype should be good enough to show a CISO, CIO, Head of IAM, or app owner in a 7-minute sales conversation.
```

---

# Part 16: Suggested Client Demo Script

## Opening

Most companies have a human org chart in Workday or their HR system. But they also have a second workforce emerging: AI agents created across tools, apps, and automation platforms.

The problem is that this agent workforce usually has no clean ownership model.

Pedigree gives every agent a human parent, permission boundary, approval path, and lifecycle tied to HR events.

## Main demo

This is the normal org chart. Now I reveal the agent workforce underneath it.

Jane Smith owns three agents. Two are clean. One is not.

The Forecast Cleanup Agent can export Salesforce opportunities and read customer revenue data from Snowflake. Jane does not have that permission, and the Salesforce app owner has not approved it.

Now let’s simulate Jane leaving the company.

Pedigree finds all child agents, evaluates their approvals and permissions, then recommends what should happen: suspend one, transfer two, and route one approval.

The final output is not just a dashboard. It is an audit evidence packet the customer can use with security, IAM, app owners, and auditors.

## Close

The first step is mapping the agent workforce. Once the lineage graph is trusted, enforcement and runtime controls become much easier.

