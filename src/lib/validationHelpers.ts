import type { ValidationMessage } from '../types/PF1eStatBlock';

// Sort severity mapping: critical -> 0, warning -> 1, note -> 2
export function sortMessages(messages: ValidationMessage[]) {
  const order: Record<string, number> = { critical: 0, warning: 1, note: 2 };
  return [...messages].sort((a, b) => order[a.severity] - order[b.severity]);
}

export function computeValidationStatus(messages: ValidationMessage[]) {
  const hasCritical = messages.some(m => m.severity === 'critical');
  const hasWarning = messages.some(m => m.severity === 'warning');

  if (hasCritical) return 'FAIL';
  if (hasWarning) return 'WARN';
  return 'PASS';
}

export function formatStatusBadgeText(status: string, target?: 'raw' | 'fixed') {
  const targetLabel = target === 'fixed' ? 'Fixed' : target === 'raw' ? 'Raw' : undefined;
  const arrow = target === 'fixed' ? ' ➡' : '';
  return `${status}${targetLabel ? ` (${targetLabel})` : ''}${arrow}`;
}
