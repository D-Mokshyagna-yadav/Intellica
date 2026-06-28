import { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Download, Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [departments, setDepartments] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // New user form state
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    role: 'FACULTY',
    department: '',
    designations: '',
    password: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, deptsData] = await Promise.all([
          apiFetch('/admin/users'),
          apiFetch('/departments'),
        ]);
        setUsers(usersData || []);
        setDepartments(deptsData || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search
  const filteredUsers = useMemo(() => {
    let result = users;

    if (filterRole !== 'all') {
      result = result.filter(u => u.role === filterRole);
    }

    if (filterDepartment !== 'all') {
      result = result.filter(u => u.department === filterDepartment);
    }

    if (filterStatus !== 'all') {
      const statusFilter = filterStatus.toUpperCase();
      result = result.filter(u => {
        const userStatus = u.approvalStatus || 'PENDING';
        return userStatus.toUpperCase() === statusFilter;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.name || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        (u.employeeId || '').toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'email-asc') return (a.email || '').localeCompare(b.email || '');
      if (sortBy === 'date-new') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    return result;
  }, [users, filterRole, filterDepartment, filterStatus, searchQuery, sortBy]);

  const handleCreateUser = async () => {
    if (!formData.employeeId || !formData.name || !formData.email || !formData.department) {
      showToast({ type: 'warning', message: 'Please fill all required fields' });
      return;
    }

    try {
      const newUser = await apiFetch('/admin/create-user', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setUsers([...users, newUser]);
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        role: 'FACULTY',
        department: '',
        designations: '',
        password: '',
      });
      setShowAddUserModal(false);
      showToast({ type: 'success', message: 'User created successfully' });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to create user' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u._id !== userId));
      showToast({ type: 'success', message: 'User deleted successfully' });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to delete user' });
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await apiFetch(`/admin/users/${userId}/approve`, { method: 'PUT' });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, approvalStatus: 'APPROVED' } : u
      ));
      showToast({ type: 'success', message: 'User approved' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to approve user' });
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await apiFetch(`/admin/users/${userId}/reject`, { method: 'PUT' });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, approvalStatus: 'REJECTED' } : u
      ));
      showToast({ type: 'success', message: 'User rejected' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to reject user' });
    }
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || 'PENDING').toUpperCase();
    if (statusUpper === 'APPROVED') {
      return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium"><CheckCircle2 size={14} /> Approved</div>;
    }
    if (statusUpper === 'REJECTED') {
      return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium"><XCircle size={14} /> Rejected</div>;
    }
    return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium"><Clock size={14} /> Pending</div>;
  };

  const getRoleBadge = (role) => {
    const colors = {
      'FACULTY': 'bg-blue-100 text-blue-800',
      'HOD': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>;
  };

  const stats = useMemo(() => ({
    total: users.length,
    faculty: users.filter(u => u.role === 'FACULTY').length,
    hod: users.filter(u => u.role === 'HOD').length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    pending: users.filter(u => !u.approvalStatus || u.approvalStatus === 'PENDING').length,
    approved: users.filter(u => u.approvalStatus === 'APPROVED').length,
  }), [users]);

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">User Management</h1>
          <p className="text-on-surface-variant">Manage faculty, HOD, and admin accounts</p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-subtle p-4 text-center">
          <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Total Users</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.faculty}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Faculty</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.hod}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">HOD</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Admin</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Approved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Roles</option>
          <option value="FACULTY">Faculty</option>
          <option value="HOD">HOD</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.code} value={dept.code}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low border-b border-subtle">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Department</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Status</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">{user.name}</div>
                      <div className="text-xs text-on-surface-variant">{user.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.department || '—'}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(user.approvalStatus)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectUser(user._id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                          className="p-2 hover:bg-blue-100 text-primary rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">Add New User</h2>

            <input
              type="text"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />

            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />

            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="FACULTY">Faculty</option>
              <option value="HOD">HOD</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.code} value={dept.code}>{dept.name}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-subtle text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
