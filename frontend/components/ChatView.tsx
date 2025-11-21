
import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';
import MessageInput from './MessageInput';

interface ChatViewProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onViewImage: (url: string) => void;
  isSplunkConnected: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 p-3">
    <span className="text-slate-500">Bot is thinking</span>
    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
  </div>
);


const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading, onSendMessage, onViewImage, isSplunkConnected }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} onViewImage={onViewImage} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200">
        <MessageInput onSendMessage={onSendMessage} disabled={!isSplunkConnected || isLoading} />
      </div>
    </div>
  );
};

export default ChatView;
