import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiffViewer from './DiffViewer';

const mockConflicts = [
  {
    id: 1,
    old: { id: 1, postId: 1, name: "Old Name", email: "old@test.com", body: "old body" },
    new: { id: 1, postId: 1, name: "New Name", email: "old@test.com", body: "old body" }
  }
];

describe('DiffViewer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders conflict details correctly', () => {
    render(<DiffViewer conflicts={mockConflicts} onClose={() => {}} onResolve={() => {}} />);
    expect(screen.getByText(/Conflict Management/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Old Name/i)).toHaveLength(2);
    expect(screen.getByText(/New Name/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('API Error')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onResolve = vi.fn();
    
    render(<DiffViewer conflicts={mockConflicts} onClose={() => {}} onResolve={onResolve} />);
    
    // Toggle to "Accept New" to ensure state is updated
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    const applyButton = screen.getByText(/Apply All Resolutions/i);
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(onResolve).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    consoleSpy.mockRestore();
  });

  it('toggles resolution state', () => {
    render(<DiffViewer conflicts={mockConflicts} onClose={() => {}} onResolve={() => {}} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
