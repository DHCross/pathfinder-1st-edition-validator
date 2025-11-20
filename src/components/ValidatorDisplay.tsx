import React from 'react';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';

interface ValidatorDisplayProps {
  statBlock: PF1eStatBlock;
  validation: ValidationResult;
}

export const ValidatorDisplay: React.FC<ValidatorDisplayProps> = ({ statBlock, validation }) => {
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{statBlock.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            {statBlock.size} {statBlock.type} • CR {statBlock.cr_text || statBlock.cr}
          </p>
        </div>
        <span style={{ padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', border: '1px solid', ...getStatusStyle(validation.status || 'PASS') }}>
          {validation.status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {validation.messages.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No validation errors found.</p>
        ) : (
          validation.messages.map((msg, idx) => (
            <div key={idx} style={{ 
                padding: '0.75rem', 
                borderRadius: '0.25rem', 
                borderLeftWidth: '4px', 
                borderLeftStyle: 'solid',
                backgroundColor: msg.severity === 'error' ? '#fef2f2' : '#fefce8',
                borderLeftColor: msg.severity === 'error' ? '#ef4444' : '#eab308'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.75 }}>{msg.category}</span>
              </div>
              <p style={{ marginTop: '0.25rem', fontWeight: 500, color: '#1f2937' }}>{msg.message}</p>
              {msg.expected !== undefined && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#6b7280' }}>
                    Expected: {JSON.stringify(msg.expected)} | Actual: {JSON.stringify(msg.actual)}
                  </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
