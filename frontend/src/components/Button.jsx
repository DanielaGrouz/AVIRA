import React from 'react';
import '../styles/Button.css';

export default function Button({
                                   children,
                                   onClick,
                                   variant = 'primary',
                                   type = 'button',
                                   disabled = false,
                                   className = ''
                               }) {
    // Combine the base class, the variant class, and any custom classes passed in
    const buttonClass = `btn btn-${variant} ${className}`;

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}