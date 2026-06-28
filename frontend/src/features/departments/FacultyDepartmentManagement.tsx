import { useState, useEffect } from 'react';
import { Users, Filter, Plus, Edit2, Trash2, Mail } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function FacultyDepartmentManagement() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [showNewFaculty, setShowNewFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', designation: '', department: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptData, facultyData] = await Promise.all([
          apiFetch('/departments').catch(() => []),
          apiFetch('/faculty').catch(() => []),
        ]);
        setDepartments(deptData || []);
        setFaculty(facultyData || []);
        if (deptData?.length > 0) setSelectedDept(deptData[0]._id);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFaculty = selectedDept ? faculty.filter(f => f.department === selectedDept) : faculty;

  const handleAddFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.department) {
      showToast({ type: 'warning', message: 'Please fill all fields' });
      return;
    }

    try {
      await apiFetch('/faculty', {
        method: 'POST',
        body: JSON.stringify(newFaculty),
      });
      showToast({ type: 'success', message: 'Faculty added successfully' });
      setNewFaculty({ name: '', email: '', designation: '', department: '' });
      setShowNewFaculty(false);
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to add faculty' });
    }
  };

  if (loading) return <LoadingState message="Loading departments..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Users className="text-primary" /> Department & Faculty Management
        </h1>
        <p className="text-on-surface-variant">Manage departments and faculty members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Departments</h2>
          <div className="space-y-2">
            {departments.map((dept) => (
              <button
                key={dept._id}
                onClick={() => setSelectedDept(dept._id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${selectedDept === dept._id ? 'bg-primary/10 border-primary' : 'border-subtle hover:bg-surface-container-low'}`}
              >
                <p className="font-bold text-on-surface text-sm">{dept.name}</p>
                <p className="text-xs text-on-surface-variant">{dept.facultyCount || 0} faculty</p>
              </button>
            ))}
          </div>
        </div>

        {/* Faculty List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface">Faculty Members</h2>
            <button onClick={() => setShowNewFaculty(!showNewFaculty)} className="flex items-center gap-2 px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors">
              <Plus size={16} /> Add Faculty
            </button>
          </div>

          {showNewFaculty && (
            <div className="bg-white rounded-lg border border-subtle p-4 mb-4 space-y-3">
              <input type="text" placeholder="Full Name" value={newFaculty.name} onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })} className="w-full px-3 py-2 rounded border border-subtle focus:outline-none focus:border-primary text-sm" />
              <input type="email" placeholder="Email" value={newFaculty.email} onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })} className="w-full px-3 py-2 rounded border border-subtle focus:outline-none focus:border-primary text-sm" />
              <input type="text" placeholder="Designation" value={newFaculty.designation} onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })} className="w-full px-3 py-2 rounded border border-subtle focus:outline-none focus:border-primary text-sm" />
              <select value={newFaculty.department} onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })} className="w-full px-3 py-2 rounded border border-subtle focus:outline-none focus:border-primary text-sm">
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={handleAddFaculty} className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90">
                  Add Faculty
                </button>
                <button onClick={() => setShowNewFaculty(false)} className="flex-1 px-3 py-2 border border-subtle rounded text-sm font-medium hover:bg-surface-container-low">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFaculty.map((member) => (
              <div key={member._id} className="bg-white rounded-lg border border-subtle p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-on-surface">{member.name}</h3>
                  <p className="text-sm text-on-surface-variant">{member.designation}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <Mail size={12} /> {member.email}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-surface-container rounded">
                    <Edit2 size={16} className="text-primary" />
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded">
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredFaculty.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg border border-subtle">
              <Users size={32} className="mx-auto text-on-surface-variant mb-2 opacity-50" />
              <p className="text-on-surface-variant">No faculty in this department</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
