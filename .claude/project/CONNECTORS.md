# Connector Plan

## Rule

Connect only what materially improves the build. More connectors can increase context, tool calls, and risk.

## Recommended baseline

| Connector | Scope | Use | Permission posture |
|---|---|---|---|
| GitHub | User or project | Repos, issues, PRs | Fine-grained token, repo-specific |
| Supabase/Postgres | Local or project | Schema/data analysis | Read-only for analysis |
| Vercel | User | Deployment checks | Project-limited |
| Google Drive/Docs | User | Project docs/specs | Folder-specific where possible |

## Do not store secrets here

Use environment variables or Claude MCP auth flows.
