import React, { useState } from 'react';

interface ExportButtonProps {
  format: 'pptx' | 'pdf';
  presentationId?: string;
  disabled?: boolean;
}

export default function ExportButton({ format, presentationId, disabled }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const label = format === 'pptx' ? '📥 Export PPTX' : '📄 Export PDF';

  const handleExport = async () => {
    if (!presentationId) return;
    setLoading(true);
    try {
      // TODO: Wire to API — POST /api/presentations/{id}/export?format={format}
      alert(`Export ${format.toUpperCase()} — API not connected yet`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || loading || !presentationId}
      style={{
        padding: '0.5rem 1rem',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        background: loading ? '#f3f4f6' : 'white',
        fontSize: '0.9rem',
      }}
    >
      {loading ? 'Generating...' : label}
    </button>
  );
}
