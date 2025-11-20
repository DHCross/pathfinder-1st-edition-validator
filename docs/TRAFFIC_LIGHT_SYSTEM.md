# Traffic Light System

## Purpose

Provide a fast, readable summary of validation health so designers immediately know:

* what is **broken** (critical),
* what is **suspicious** (warning),
* what is merely **informational** (note).

The system must never hide structural errors, even in Design Mode.

---

## Severity Tiers

### 🔴 Critical — `severity: 'critical'`

**Meaning:** Structural, mathematical, or rules-illegal states.

**Examples:**

* Illegal BAB for HD/type progression
* CR/XP contradiction
* HD/CR mismatch (structural chassis error)

**Behavior:**

* Forces `status: 'FAIL'` globally.
* Must be addressed; Design Mode may auto-fix math, but structural errors remain surfaced.

---

### 🟡 Warning — `severity: 'warning'`

**Meaning:** Deviations from CR benchmarks or expected chassis that may be intentional.

**Examples:**

* Damage sponge or glass-cannon HP
* Low or unusually high AC vs CR
* CMD following an illegal BAB (root-cause trace)
* Missing but non-breaking feats

**Behavior:**

* Sets `status: 'WARN'` if no criticals exist.
* User may override; Design Mode suggests fixes but never forces them.

---

### ⚪ Note — `severity: 'note'`

**Meaning:** Informational, flavor, or values that are valid but worth surfacing.

**Examples:**

* AC deviates from calculated due to natural armor
* Flavor-only fields preserved

**Behavior:**

* Does not affect final PASS/WARN/FAIL state.
* Sorted last in UI.

---

## Overall Status Rules

Computed in this order:

1. If any critical → `FAIL`
2. Else if any warning → `WARN`
3. Else → `PASS`

This aligns with `ValidationResult.status`.

---

## Mode-Specific Rules

### Design Mode

* Validates the **auto-fixed** stat block.
* Always merges **structural errors from the raw block** so auto-fix cannot hide contradictions.
* PASS (Fixed) shows arrow: `“PASS (Fixed) ➡”`.

### Audit Mode

* Validates the **raw input** only.
* No structural merging; no auto-fix applied.
* Badge: `“PASS (Raw)”`, `“WARN (Raw)”`, etc.

---

## UI Behavior

* Messages sorted: **Critical → Warning → Note**.
* Color-coded icons in `ValidatorDisplay.tsx`.
* Badge includes:
  * Target ("Raw" or "Fixed")
  * Directional cue (➡) for fixed-version validation.
  * Tooltip explaining validation target.
* Structural messages always surfaced at top regardless of mode.

---

## Interaction Workflow

1. Fix all criticals first (no exceptions).
2. Review warnings:
   * Accept or reject suggested fixes.
   * Intent-first: designer may keep high HP, glass cannon, etc.
3. Notes can be ignored or used as flavor justification.

---

## Relevant Code Locations

* Severity types: `src/types/PF1eStatBlock.ts`
* UI rendering & grouping: `src/components/ValidatorDisplay.tsx`
* Structural logic:
  * HD/CR mismatch → `src/engine/validateBasics.ts`
  * CMD root-cause tracing → `src/engine/validateBasics.ts`
* Benchmark logic: `src/engine/validateBenchmarks.ts`
* Economy logic: `src/engine/validateEconomy.ts`

---

## Optional Enhancements

* Dual-status header: show Raw vs Fixed badges side-by-side.
* Diff badge: `“Δ −2 Critical / −3 Warning”` comparing raw vs fixed.
* One-click remediation for common warnings (add placeholder feat, normalize attack bonus, etc.).

---

This document is intentionally concise. If you want a longer narrative for internal team docs or a public README entry, we can expand by adding examples and actionable steps for each severity class.
