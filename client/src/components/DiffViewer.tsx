import React from 'react';
import { X } from 'lucide-react';

interface DiffViewerProps {
  conflicts: any[];
  onClose: () => void;
  onResolve: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ conflicts, onClose, onResolve }) => {
  const [decisions, setDecisions] = React.useState<Record<number, 'new' | 'old'>>({});

  const toggleDecision = (id: number, choice: 'new' | 'old') => {
    setDecisions(prev => ({ ...prev, [id]: choice }));
  };

  const handleFinalResolve = async () => {
    for (const id of Object.keys(decisions)) {
      const conflictId = parseInt(id);
      const choice = decisions[conflictId];
      const conflict = conflicts.find(c => c.id === conflictId);
      
      try {
        await fetch('http://localhost:4000/api/resolve-conflict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: conflictId, 
            choice, 
            data: choice === 'new' ? conflict.new : undefined 
          }),
        });
      } catch (error) {
        console.error('Error resolving conflict:', error);
      }
    }
    onResolve();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Conflict Management</h2>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.5rem' }}><X /></button>
        </div>
        
        <p className="text-muted mb-6" style={{ marginBottom: '1.5rem' }}>
          Review the differences and select which version to keep for each record.
        </p>

        {conflicts.map((conflict) => (
          <div key={conflict.id} style={{ marginBottom: '2rem', border: '1px solid var(--glass-border)', borderRadius: '0.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-conflict">Record #{conflict.id}</span>
              <div className="switch-container">
                <span className={`switch-label ${decisions[conflict.id] !== 'new' ? 'active' : ''}`}>Keep Current</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={decisions[conflict.id] === 'new'} 
                    onChange={(e) => toggleDecision(conflict.id, e.target.checked ? 'new' : 'old')}
                  />
                  <span className="slider"></span>
                </label>
                <span className={`switch-label ${decisions[conflict.id] === 'new' ? 'active' : ''}`}>Accept New</span>
              </div>
            </div>

            <div className="diff-container">
              {['postId', 'name', 'email', 'body'].map(key => {
                const oldValue = conflict.old[key];
                const newValue = conflict.new[key];
                const isChanged = oldValue !== newValue;

                if (!isChanged) {
                  return (
                    <div className="diff-line" key={key}>
                      <div className="diff-line-num"></div>
                      <div className="diff-line-content">
                        <span className="diff-marker"> </span>
                        <strong>{key}:</strong> {oldValue}
                      </div>
                    </div>
                  );
                }

                return (
                  <React.Fragment key={key}>
                    <div className="diff-line diff-deletion">
                      <div className="diff-line-num">-</div>
                      <div className="diff-line-content">
                        <span className="diff-marker">-</span>
                        <strong>{key}:</strong> {oldValue}
                      </div>
                    </div>
                    <div className="diff-line diff-addition">
                      <div className="diff-line-num">+</div>
                      <div className="diff-line-content">
                        <span className="diff-marker">+</span>
                        <strong>{key}:</strong> {newValue}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: decisions[conflict.id] === 'new' ? 'var(--accent)' : 'var(--primary)' }}></span>
                FINAL RESULT PREVIEW
              </div>
              <div style={{ fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', borderLeft: `3px solid ${decisions[conflict.id] === 'new' ? 'var(--accent)' : 'var(--primary)'}` }}>
                {(() => {
                  const data = decisions[conflict.id] === 'new' ? conflict.new : conflict.old;
                  return (
                    <>
                      <div style={{ marginBottom: '0.25rem' }}><strong>Name:</strong> {data.name}</div>
                      <div style={{ marginBottom: '0.25rem' }}><strong>Email:</strong> {data.email}</div>
                      <div style={{ opacity: 0.8, fontSize: '0.8rem' }}>{data.body}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-6" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={handleFinalResolve}>
            Apply All Resolutions ({conflicts.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
