# ADR-001: Local-first single storage writer

Status: proposed bootstrap candidate; pending remote review/publication.

## Context
MV3 workers can stop between events. Multiple panels and context-menu events can race when they read and rewrite a shared clip array. The MVP must remain small, local-only and compatible with four permissions.

## Decision
Store one versioned appState snapshot in chrome.storage.local. Only repository.js in the service worker writes it, using a serial Promise queue and latest-state reads. UI commands use revision checks; panels observe storage.onChanged and reload after conflict. No content scripts, backend, synchronization service, polling or long-lived UI ports.

## Consequences
Single-writer serialization prevents normal concurrent read-modify-write loss. Closed panels do not affect saving. Restart recovery reads persisted state. A pending operation is not crash-durable; request IDs do not imply exactly-once semantics. Whole-state writes suit a small MVP but may need a later storage design if size/performance demands it. Quota failure preserves existing data. Unknown schemas are never reset.

## Alternatives
Direct UI writes are simpler superficially but allow lost updates. Per-clip keys or IndexedDB require more transaction/migration and UI reconciliation work. A permanent background process is not an MV3 assumption. Revisit via a new ADR with measured evidence, not silent feature-branch changes.

## Approval
Appa approval / Contract commit / merged ADR SHA: UNASSIGNED. Antigravity records actual evidence after review.
