import React from 'react';

const QuestionCard = ({ title, description, options, selectedValue, onChange }) => {
  return (
    <div className="form-group animate-fade-in">
      {description && <p style={{ color: 'var(--color-text-main)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>{description}</p>}
      <div className="radio-group">
        {options.map((opt, index) => {
          const isSelected = selectedValue === opt.value;
          return (
            <label 
              key={index} 
              className={`radio-card ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={title}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
              />
              <div className="indicator"></div>
              <span className="label-text">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
