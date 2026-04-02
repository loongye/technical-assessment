import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Uploader from './Uploader';

describe('Uploader', () => {
  it('renders upload button', () => {
    const { getByText } = render(<Uploader onUploadComplete={vi.fn()} onConflicts={vi.fn()} />);
    expect(getByText(/Upload CSV/i)).toBeInTheDocument();
  });

  it('triggers file selection and upload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    }));
    
    const { container } = render(<Uploader onUploadComplete={vi.fn()} onConflicts={vi.fn()} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['foo'], 'foo.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });
    
    vi.unstubAllGlobals();
  });

  it('handles upload errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { container } = render(<Uploader onUploadComplete={vi.fn()} onConflicts={vi.fn()} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['foo'], 'foo.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(container.querySelector('.btn')).toHaveTextContent(/Failed/i);
    });
    
    vi.unstubAllGlobals();
  });

  it('handles upload conflicts', async () => {
    const onConflicts = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ conflicts: [{ id: 1 }] })
    }));
    
    const { container } = render(<Uploader onUploadComplete={vi.fn()} onConflicts={onConflicts} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['foo'], 'foo.csv', { type: 'text/csv' });

    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(onConflicts).toHaveBeenCalledWith([{ id: 1 }]);
    });
    
    vi.unstubAllGlobals();
  });
});
