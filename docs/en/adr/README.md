# Architectural Decision Records (ADRs)

**📖 [English](./README.md) | [Español](../../es/adr/README.md)**

This directory contains Architectural Decision Records (ADRs) that document significant architectural decisions made in this project.

## What are ADRs?

ADRs are documents that capture important architectural decisions along with their context and consequences. They help:

- **Document decisions:** Record why certain choices were made
- **Share knowledge:** Help team members understand the reasoning behind architectural choices
- **Maintain consistency:** Provide reference for future decisions
- **Onboard new developers:** Quickly understand project architecture and decisions

## ADR Format

Each ADR follows a standard format:

- **Title:** Clear, descriptive title
- **Status:** Current status (Accepted, Proposed, Deprecated, etc.)
- **Date:** When the decision was made
- **Context:** The situation and problem that led to this decision
- **Decision:** The architectural choice that was made
- **Consequences:** Positive and negative impacts of the decision

## Current ADRs

- [ADR-001: Separation of Responsibilities - Core, Shared, and Features](./ADR-001.md)
- [ADR-002: Adoption of the Official Angular Style Guide](./ADR-002.md)
- [ADR-003: Use of Tailwind CSS for Utility Classes and Component Creation](./ADR-003.md)
- [ADR-004: AI-Assisted Development Rules](./ADR-004.md)
- [ADR-005: Internationalization (i18n) Strategy](./ADR-005.md)
- [ADR-006: Repository Pattern for REST Services](./ADR-006.md)
- [ADR-007: Testing Strategy](./ADR-007.md)
- [ADR-008: Form Validation Strategy](./ADR-008.md)
- [ADR-009: Code Quality & Tooling](./ADR-009.md)
- [ADR-010: Icon Usage Strategy](./ADR-010.md)
- [ADR-011: Documentation Strategy](./ADR-011.md)
- [ADR-012: Access modifiers and readonly convention in TypeScript](./ADR-012.md)
- [ADR-013: Form Layout and Structure](./ADR-013.md)

## Creating a New ADR

When making a significant architectural decision:

1. **Create a new file:** `ADR-XXX.md` where XXX is the next sequential number
2. **Use the template:** Follow the format of existing ADRs
3. **Be thorough:** Include context, decision rationale, and consequences
4. **Add examples:** Include code examples when relevant
5. **Update the index:** Add a link in `README.md` and this README

## ADR Statuses

- **Proposed:** Decision is under consideration
- **Accepted:** Decision has been approved and implemented
- **Deprecated:** Decision has been superseded by a newer ADR
- **Superseded:** Replaced by another ADR (reference the new ADR)

## References

- [ADR GitHub Repository](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Architecture Documentation](../README.md)

