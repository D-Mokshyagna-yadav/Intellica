import { useState, useEffect } from "react";
import { useUpdateProfile, useChangePassword } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import { Loader2 } from "lucide-react";

interface ProfileUser {
  _id?: string;
  employeeId?: string;
  name?: string;
  email?: string;
  designation?: string;
  googleScholar?: string;
  scopusId?: string;
  vidwanId?: string;
  profileImage?: string;
  department?: string;
}

interface Props {
  user: ProfileUser | null;
}

function ProfileInfo({ user }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    designation: "",
    googleScholar: "",
    scopusId: "",
    vidwanId: "",
  });

  const [passwordData, setPasswordData] = useState({
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

            <input style={{ ...inputStyle, background: "#eee", cursor: "not-allowed" }} value={user.employeeId || ""} disabled />

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

      {/* ── Change Password Modal ── */}
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
const idStyle: React.CSSProperties = { fontSize: 13, color: "#888", marginBottom: 4 };
const nameStyle: React.CSSProperties = { margin: 0, fontWeight: 800, fontSize: 20 };
const designationStyle: React.CSSProperties = { margin: "6px 0", fontSize: 15, fontWeight: 500, opacity: 0.8 };
const linkStyle: React.CSSProperties = { display: "inline-block", background: "#1e1e2e", color: "white", padding: "5px 12px", borderRadius: 20, margin: "4px", textDecoration: "none", fontSize: 13 };
const editBtn: React.CSSProperties = { padding: "7px 14px", borderRadius: 8, border: "none", background: "#4f46e5", color: "white", cursor: "pointer", fontSize: 13 };
const passwordBtn: React.CSSProperties = { padding: "7px 14px", borderRadius: 8, border: "none", background: "#d97706", color: "white", cursor: "pointer", fontSize: 13 };
const overlay: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 };
const modal: React.CSSProperties = { background: "var(--color-surface-container, white)", padding: 24, borderRadius: 16, width: 340, maxWidth: "92%", boxShadow: "0 24px 48px rgba(0,0,0,0.3)" };
const modalTitle: React.CSSProperties = { margin: "0 0 16px", fontWeight: 700, fontSize: 18 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", marginTop: 10, borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box", fontSize: 14 };
const saveBtn: React.CSSProperties = { flex: 1, padding: 10, background: "#22c55e", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 };
const cancelBtn: React.CSSProperties = { flex: 1, padding: 10, background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
