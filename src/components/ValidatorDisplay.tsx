import React from 'react';
import { PF1eStatBlock, ValidationResult } from '../types/PF1eStatBlock';

interface ValidatorDisplayProps {
  statBlock: PF1eStatBlock;
  validation: ValidationResult;
}

export const ValidatorDisplay: React.FC<ValidatorDisplayProps> = ({ statBlock, validation }) => {
  const statusColors: Record<string, string> = {
    PASS: 'bg-green-100 text-green-800 border-green-200',
    FAIL: 'bg-red-100 text-red-800 border-red-200',
    WARN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{statBlock.name}</h2>
          <p className="text-sm text-gray-500">
            {statBlock.size} {statBlock.creature_type} • CR {statBlock.cr_text || statBlock.cr}
          </p>
        </div>
        <span className={`px-4 py-1 rounded-full text-sm font-bold border ${statusColors[validation.status]}`}>
          {validation.status}
        </span>
      </div>

      <div className="space-y-3">
        {validation.messages.length === 0 ? (
          <p className="text-gray-500 italic">No validation errors found.</p>
        ) : (
          validation.messages.map((msg, idx) => (
            <div key={idx} className={`p-3 rounded border-l-4 ${msg.severity === 'error' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
              <div className="flex justify-between">
                <span className="font-mono text-xs uppercase tracking-wider opacity-75">{msg.rule_id}</span>
                <span className="text-xs text-gray-500">{msg.reference_doc}</span>
              </div>
              <p className="mt-1 font-medium text-gray-800">{msg.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
