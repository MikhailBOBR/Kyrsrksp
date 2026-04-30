# Changelog

## 1.0.0-rc.3 - 2026-04-30

- fixed GHCR image references for lowercase repository names in CD;
- enabled CD from the actual `master` branch in addition to `main` and release tags;
- hardened the release migration smoke step with PostgreSQL connection retries.

## 1.0.0-rc.1 - 2026-04-29

- aligned package, README, release checklist and OpenAPI metadata with the 1.0 pre-release candidate;
- added a deterministic surface-coverage gate for OpenAPI operations, server modules, frontend contracts and fuzz scenarios;
- kept raw Node/V8 coverage available as a separate diagnostic command;
- moved Docker validation and release migration smoke checks to PostgreSQL-backed one-off containers.

## 0.2.0-rc.1 - 2026-04-23

- stabilized drawer-based navigation and tightened click behavior for interactive frontend elements;
- expanded visual analytics, import/export flows, PDF report output and Swagger coverage;
- strengthened automated verification with frontend interaction contracts and 58 green tests;
- added a lightweight pre-release script and release checklist for the next deployment step.
