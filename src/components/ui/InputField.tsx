import React from 'react';

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    type: string;
    large?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function InputField({
    label,
    placeholder,
    value,
    type = "text",
    large = false,
    onChange
}: InputFieldProps) {
    const baseStyles = `
        w-full rounded-md border border-gray-300 bg-white shadow-sm
        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
        transition-colors duration-200
        placeholder:text-gray-400
        ${large
            ? 'px-4 py-3 text-lg'
            : 'px-3 py-2 text-base'
        }
    `;

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            {large ? (
                <textarea
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    rows={3}
                    className={baseStyles}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={baseStyles}
                />
            )}
        </div>
    );
}
