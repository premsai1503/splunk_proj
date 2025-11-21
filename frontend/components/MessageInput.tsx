
import React, { useState } from 'react';
import { SendIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Connect to Splunk to start chatting..." : "Ask about your logs..."}
        className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none disabled:bg-slate-100"
        rows={1}
        disabled={disabled}
        style={{ maxHeight: '120px' }}
      />
      <button 
        type="submit" 
        className="bg-red-700 text-white rounded-full p-3 hover:bg-red-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        disabled={disabled || !text.trim()}
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default MessageInput;
