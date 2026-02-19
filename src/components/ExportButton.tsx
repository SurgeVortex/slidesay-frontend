import { useState } from 'react';
import { exportPresentation } from '../utils/api';

interface ExportButtonProps {
  format: 'pptx' | 'pdf';
  presentationId?: string;
  disabled?: boolean;
}

export default function ExportButton({ format, presentationId, disabled }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = format === 'pptx' ? '📥 Export PPTX' : '📄 Export PDF';

  const handleExport = async () => {
    if (!presentationId) return;
    setLoading(true);
    setError(null);

    try {
      const blob = await exportPresentation(presentationId, format);
      if (!blob) {
        setError('Export failed');
        return;
      }

      // Trigger file download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
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
      {error && <p style={{ color: 'red', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{error}</p>}
    </div>
  );
}
