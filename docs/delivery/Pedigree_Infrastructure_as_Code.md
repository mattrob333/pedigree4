# Pedigree Infrastructure as Code (IaC) Specification
**Version:** 1.0  
**Date:** April 27, 2026  
**Target:** Azure (multi-tenant landing zone + per-customer isolated resources). Terraform 1.9+ + Bicep for Azure-native resources.  
**Goal:** Reproducible, secure, cost-efficient infrastructure that supports the 90-day MVP and scales to 50+ enterprise tenants.

---

## 1. High-Level Architecture (Azure)
**Landing Zone (Shared):**
- Resource Group: `pedigree-landingzone`
- Virtual Network + Private Endpoints for all services.
- Azure Container Registry (ACR) for images.
- Key Vault (central) + Managed Identities.
- Log Analytics + Application Insights (centralized observability).
- Azure Front Door / Application Gateway (WAF + DDoS) for public UI.
- Entra ID App Registrations + Conditional Access policies (template).

**Per-Tenant (Isolated):**
- Resource Group: `pedigree-{tenant-slug}`
- Azure Container Apps (or AKS cluster per large tenant) for services.
- Azure Database for PostgreSQL Flexible Server (with PITR, encryption).
- Azure Cache for Redis.
- Neo4j Aura (or self-hosted on Container Apps / AKS for cost control in MVP).
- Azure Blob Storage (immutable audit exports, with lifecycle to cool/archive).
- Key Vault (customer-specific secrets).
- Private Endpoints to Dataverse / Microsoft Graph (via customer consent).

**Networking:**
- Hub VNet (landing zone) + Spoke VNets (per tenant) with VNet peering or Azure Virtual WAN.
- All traffic private except UI (fronted by WAF).
- NSGs + Azure Firewall for egress control.

---

## 2. Terraform / Bicep Modules (Recommended Structure)

**Root:**
```
infra/
├── landingzone/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── networking/
│       ├── observability/
│       ├── security/
│       └── acr/
├── tenants/
│   ├── main.tf (per-tenant module call)
│   └── modules/
│       ├── postgres/
│       ├── redis/
│       ├── container-apps/
│       ├── neo4j/
│       ├── storage/
│       └── keyvault/
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

**Key Modules (MVP):**
- **networking:** VNet, subnets, private endpoints, NSG, Private DNS zones.
- **security:** Managed Identities, Key Vault, Entra app registration (Bicep for simplicity), Conditional Access template.
- **container-apps:** Azure Container Apps environment + apps for ingestion, graph, policy, gateway, ui. With Dapr for service-to-service if needed.
- **postgres:** Flexible Server with geo-redundant backup, private endpoint, AAD auth.
- **redis:** Premium tier with clustering for cache + queue.
- **neo4j:** Container App + persistent volume (or Aura via provider for managed).
- **storage:** Blob with immutable policy for audit bundles.

**Example (simplified Terraform for per-tenant Postgres):**
```hcl
module "postgres" {
  source = "./modules/postgres"
  tenant_slug = var.tenant_slug
  location    = var.location
  sku_name    = "GP_Standard_D2s_v3"
  storage_mb  = 32768
  version     = "16"
  private_endpoint_subnet_id = module.networking.private_endpoint_subnet_id
  key_vault_id = module.keyvault.id
}
```

---

## 3. Deployment Strategy
- **IaC Pipeline:** GitHub Actions → `terraform plan` (on PR) → `terraform apply` (main, with approval for prod).
- **Image Build:** GitHub Actions → Docker build → push to ACR → update Container App revision.
- **Per-Tenant Provisioning:** New customer → run `terraform apply -var="tenant_slug=contoso"` (creates isolated RG + resources + Entra app + Dataverse app registration template).
- **Secrets:** Azure Key Vault + Managed Identity (no secrets in state or code). Customer provides Workday/Entra client secrets via secure upload or self-service portal (future).

---

## 4. Cost & Scaling (MVP Estimates)
- **Small tenant (1k agents):** ~$800–1,200/month (Container Apps + Postgres + Redis + monitoring).
- **Medium (10k agents):** ~$3–5k/month (scale Container Apps + Neo4j cluster).
- **Landing zone shared:** ~$1.5k/month (amortized).
- **Optimization:** Serverless where possible (Azure Functions for ingestion workers), spot instances for non-prod, auto-pause for dev/staging.

---

## 5. Security & Compliance Controls (IaC-Enforced)
- Private endpoints everywhere.
- Encryption at rest (customer-managed keys option in v1.1).
- Azure Policy / Defender for Cloud baselines applied at landing zone.
- Immutable storage for audit exports (WORM policy).
- Network isolation (no public access to data plane).
- Regular drift detection (Terraform Cloud or Atlantis).

---

## 6. Future (Post-MVP)
- Multi-region active-active (Azure Front Door + Cosmos DB / Neo4j replication).
- Customer-managed landing zone (bring-your-own-subscription model).
- Kubernetes (AKS) for complex tenants needing custom sidecars.
- Cost attribution per tenant with Azure Cost Management tags.

**This IaC spec gives the coding agent a clear blueprint to stand up dev/staging/prod environments in hours, not days.** All resources are defined as code and repeatable for new design partners.

Next in batch: Sample Code Skeletons + Wesco PoC Playbook.