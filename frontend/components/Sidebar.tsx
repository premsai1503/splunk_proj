
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SchemaData, ConnectionStatus } from '../types';
import { DatabaseIcon, StatusOnlineIcon, StatusOfflineIcon, CodeIcon } from './icons';

interface SidebarProps {
  connectionStatus: ConnectionStatus;
  onConnect: () => void;
  schemaData: SchemaData | null;
  onViewSchema: () => void;
}

const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const statusConfig = {
    disconnected: { text: 'Disconnected', color: 'bg-slate-400', icon: <StatusOfflineIcon /> },
    connecting: { text: 'Connecting...', color: 'bg-yellow-400', icon: <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse" /> },
    connected: { text: 'Connected', color: 'bg-green-500', icon: <StatusOnlineIcon /> },
    error: { text: 'Connection Error', color: 'bg-red-500', icon: <StatusOfflineIcon /> },
  };

  const { text, icon } = statusConfig[status];

  return (
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ connectionStatus, onConnect, schemaData, onViewSchema }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 280 && newWidth < 600) { // Min and max width
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <>
      <aside 
        ref={sidebarRef}
        className="bg-white border-r border-slate-200 flex flex-col p-4 relative"
        style={{ width: sidebarWidth }}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Connection</h2>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <StatusIndicator status={connectionStatus} />
              <button
                onClick={onConnect}
                disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                className="w-full flex items-center justify-center space-x-2 bg-red-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <DatabaseIcon />
                <span>{connectionStatus === 'connected' ? 'Connected' : 'Connect to Splunk'}</span>
              </button>
            </div>
          </div>

          {connectionStatus === 'connected' && schemaData && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Data Schema</h2>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <p className="text-sm text-slate-600">Available columns from Splunk.</p>
                <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  {schemaData.columns.map((col) => (
                    <div key={col.name} className="p-2 bg-white rounded border border-slate-200">
                      <p className="font-mono text-sm font-semibold text-red-700">{col.name}</p>
                      <p className="text-xs text-slate-500 uppercase">{col.type}</p>
                    </div>
                  ))}
                </div>
                 <button
                    onClick={onViewSchema}
                    className="w-full mt-2 flex items-center justify-center space-x-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <CodeIcon />
                    <span>View Full Schema</span>
                  </button>
              </div>
            </div>
          )}
        </div>
      </aside>
      <div 
        className="w-1.5 cursor-col-resize bg-slate-200 hover:bg-red-700 transition-colors"
        onMouseDown={startResizing}
      />
    </>
  );
};

export default Sidebar;
