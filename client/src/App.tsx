import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Uploader from './components/Uploader';
import DataTable from './components/DataTable';
import DiffViewer from './components/DiffViewer';
import { Search, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_URL);

function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (page = pagination.page, query = debouncedSearch) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/posts?page=${page}&limit=${pagination.limit}&search=${query}`);
      const data = await response.json();
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPosts();

    socket.on('data_updated', () => {
      fetchPosts();
    });

    return () => {
      socket.off('data_updated');
    };
  }, [fetchPosts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="container">
      <header className="mb-8 flex justify-between items-center animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DataHub</h1>
          <p style={{ color: 'var(--text-muted)' }}>CSV Management & Collaborative Platform</p>
        </div>
        <Uploader 
          onUploadComplete={() => fetchPosts(1)} 
          onConflicts={(newConflicts) => setConflicts(newConflicts)}
        />
      </header>

      <div className="glass-card mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.2rem' }} />
            <input
              type="text"
              placeholder="Search posts by name, email or content..."
              className="input"
              style={{ width: '100%', paddingLeft: '3rem' }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button className="btn btn-secondary refresh-btn" onClick={() => fetchPosts()}>
            <RefreshCw className={loading ? 'animate-spin' : ''} style={{ width: '1.2rem' }} />
          </button>
        </div>

        <DataTable
          posts={posts}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {conflicts.length > 0 && (
        <DiffViewer 
          conflicts={conflicts} 
          onClose={() => setConflicts([])} 
          onResolve={() => {
            setConflicts([]);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}

export default App;
