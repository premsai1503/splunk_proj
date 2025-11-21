
import React, { useState, useEffect } from 'react';
import { ConnectionStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, SpinnerIcon } from './icons';

interface ConnectionModalProps {
  status: ConnectionStatus;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ status, onClose }) => {
  const [progress, setProgress] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'connecting') {
      const steps = ["Initializing connection...", "Authenticating...", "Fetching data schema..."];
      let currentStep = 0;
      setProgress([steps[0]]);
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setProgress(prev => [...prev, steps[currentStep]]);
        } else {
          clearInterval(interval);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [status]);
  
  const isFinished = status === 'connected' || status === 'error';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Splunk Connection</h2>
        
        {status === 'connecting' && (
          <div className="space-y-3">
            {progress.map((step, index) => (
              <div key={index} className="flex items-center space-x-3 text-slate-600 animate-fade-in">
                <SpinnerIcon />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {status === 'connected' && (
          <div className="text-center space-y-4 animate-fade-in">
            <CheckCircleIcon className="mx-auto text-green-500" />
            <p className="text-lg font-semibold text-slate-700">Connection Successful!</p>
            <p className="text-slate-500">You can now start analyzing your Splunk logs.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4 animate-fade-in">
            <XCircleIcon className="mx-auto text-red-500" />
            <p className="text-lg font-semibold text-slate-700">Connection Failed</p>
            <p className="text-slate-500">Please check your configuration and try again.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            disabled={!isFinished}
            className="bg-red-700 text-white font-semibold py-2 px-8 rounded-lg hover:bg-red-800 transition-colors disabled:bg-slate-300 disabled:cursor-wait"
          >
            {isFinished ? 'OK' : 'Connecting...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal;
