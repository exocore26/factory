# Exocore-26 Factory — Common Tool Requirements Forge

A dependency-free static website for Git hosting. It walks a user through a structured discovery sequence and generates:

- `Requirements.md` — a working requirements specification.
- `TODO.md` — an implementation sequence with Parent-Engine extraction checkpoints.
- a JSON session file — the structured answers used to produce the documents.

## Why this asset exists

The brainstorming tree supplied with this asset contains several recurring themes: agents, HITL collaboration, guided specification, app generation, knowledge architecture, prompting, role systems, tool integration, scaffolding, tiny scripts and factory outputs. This Forge treats those themes as evidence of repeated mechanisms and asks the user to test whether a mechanism should become a reusable Parent-Engine primitive.

The Forge deliberately does **not** assume that the proposed common capabilities already exist. They are generated as extraction candidates and must pass a second-consumer/reuse test before being promoted.

## Candidate common primitives encoded by the Forge

- Requirement Intake & Resolver
- Question-Set Engine
- Context / Knowledge Resolver
- Schema & Contract Registry
- Workflow / Task Orchestrator
- HITL Gate & Role Resolver
- Prompt / Instruction Composer
- Validation & Acceptance Engine
- Artefact Generator
- Adapter Boundary / Connector Layer
- Provenance / Session Log
- Guided Form / UI Renderer
- Scaffold / Template Engine
- Capability / Tool Registry

## Run locally

Open `index.html` in a browser. No build step and no external dependencies are required.

## GitHub Pages

Push the contents of this directory to a repository, then enable GitHub Pages for the repository's branch/root containing `index.html`.

## Intended workflow

1. Define the sub-project problem.
2. Describe inputs, decisions and outputs.
3. Select candidate reusable mechanisms.
4. Define HITL/role and resource constraints.
5. Define acceptance criteria and exclusions.
6. Review the proposed Parent-Engine boundary.
7. Generate the requirements and TODO artefacts.
8. Test the extracted capability against a second consumer before making it a Parent-Engine primitive.

## Source basis

The supplied brainstorming-directory tree was used as the structural source for the categories and recurring themes. The common-tool list and generator logic are **architectural inference**, not a claim that the tree proves each capability already exists.
