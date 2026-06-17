import React from 'react';
import '../styles/Button.css';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}) {
  const buttonClass = `btn btn-${variant} ${className}`;

  return (
    <button type={type} className={buttonClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
