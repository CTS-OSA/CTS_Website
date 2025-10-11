import React, { useEffect, useRef } from 'react';

const AutoResizeTextarea = ({ value, onChange, readOnly = false }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px'; 
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      style={{ overflow: 'hidden', resize: 'none' }}
    />
  );
};

export default AutoResizeTextarea;
