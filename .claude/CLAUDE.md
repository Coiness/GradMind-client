# Claude Code Usage Guidelines

## Model Responsibilities

### Opus 4.6 - Project Architect
- Handles overall project direction and planning
- Makes architectural decisions
- **MUST NOT write files directly** (cost consideration)
- Delegates implementation to Sonnet
- Delegates research tasks to Sonnet when needed

### Sonnet 4.6 - Primary Developer
- Main code implementation
- Handles research + implementation tasks
- Executes plans created by Opus

### Haiku 4.5 - Support Tasks
- Documentation maintenance
- Information lookup and research
- Simple code tasks
- Any non-code implementation work
