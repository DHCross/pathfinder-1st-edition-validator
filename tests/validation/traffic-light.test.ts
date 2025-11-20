import { describe, it, expect } from 'vitest';
import { sortMessages, computeValidationStatus, formatStatusBadgeText } from '../../src/lib/validationHelpers';

import type { ValidationMessage } from '../../src/types/PF1eStatBlock';

describe('Traffic Light System - Helpers', () => {
  it('sorts messages critical -> warning -> note', () => {
    const messages: ValidationMessage[] = [
      { severity: 'note', category: 'n', message: 'note' },
      { severity: 'warning', category: 'w', message: 'warn' },
      { severity: 'critical', category: 'c', message: 'crit' }
    ];

    const sorted = sortMessages(messages);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('warning');
    expect(sorted[2].severity).toBe('note');
  });

  it('computes validation status correctly', () => {
    const critical: ValidationMessage[] = [{ severity: 'critical', category: 's', message: 'x' }];
    const warning: ValidationMessage[] = [{ severity: 'warning', category: 's', message: 'y' }];
    const note: ValidationMessage[] = [{ severity: 'note', category: 's', message: 'z' }];

    expect(computeValidationStatus(critical)).toBe('FAIL');
    expect(computeValidationStatus(warning)).toBe('WARN');
    expect(computeValidationStatus(note)).toBe('PASS');

    // Mixed cases
    expect(computeValidationStatus([...warning, ...note])).toBe('WARN');
    expect(computeValidationStatus([...critical, ...warning, ...note])).toBe('FAIL');
  });

  it('formats badge text with target correctly', () => {
    expect(formatStatusBadgeText('PASS', 'fixed')).toContain('PASS');
    expect(formatStatusBadgeText('PASS', 'fixed')).toContain('Fixed');
    expect(formatStatusBadgeText('PASS', 'fixed')).toContain('➡');
    expect(formatStatusBadgeText('PASS', 'raw')).toContain('Raw');
  });
});
