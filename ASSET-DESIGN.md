# Asset Design Notes

## Meta-systemic thesis

The most valuable reusable asset is not another project-specific application. It is a set of stable primitives that let sub-projects declare intent, resolve requirements, retrieve context, invoke bounded operations, preserve HITL gates, validate results and render artefacts without reimplementing those mechanisms.

## Parent-Engine candidates

1. Intake / Resolver — turns ambiguous intent into a structured project brief.
2. Question-Set Engine — stores and executes conditional discovery sequences.
3. Context / Knowledge Resolver — separates source selection from task execution.
4. Schema / Contract Registry — makes inputs, outputs and interfaces explicit and versioned.
5. Workflow / Task Orchestrator — coordinates steps without embedding project semantics in the runner.
6. HITL Gate / Role Resolver — keeps human decisions and permissions explicit.
7. Prompt / Instruction Composer — assembles bounded instructions from structured context.
8. Validation / Acceptance Engine — converts requirements into repeatable checks.
9. Artefact Generator — renders structured results into project-facing files.
10. Adapter / Connector Layer — isolates external services and project-specific IO.
11. Provenance / Session Log — makes runs inspectable and replay-oriented.
12. Guided Form / UI Renderer — renders the discovery process from data rather than hardcoding it.
13. Scaffold / Template Engine — creates repeatable project skeletons.
14. Capability / Tool Registry — lets sub-projects discover and invoke shared capabilities.

## Boundary principle

Keep these kinds of concerns in the Parent-Engine:

- contract semantics
- generic state transitions
- validation rules
- role/HITL mechanics
- orchestration mechanics
- common context selection
- artefact rendering mechanics
- adapter interfaces
- provenance

Keep these kinds of concerns in sub-projects unless repeated across multiple consumers:

- domain-specific business rules
- project-specific UI copy
- target-platform quirks
- one-off integrations
- content and assets
- domain schemas that have no second consumer

## Resource principle

The UI defaults to a freemium-first / low-resource profile so that generated requirements can keep heavyweight infrastructure optional and explicit.
