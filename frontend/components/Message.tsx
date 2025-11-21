
import React from 'react';
import { Message as MessageType } from '../types';
import { UserIcon, BotIcon, ExpandIcon } from './icons';

interface MessageProps {
  message: MessageType;
  onViewImage: (url: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onViewImage }) => {
  const isUser = message.sender === 'user';

  const containerClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-xl rounded-2xl p-4 ${isUser ? 'bg-red-700 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`;
  
  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <BotIcon />
        </div>
      )}
      <div className={`${bubbleClasses} group relative`}>
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        {message.imageUrl && (
          <div className="mt-2">
            <img 
              src={message.imageUrl}
              alt="Generated chart"
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onViewImage(message.imageUrl)}
            />
            <div 
              onClick={() => onViewImage(message.imageUrl)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer rounded-lg">
              <ExpandIcon className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
