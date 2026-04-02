import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface UploaderProps {
  onUploadComplete: () => void;
  onConflicts: (conflicts: any[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onUploadComplete, onConflicts }) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
      e.target.value = ''; // Reset to allow re-selecting the same file
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setStatus('uploading');
    setProgress(50); // Set a base progress since fetch doesn't support upload progress

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        if (result.conflicts && result.conflicts.length > 0) {
          setStatus('idle');
          setProgress(null);
          onConflicts(result.conflicts);
        } else {
          setStatus('success');
          onUploadComplete();
          setTimeout(() => {
            setStatus('idle');
            setProgress(null);
          }, 3000);
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-end">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        className={`btn ${status === 'uploading' || status === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {status === 'idle' && <><Upload size={18} /> Upload CSV</>}
        {(status === 'uploading' || status === 'processing') && <><RefreshCw className="animate-spin" size={18} /> {status === 'uploading' ? `Uploading ${progress}%` : 'Processing...'}</>}
        {status === 'success' && <><CheckCircle size={18} /> Done!</>}
        {status === 'error' && <><AlertCircle size={18} /> Failed</>}
      </button>

      {progress !== null && status !== 'idle' && (
        <div className="progress-bar" style={{ width: '200px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};


export default Uploader;
