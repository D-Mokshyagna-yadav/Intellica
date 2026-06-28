import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Megaphone, Plus, Trash2, Send, Users, Building2,
  Info, CheckCircle, AlertTriangle, AlertCircle, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────────
interface StoredNotification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  audienceRoles: string[];
  audienceDepartment: string | null;
  createdAt: string;
}

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  title:             z.string().min(1, "Title is required"),
  message:           z.string().min(1, "Message is required"),
  type:              z.enum(["info", "success", "warning", "error"]),
  audienceRoles:     z.array(z.string()).min(1, "Select at least one audience"),
  audienceDepartment: z.string().optional(),
  actionUrl:         z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});
type FormData = z.infer<typeof schema>;

// ── Icon helpers ──────────────────────────────────────────────────────────────
function TypeIcon({ type }: { type: StoredNotification["type"] }) {
  const cls = "w-4 h-4 shrink-0";
  switch (type) {
    case "success": return <CheckCircle className={`${cls} text-emerald-500`} />;
    case "warning": return <AlertTriangle className={`${cls} text-amber-500`} />;
    case "error":   return <AlertCircle className={`${cls} text-red-500`} />;
    default:        return <Info className={`${cls} text-indigo-500`} />;
  }
}

function typeBadgeCls(type: StoredNotification["type"]) {
  switch (type) {
    case "success": return "bg-emerald-100 text-emerald-700";
    case "warning": return "bg-amber-100 text-amber-700";
    case "error":   return "bg-red-100 text-red-700";
    default:        return "bg-indigo-100 text-indigo-700";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AnnouncementCenter() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Fetch all sent notifications (admin view)
  const { data, isLoading } = useQuery<{ notifications: StoredNotification[]; total: number }>({
    queryKey: ["admin-notifications"],
    queryFn: () => apiFetch("/notifications/all"),
  });

  // Create mutation
  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (body: FormData) => apiFetch("/notifications", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-notifications"] });
      reset();
      setShowForm(false);
    },
  });

  // Delete mutation
  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["admin-notifications"] });
      const prev = qc.getQueryData<{ notifications: StoredNotification[]; total: number }>(["admin-notifications"]);
      qc.setQueryData(["admin-notifications"], (old: any) => ({
        ...old,
        notifications: old?.notifications.filter((n: StoredNotification) => n._id !== id) ?? [],
      }));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["admin-notifications"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "info", audienceRoles: ["FACULTY", "HOD"] },
  });

  const selectedRoles = watch("audienceRoles") ?? [];
  const toggleRole = (role: string) => {
    const next = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setValue("audienceRoles", next, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => create(data);

  const notifications = data?.notifications ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Announcement Center</h2>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} total announcements sent</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2 bg-primary hover:bg-primary/90 text-on-primary">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" />
              Compose Announcement
            </CardTitle>
            <CardDescription>Broadcast a targeted message to faculty, HODs, or the entire platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Submission Deadline Extended"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    {...register("type")}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="info">ℹ️ Info</option>
                    <option value="success">✅ Success</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="error">🚨 Error / Urgent</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                <textarea
                  {...register("message")}
                  rows={3}
                  placeholder="Write your announcement here..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Audience Roles */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Audience Roles
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["FACULTY", "HOD", "ADMIN"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedRoles.includes(role)
                            ? "bg-primary border-primary text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  {errors.audienceRoles && <p className="text-xs text-red-500">{errors.audienceRoles.message}</p>}
                </div>

                {/* Department filter */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Department (optional)
                  </label>
                  <input
                    {...register("audienceDepartment")}
                    placeholder="Leave blank for all departments"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Action URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Action URL (optional)</label>
                <input
                  {...register("actionUrl")}
                  placeholder="https://... or leave blank"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.actionUrl && <p className="text-xs text-red-500">{errors.actionUrl.message}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { reset(); setShowForm(false); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="gap-2 bg-primary hover:bg-primary/90 text-on-primary">
                  <Send className="w-4 h-4" />
                  {creating ? "Sending..." : "Send Announcement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sent notifications list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Megaphone className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">No announcements sent yet.</p>
            <p className="text-xs">Create your first announcement above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all"
            >
              <div className="mt-0.5">
                <TypeIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {n.title && <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{n.title}</h3>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeCls(n.type)}`}>
                    {n.type}
                  </span>
                  {n.audienceRoles?.map((r) => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {r}
                    </span>
                  ))}
                  {n.audienceDepartment && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium">
                      {n.audienceDepartment}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                <p className="text-xs text-slate-400">
                  {format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <button
                onClick={() => remove(n._id)}
                className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="Delete announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
