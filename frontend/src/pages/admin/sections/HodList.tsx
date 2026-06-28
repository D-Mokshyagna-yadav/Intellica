import { useEffect, useState } from "react";
import API_BASE from "../../../api";
import { showToast } from "../../../utils/toast";
import { CheckCircle, MessageSquareWarning, Shield } from "lucide-react";

export default function HodList() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHods();
  }, []);

  const fetchHods = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/pending-hods`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setHods(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to load HODs" });
      setLoading(false);
    }
  };

  const approveHod = async (id) => {
    await fetch(`${API_BASE}/admin/approve-hod/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setHods((prev) => prev.filter((h) => h._id !== id));
    showToast({ type: "success", message: "HOD approved successfully" });
  };

  const callDiscussion = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/hod-discussion/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        setHods((prev) => prev.filter((h) => h._id !== id));
        showToast({ type: "info", message: "Called for discussion" });
      }
    } catch (err) {
      showToast({ type: "error", message: err.message || "Discussion request failed" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-on-surface-variant font-body-lg">
        Loading HOD accounts...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">HOD Accounts</h1>
        <p className="text-on-surface-variant font-body-md">
          Review and approve Head of Department registrations.
        </p>
      </div>

      {hods.length === 0 ? (
        <div className="bg-glass-card rounded-2xl p-12 border border-subtle flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">All Caught Up!</h3>
          <p className="text-on-surface-variant max-w-md">
            No HOD registrations are waiting for your approval right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hods.map((hod) => (
            <div key={hod._id} className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {hod.name?.charAt(0)?.toUpperCase() || <Shield size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-on-surface truncate" title={hod.name}>
                    {hod.name}
                  </h3>
                  <p className="text-on-surface-variant text-sm truncate" title={hod.email}>
                    {hod.email}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  HOD
                </span>
              </div>

              <div className="bg-surface-bright/20 p-3 rounded-lg border border-subtle/50 mb-6">
                <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">Department</p>
                <p className="font-medium text-on-surface">{hod.department}</p>
              </div>

              <div className="mt-auto flex gap-3 pt-4 border-t border-subtle">
                <button
                  onClick={() => approveHod(hod._id)}
                  className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => callDiscussion(hod._id)}
                  className="flex-1 bg-surface-bright/50 hover:bg-surface-bright text-on-surface font-medium rounded-xl py-2.5 transition-all border border-subtle flex items-center justify-center gap-2"
                >
                  <MessageSquareWarning size={16} />
                  <span>Discuss</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
