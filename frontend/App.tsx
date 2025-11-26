
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ConnectionModal from './components/ConnectionModal';
import SchemaModal from './components/SchemaModal';
import PlotModal from './components/PlotModal';
import { Message, ConnectionStatus, SchemaData } from './types';
import { connectToSplunk, generateResponse } from './services/apiService';

const App: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [schemaData, setSchemaData] = useState<SchemaData | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial',
            sender: 'bot',
            text: 'Hello! Please connect to Splunk using the sidebar to begin analyzing your log data.',
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal states
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
    const [fullscreenPlotJson, setFullscreenPlotJson] = useState<string | null>(null);

    const handleConnect = useCallback(async () => {
        setIsConnecting(true);
        setConnectionStatus('connecting');
        try {
            // const data = await connectToSplunk();  // connect to localhost:3000/connect
            const response = await fetch("http://localhost:8000/connect")

            // Check if the response is ok (status in 200-299 range)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // ✅ Parse the JSON body
            const backendData = await response.json();

            // 🔁 Transform backend format → your SchemaData format
            const transformedSchema: SchemaData = {
                columns: backendData.columns.map((name: string) => {
                    const pandasType = backendData.column_types[name];

                    // Map pandas/numpy types to your frontend types
                    let frontendType: 'string' | 'number' | 'datetime' | 'category' = 'string';

                    if (pandasType.includes('datetime')) {
                        frontendType = 'datetime';
                    } else if (pandasType.includes('int') || pandasType.includes('float')) {
                        frontendType = 'number';
                    } else if (pandasType === 'object' || pandasType === 'category') {
                        // You might want to treat 'object' as 'string' or 'category'
                        // For now, default to 'string'; enhance later if you send distinct values
                        frontendType = 'category'; // or 'category' if you plan to add values
                    }

                    // Note: backend doesn't send `values` yet!
                    // You'll need to extend your API if you want sample/distinct values.
                    return {
                        name,
                        type: frontendType,
                        values: backendData.values[name] || [], // ⚠️ backend doesn't provide this yet
                    };
                })
            };
            console.log(transformedSchema);
            setSchemaData(transformedSchema);
            setConnectionStatus('connected');
            // The modal will handle its own closing via a prop
        } catch (error) {
            console.error("Connection failed:", error);
            setConnectionStatus('error');
        }
    }, []);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text,
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const botResponse = await fetch("http://localhost:8000/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: text })
            }); // connect to localhost:3000/generate and handle the responses

            if (!botResponse.ok) {
                throw new Error(`HTTP error! status: ${botResponse.status}`);
            }

            const botData = await botResponse.json();
            const botText = botData.text;
            const botPlot = botData.plot;
            // const botImage = botData.image; // Removed as per request

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text: botText,
                plot: botPlot,
                // imageUrl: `data:image/png;base64,${botImage}` // Removed
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                sender: 'bot',
                text: 'Sorry, I encountered an error. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleViewPlot = useCallback((plotJson: string) => {
        setFullscreenPlotJson(plotJson);
    }, []);


    return (
        <div className="flex h-screen font-sans bg-slate-100 text-slate-900">
            <Sidebar
                connectionStatus={connectionStatus}
                onConnect={handleConnect}
                schemaData={schemaData}
                onViewSchema={() => setIsSchemaModalOpen(true)}
            />
            <main className="flex-1 flex flex-col h-screen">
                <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
                    <h1 className="text-xl font-bold text-red-700">Splunk Log Analyzer</h1>
                </header>
                <ChatView
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                    onViewPlot={handleViewPlot}
                    isSplunkConnected={connectionStatus === 'connected'}
                />
            </main>

            {isConnecting && (
                <ConnectionModal
                    status={connectionStatus}
                    onClose={() => setIsConnecting(false)}
                />
            )}

            {isSchemaModalOpen && schemaData && (
                <SchemaModal
                    schemaData={schemaData}
                    onClose={() => setIsSchemaModalOpen(false)}
                />
            )}

            {fullscreenPlotJson && (
                <PlotModal
                    plotJson={fullscreenPlotJson}
                    onClose={() => setFullscreenPlotJson(null)}
                />
            )}
        </div>
    );
};

export default App;
