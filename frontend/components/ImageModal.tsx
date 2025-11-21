
import React from 'react';
import { XIcon } from './icons';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition"
      >
        <XIcon className="w-8 h-8" />
      </button>
      <div 
        className="max-w-full max-h-full"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking on the image
      >
        <img 
          src={imageUrl} 
          alt="Fullscreen view" 
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;
