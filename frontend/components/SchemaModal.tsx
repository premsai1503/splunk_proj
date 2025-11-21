
import React from 'react';
import { SchemaData } from '../types';
import { XIcon } from './icons';

interface SchemaModalProps {
  schemaData: SchemaData;
  onClose: () => void;
}

const SchemaModal: React.FC<SchemaModalProps> = ({ schemaData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-red-700">Splunk Data Schema</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <XIcon />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-4">
            {schemaData.columns.map(column => (
              <div key={column.name} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-semibold font-mono text-slate-800">{column.name}</h3>
                  <span className="text-sm font-medium uppercase text-white bg-red-700 px-2 py-0.5 rounded">{column.type}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-600 mb-1">Possible Values:</h4>
                  {column.values.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {column.values.map((value, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-xs font-mono px-2 py-1 rounded">
                          {value}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No predefined values (e.g., free text).</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SchemaModal;
