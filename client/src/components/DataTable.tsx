import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  posts: any[];
  pagination: any;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ posts, pagination, onPageChange, loading }) => {
  if (loading && posts.length === 0) {
    return <div className="text-center py-10 color-muted">Loading data...</div>;
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Post ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Body Snippet</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td style={{ fontWeight: 600 }}>{post.id}</td>
                <td>{post.postId}</td>
                <td>{post.name}</td>
                <td style={{ color: 'var(--primary)' }}>{post.email}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.body}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
        </p>
        <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="btn btn-secondary"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
