import React from 'react';
import '../styles/components/InputField.css';

const InputField = ({
                        label,
                        id,
                        type = 'text',
                        error,
                        rightElement,
                        className = '',
                        ...props
                    }) => {
    return (
        <div className="input-group">
            {/* Render the top row only if a label or rightElement exists */}
            {(label || rightElement) && (
                <div className="input-label-row">
                    {label && <label htmlFor={id}>{label}</label>}
                    {rightElement && <div className="input-right-element">{rightElement}</div>}
                </div>
            )}

            <input
                id={id}
                type={type}
                className={`modern-input ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />

            {/* Optional inline error message specific to this input */}
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default InputField;