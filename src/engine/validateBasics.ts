import type { PF1eStatBlock, ValidationMessage } from '../types/PF1eStatBlock';

type BasicStatus = 'PASS' | 'WARN' | 'FAIL';

/**
 * Minimal basics validator used for Storybook demos.
 * This is intentionally small: it checks for a few required fields and
 * returns a friendly status/messages shape expected by the UI.
 */
export function validateBasics(statBlock: PF1eStatBlock | any): { status: BasicStatus; messages: ValidationMessage[] } {
  const messages: ValidationMessage[] = [];

  if (!statBlock) {
    messages.push({ severity: 'error', category: 'basics', message: 'No stat block provided.' });
    return { status: 'FAIL', messages };
  }

  // Check a few common required fields; if missing, warn.
  const required = ['name', 'cr', 'size', 'type'];
  for (const key of required) {
    if (statBlock[key] === undefined || statBlock[key] === null) {
      messages.push({ severity: 'warning', category: 'basics', message: `Missing field: ${key}` });
    }
  }

  // Example rule: classLevels or racialHD should exist for NPC/monster classification
  if (!statBlock.classLevels && !statBlock.racialHD && statBlock.racial_hd_count === undefined) {
    messages.push({ severity: 'info', category: 'basics', message: 'No class levels or racial HD provided; treating as simple monster.' });
  }

  // Determine status from messages
  const hasError = messages.some((m) => m.severity === 'error');
  const hasWarning = messages.some((m) => m.severity === 'warning');

  if (hasError) return { status: 'FAIL', messages };
  if (hasWarning) return { status: 'WARN', messages };
  return { status: 'PASS', messages };
}

export default validateBasics;
