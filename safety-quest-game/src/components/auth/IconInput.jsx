import React from 'react';

const IconInput = ({ id, label, icon: Icon, type = 'text', value, onChange, placeholder, name, required = false }) => {
    const inputId = id || `icon-input-${name || label}`;
    return (
        <div className="icon-input">
            <label htmlFor={inputId} className="icon-input__label">
                {label}
            </label>
            <div className="icon-input__field-wrap">
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={type === 'password' ? 'current-password' : 'username'}
                    className="icon-input__field"
                />
                {Icon && (
                    <span className="icon-input__icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={2} />
                    </span>
                )}
            </div>
        </div>
    );
};

export default IconInput;
