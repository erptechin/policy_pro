// Import Dependencies
import clsx from "clsx";
import { forwardRef, useEffect, useState } from "react";
import Select from 'react-select';

// ----------------------------------------------------------------------

const SearchSelect = forwardRef(({ lists, onChange, value, name, error, label, placeholder, readOnly, multiple = false, req=false }, ref) => {
  const [newValue, setNewValue] = useState(multiple ? (Array.isArray(value) ? value : []) : value);

  useEffect(() => {
    setNewValue(multiple ? (Array.isArray(value) ? value : []) : value)
  }, [value, multiple]);


  const handleSelectionChange = (selectedOption) => {
    if (readOnly) return;

    if (multiple) {
      const selectedValues = selectedOption ? selectedOption.map(option => option.value) : [];
      setNewValue(selectedValues);
      onChange(selectedValues);
    } else {
      const selectedValue = selectedOption ? selectedOption.value : null;
      setNewValue(selectedValue);
      onChange(selectedValue);
    }
  };

  const getSelectedOptions = () => {
    if (!lists || !Array.isArray(lists)) return multiple ? [] : null;

    if (multiple) {
      if (!Array.isArray(newValue) || newValue.length === 0) return [];
      return lists.filter(item => newValue.includes(item.value));
    } else {
      if (!newValue) return null;
      return lists.find(item => item.value === newValue) || null;
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '8px',
      borderColor: error ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#9ca3af',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
          ? '#f3f4f6'
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#dbeafe',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1e40af',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#93c5fd',
        color: '#1e40af',
      },
    }),
  };

  return (
    <>
      <div>
        <div className="flex items-center">
          {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label} {req && (<span className="text-red-500">*</span>)}
          </label>}
        </div>

        <div className="relative">
          <Select
            ref={ref}
            name={name}
            value={getSelectedOptions()}
            onChange={handleSelectionChange}
            options={lists || []}
            isMulti={multiple}
            isDisabled={readOnly}
            placeholder={placeholder || 'Select an option...'}
            isClearable
            isSearchable
            styles={customStyles}
            className={clsx(
              "react-select-container",
              error && "react-select-error"
            )}
            classNamePrefix="react-select"
          />
        </div>
      </div>
    </>
  );
});

SearchSelect.displayName = "SearchSelect";

export { SearchSelect };
