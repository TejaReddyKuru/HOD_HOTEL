import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AuditLog } from '../../types';
import { ShieldAlert, Clock, User, Building, Search } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      if (res.data?.data) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.userName && l.userName.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      l.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B79A65] font-semibold">
          Security & Traceability
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#242321]">
          System Activity & Audit Trail
        </h1>
        <p className="text-xs text-gray-500">
          Chronological immutable record of check-ins, desk payment recordings, cancellations, and staff actions.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-[#E8E2D7] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit trail by user, action type, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE8DC] rounded text-xs text-[#242321] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E8E2D7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs text-gray-500">Loading audit trail...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No audit records match the query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] border-b border-[#E8E2D7] text-[#5A4636] uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {log.userName || 'System Engine'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        log.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : log.role === 'RECEPTION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-[#B79A65]">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {log.entity}
                    </td>

                    <td className="py-3 px-4 text-gray-700 max-w-md">
                      {log.details || '—'}
                    </td>

                    <td className="py-3 px-4 text-right text-gray-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
