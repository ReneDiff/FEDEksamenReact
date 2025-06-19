import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; 
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Selve modal-indholdet. stopPropagation forhindrer at et klik her lukker modalen */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* En luksus "luk"-knap */}
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}