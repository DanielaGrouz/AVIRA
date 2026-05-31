import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/components/CustomSelect.css';

const CustomSelect = ({
                          value,
                          onChange,
                          options,
                          placeholder = "Select an option",
                          placement = "bottom"
                      }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);
    return (
        <div className="custom-select-container" ref={dropdownRef}>
            <button
                type="button"
                className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <FaChevronDown
                    className="custom-select-icon"
                    style={{ transform: isOpen && placement === 'top' ? 'rotate(0deg)' : isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>

            {isOpen && (
                <div className={`custom-select-menu placement-${placement}`}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-select-option ${value === option.value ? 'is-selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;