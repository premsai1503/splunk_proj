
import React from 'react';
import Plot from 'react-plotly.js';
import { Message as MessageType } from '../types';
import { UserIcon, BotIcon, ExpandIcon } from './icons';

interface MessageProps {
    message: MessageType;
    onViewPlot: (plotJson: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onViewPlot }) => {
    const isUser = message.sender === 'user';

    const containerClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
    const bubbleClasses = `max-w-xl rounded-2xl p-4 ${isUser ? 'bg-red-700 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`;

    let plotData = null;
    if (message.plot) {
        try {
            plotData = JSON.parse(message.plot);
        } catch (e) {
            console.error("Failed to parse plot data", e);
        }
    }

    return (
        <div className={containerClasses}>
            {!isUser && (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                </div>
            )}
            <div className={`${bubbleClasses} group relative`}>
                {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
                {plotData && (
                    <div className="mt-2 w-full h-64 relative group/plot">
                        <Plot
                            data={plotData.data}
                            layout={{ ...plotData.layout, autosize: true }}
                            config={plotData.config}
                            frames={plotData.frames}
                            useResizeHandler={true}
                            style={{ width: "100%", height: "100%" }}
                        />
                        <div
                            onClick={() => onViewPlot(message.plot!)}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover/plot:bg-opacity-10 transition-all duration-300 flex items-center justify-center cursor-pointer rounded-lg z-10 pointer-events-none group-hover/plot:pointer-events-auto">
                            <ExpandIcon className="w-10 h-10 text-slate-700 opacity-0 group-hover/plot:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 shadow-lg" />
                        </div>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon />
                </div>
            )}
        </div>
    );
};

export default Message;
