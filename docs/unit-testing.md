---
alwaysApply: true
---

## Unit testing

- All tests must be written using Jest
- Follow the AAA pattern: Arrange, Act, Assert
- Each test must validate a single behavior
- Use descriptive test names in it() / test() that describe the expected behavior
- Always include both:
  - Positive scenarios (expected correct behavior)
  - Negative scenarios (edge cases, invalid inputs, error handling)
- Prefer test doubles (mocks, spies, stubs) for external dependencies
- Avoid relying on implementation details; test public APIs
- Keep tests isolated and deterministic (no shared state, no network/file system dependencies)
- Aim for a balance between unit tests (fast, isolated) and integration tests (components + services)
- Ensure branch coverage ≥ 80% and focus on critical paths
- When testing components:
  - Use Angular’s ComponentFixture only when necessary; prefer testing logic in isolation
  - Use Harnesses for Angular Material components instead of querying DOM directly
- When testing signals:
  - Validate both initial value and state updates
  - Include tests for computed() to ensure derived state correctness