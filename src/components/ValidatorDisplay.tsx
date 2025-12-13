import React from 'react';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';
import { sortMessages, formatStatusBadgeText } from '../lib/validationHelpers';

interface ValidatorDisplayProps {
  statBlock: PF1eStatBlock;
  validation: ValidationResult;
  validationTarget?: 'raw' | 'fixed'; // What version is being validated
}

/**
 * Traffic Light System (Tiered Reporting)
 * ---------------------------------------------------
 * This UI component renders validation messages using a 3-tier traffic light system:
 *  - Critical (🔴): illegal / structural / must fix -> severity: 'critical'
 *  - Warning  (🟡): suspicious / review -> severity: 'warning'
 *  - Note     (⚪): informational / flavor -> severity: 'note'
 *
 * Design Mode (default): validates the fixed block, but structural errors from the raw block
 * are merged and always surfaced.
 * Audit Mode           : validates the raw input only.
 *
 * The validationTarget prop ("raw" | "fixed") is used to label the badge and the
 * ARIA/tooltip for accessibility.
 */
export const ValidatorDisplay: React.FC<ValidatorDisplayProps> = ({ statBlock, validation, validationTarget }) => {
  
  // Helper to sort messages by severity: Critical -> Warning -> Note
  // Use shared sorter for determinism (keeps tests simple and consistent)
  const sortedMessages = sortMessages(validation.messages);

  const getBorderColor = (severity: string) => {
      switch(severity) {
          case 'critical': return '#ef4444'; // Red
          case 'warning': return '#f59e0b'; // Amber
          case 'note': return '#9ca3af'; // Gray
          default: return '#3b82f6'; // Blue
      }
  };

  const getBgColor = (severity: string) => {
      switch(severity) {
          case 'critical': return '#fef2f2';
          case 'warning': return '#fffbeb';
          case 'note': return '#f9fafb';
          default: return '#eff6ff';
      }
  };

  const getIcon = (severity: string) => {
      switch(severity) {
          case 'critical': return '🛑';
          case 'warning': return '⚠️';
          case 'note': return '📝';
          default: return 'ℹ️';
      }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PASS': return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' };
      case 'FAIL': return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' };
      case 'WARN': return { backgroundColor: '#fef9c3', color: '#854d0e', borderColor: '#fde047' };
      default: return {};
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '42rem', margin: '0 auto', fontFamily: 'sans-serif', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', backgroundColor: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{statBlock.name || 'Unnamed'}</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            {statBlock.size} {statBlock.type} • CR {statBlock.cr_text || statBlock.cr}
          </p>
        </div>
        {/* Overall Status Badge */}
        <span
          title={validationTarget === 'fixed' ? 'Validating fixed (auto-fixed) version — see right panel' : 'Validating raw input version'}
          style={{ padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', border: '1px solid', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', ...getStatusStyle(validation.status || 'PASS') }}
        >
            {formatStatusBadgeText(validation.status || 'PASS', validationTarget)}
        </span>
      </div>

      {/* Message List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontStyle: 'italic', border: '2px dashed #e5e7eb', borderRadius: '0.5rem' }}>
             ✨ No issues found. This stat block is mechanically perfect.
          </div>
        ) : (
          sortedMessages.map((msg, idx) => (
            <div key={idx} style={{ 
                padding: '0.75rem', 
                borderRadius: '0.25rem', 
                borderLeftWidth: '4px', 
                borderLeftStyle: 'solid',
                border: '1px solid #e5e7eb',
                borderLeftColor: getBorderColor(msg.severity),
                backgroundColor: getBgColor(msg.severity)
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                 <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {getIcon(msg.severity)} {msg.category.toUpperCase()}
                 </span>
              </div>
              <p style={{ color: '#1f2937', margin: 0 }}>{msg.message}</p>
              
              {/* Optional: Show expected/actual diff if data is there */}
              {(msg.expected !== undefined || msg.actual !== undefined) && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.5)', padding: '0.25rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                      {msg.actual !== undefined && <span style={{ marginRight: '0.5rem', color: '#dc2626' }}>Found: {JSON.stringify(msg.actual)}</span>}
                      {msg.expected !== undefined && <span style={{ color: '#16a34a' }}>Expected: {JSON.stringify(msg.expected)}</span>}
                  </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
