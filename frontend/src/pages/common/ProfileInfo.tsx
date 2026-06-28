import { useState, useEffect } from "react";
import { useUpdateProfile, useChangePassword } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import { Loader2 } from "lucide-react";

interface ProfileUser {
  _id?: string;
    <div style={container}>
      <div style={heroCard}>
        <p style={idStyle}>ID: {user.employeeId}</p>
        <h3 style={nameStyle}>{user.name}</h3>
        <p style={designationStyle}>{user.designation}</p>
  googleScholar?: string;
        {links.length > 0 && (
          <div style={linkRow}>
            {links.map(({ label, url }) => (
              <a
                key={label}
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                {label}
              </a>
            ))}
          </div>
        )}
  const [editData, setEditData] = useState({
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
          <button style={editBtn} onClick={() => setShowEdit(true)}>
            Edit Profile
          </button>
          <button style={passwordBtn} onClick={() => setShowChangePassword(true)}>
            Change Password
          </button>
        </div>
      </div>

    currentPassword: "",
    newPassword: "",
  });

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        designation: user.designation || "",
        googleScholar: user.googleScholar || "",
        scopusId: user.scopusId || "",
        vidwanId: user.vidwanId || "",
      });
    }
  }, [user]);

  if (!user) return null;

  const links: { label: string; url: string }[] = [];
  if (user.googleScholar?.trim()) links.push({ label: "Google Scholar", url: user.googleScholar.trim() });
  if (user.scopusId?.trim()) links.push({ label: "Scopus", url: user.scopusId.trim() });
  if (user.vidwanId?.trim()) links.push({ label: "Vidwan", url: user.vidwanId.trim() });

  const handleUpdate = async () => {
    try {
      await updateProfile.mutateAsync(editData);
      setShowEdit(false);
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "Update failed" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      showToast({ type: "error", message: "New password must be at least 6 characters" });
      return;
    }
    try {
      await changePassword.mutateAsync(passwordData);
      setShowChangePassword(false);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "Password update failed" });
    }
  };

  return (
    <div style={container}>
      <p style={idStyle}>ID: {user.employeeId}</p>
      <h3 style={nameStyle}>{user.name}</h3>
      <p style={designationStyle}>{user.designation}</p>

      {links.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {links.map(({ label, url }) => (
            <a
              key={label}
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {label}
            </a>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        <button style={editBtn} onClick={() => setShowEdit(true)}>
          Edit Profile
        </button>
        <button style={passwordBtn} onClick={() => setShowChangePassword(true)}>
          Change Password
        </button>
      </div>

      {/* ── Edit Profile Modal ── */}
      {showEdit && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={modalTitle}>Edit Profile</h3>

            {["name", "email", "designation", "googleScholar", "scopusId", "vidwanId"].map((field) => (
              <input
                key={field}
                style={inputStyle}
                value={(editData as any)[field]}
                onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                placeholder={
                  field === "googleScholar" ? "Google Scholar URL" :
                  field === "scopusId" ? "Scopus Profile URL" :
                  field === "vidwanId" ? "Vidwan Profile URL" :
                  field.charAt(0).toUpperCase() + field.slice(1)
                }
              />
            ))}

            <input style={{ ...inputStyle, background: "#f8fafc", cursor: "not-allowed" }} value={user.employeeId || ""} disabled />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={saveBtn} onClick={handleUpdate} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                Save
              </button>
              <button style={cancelBtn} onClick={() => setShowEdit(false)} disabled={updateProfile.isPending}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={modalTitle}>Change Password</h3>

            <input
              style={inputStyle}
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Current Password"
            />

            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 40 }}
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="New Password (min 6 chars)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {showNewPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={saveBtn} onClick={handleChangePassword} disabled={changePassword.isPending}>
                {changePassword.isPending ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                Save
              </button>
              <button style={cancelBtn} onClick={() => setShowChangePassword(false)} disabled={changePassword.isPending}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileInfo;

/* ── Styles ── */
const container: React.CSSProperties = { marginTop: 18, textAlign: "center" };
const heroCard: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 24, padding: 24, boxShadow: "0 8px 24px rgba(15,23,42,0.04)" };
const idStyle: React.CSSProperties = { fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" };
const nameStyle: React.CSSProperties = { margin: 0, fontWeight: 800, fontSize: 24, color: "#0f172a" };
const designationStyle: React.CSSProperties = { margin: "6px 0 0", fontSize: 15, fontWeight: 500, color: "#475569" };
const linkRow: React.CSSProperties = { marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" };
const linkStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", background: "#eff6ff", color: "#1d4ed8", padding: "7px 12px", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 700, border: "1px solid #bfdbfe" };
const editBtn: React.CSSProperties = { padding: "9px 16px", borderRadius: 999, border: "1px solid #bfdbfe", background: "#2563eb", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 };
const passwordBtn: React.CSSProperties = { padding: "9px 16px", borderRadius: 999, border: "1px solid #fed7aa", background: "#fff7ed", color: "#c2410c", cursor: "pointer", fontSize: 13, fontWeight: 700 };
const overlay: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999, padding: 16, backdropFilter: "blur(4px)" };
const modal: React.CSSProperties = { background: "#fff", padding: 24, borderRadius: 24, width: 420, maxWidth: "92%", boxShadow: "0 32px 80px rgba(15,23,42,0.22)", border: "1px solid #e2e8f0" };
const modalTitle: React.CSSProperties = { margin: "0 0 16px", fontWeight: 700, fontSize: 18, color: "#0f172a" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", marginTop: 10, borderRadius: 12, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 14, background: "#fff" };
const saveBtn: React.CSSProperties = { flex: 1, padding: 10, background: "#2563eb", color: "white", border: "none", borderRadius: 999, cursor: "pointer", fontWeight: 700 };
const cancelBtn: React.CSSProperties = { flex: 1, padding: 10, background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 999, cursor: "pointer", fontWeight: 700 };
