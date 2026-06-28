import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Service hooks – no raw apiFetch in UI components
import { useMe } from "../../hooks/useAuth";
import { useMyUploads, useFacultyUploads } from "../../hooks/useUploads";
import { useMyRank } from "../../hooks/useLeaderboard";

// Legacy Subcomponents
import ProfessionalDevelopment from "../../pages/faculty/ProfessionalDevelopment";
import RnD from "../../pages/faculty/RnD";
import CreditConfigViewer from "../../pages/admin/sections/credit-config/common/CreditConfigViewer";
import Conferences from "../../pages/faculty/categories/Conferences";
import Workshops from "../../pages/faculty/categories/Workshops";
import FDP from "../../pages/faculty/categories/FDP";
import Books from "../../pages/faculty/categories/Books";
import NPTEL from "../../pages/faculty/categories/NPTEL";
import Seminars from "../../pages/faculty/categories/Seminars";
import Webinars from "../../pages/faculty/categories/Webinars";
import GuestLectures from "../../pages/faculty/categories/GuestLectures";
import HonorsAwards from "../../pages/faculty/categories/HonorsAwards";
import Certifications from "../../pages/faculty/categories/Certifications";
import Others from "../../pages/faculty/categories/Others";

import Publications from "../../pages/faculty/categories/Publications";
import ResearchPolicy from "../../pages/faculty/categories/ResearchPolicy";
import DoctoralThesis from "../../pages/faculty/categories/DoctoralThesis";
import ResearchProjects from "../../pages/faculty/categories/ResearchProjects";
import ProfessionalMemberships from "../../pages/faculty/categories/ProfessionalMemberships";
import IPRs from "../../pages/faculty/categories/IPRs";
import Incubation from "../../pages/faculty/categories/Incubation";
import Consultancy from "../../pages/faculty/categories/Consultancy";

export default function FacultyDashboard({ readOnly = false, facultyId = null }: { readOnly?: boolean, facultyId?: string | null }) {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [categoryMode, setCategoryMode] = useState("upload");

  // ── Data via hooks (no raw fetch) ──────────────────────────
  const { data: me, isLoading: meLoading } = useMe();
  const { data: rankData, isLoading: rankLoading } = useMyRank();

  // When readOnly=true (HOD viewing a specific faculty), load that faculty's uploads
  const { data: facultyUploads = [], isLoading: facultyUploadsLoading } = useFacultyUploads(facultyId || "");
  const { data: myUploads = [], isLoading: myUploadsLoading } = useMyUploads();

  const uploads = facultyId ? facultyUploads : myUploads;
  const uploadsLoading = facultyId ? facultyUploadsLoading : myUploadsLoading;
  const loading = meLoading || (readOnly ? false : rankLoading) || uploadsLoading;


  const approvedUploads = useMemo(() =>
    Array.isArray(uploads) ? uploads.filter((u) => {
      const status = (u.status || "").toUpperCase();
      return status === "HOD_APPROVED" || status === "ADMIN_APPROVED";
    }) : [],
  [uploads]);

  const totalCredits = approvedUploads.reduce((sum, u) => sum + (u.credits || 0), 0);

  const byCategory = (category: string) =>
    approvedUploads
      .filter((u) => (u.category || "").toLowerCase() === category.toLowerCase())
      .reduce((sum, u) => sum + (u.credits || 0), 0);

  // Derived broad categories for the chart
  const rndCredits = byCategory("publication") + byCategory("doctoralthesis") + byCategory("researchproject") + byCategory("ipr") + byCategory("incubation") + byCategory("consultancy");
  const teachingCredits = byCategory("fdp") + byCategory("guestlecture") + byCategory("seminar") + byCategory("webinar");
  const professionalCredits = byCategory("conference") + byCategory("workshop") + byCategory("book") + byCategory("nptel") + byCategory("honorsawards") + byCategory("certification") + byCategory("professionalmembership") + byCategory("others") + byCategory("researchpolicy");


  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-primary">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="flex flex-col gap-8 w-full animate-glass-entrance">
      <section className="page-shell overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="stat-pill mb-3">
              <span className="material-symbols-outlined text-[16px] text-primary">workspace_premium</span>
              Annual review period · 2023-2024
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Academic Credit Summary</h2>
            <p className="mt-2 text-sm text-slate-600">Track your approved outputs and keep your submissions moving forward.</p>
          </div>
          <button
            onClick={() => setView("rnd")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Submission
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-7 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-200">Total accumulated points</p>
            <div className="mt-3 text-5xl font-semibold tracking-tight">{totalCredits}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              {rankData && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-blue-100">
                  <span className="material-symbols-outlined text-[16px]">leaderboard</span>
                  Rank {rankData.departmentRank}/{rankData.departmentTotal}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1.5 text-sm font-medium text-emerald-200">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Approved submissions tracked
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { title: 'R&D', value: rndCredits, icon: 'science', accent: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-600' },
              { title: 'Teaching', value: teachingCredits, icon: 'local_library', accent: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
              { title: 'Professional', value: professionalCredits, icon: 'psychology', accent: 'text-violet-600', bg: 'bg-violet-50', bar: 'bg-violet-600' },
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{item.title}</h3>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value} pts</p>
                  </div>
                  <div className={`rounded-2xl ${item.bg} p-2 ${item.accent}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                </div>
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${item.bar}`} style={{ width: `${Math.min(100, (item.value / 500) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recent uploads</h3>
            <p className="mt-1 text-sm text-slate-600">A quick view of the latest submissions and their status.</p>
          </div>
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-blue-700">
            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/80 text-sm text-slate-600">
                  <th className="px-6 py-4 font-semibold">Document name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Credits</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {uploads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No uploads found.</td>
                  </tr>
                ) : (
                  uploads.slice(0, 5).map((u: any, i: number) => (
                    <tr key={i} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <span className="material-symbols-outlined text-[18px]">description</span>
                          </div>
                          {u.name || "Document"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">{u.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.credits || 0}</td>
                      <td className="px-6 py-4">
                        {u.status === 'HOD_APPROVED' || u.status === 'ADMIN_APPROVED' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-600">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Approved
                          </span>
                        ) : u.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-sm font-medium text-rose-600">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-600">
                            <span className="material-symbols-outlined text-[14px]">pending</span>
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'pdc', label: 'Professional Development' },
          { key: 'rnd', label: 'Research & Development' },
          { key: 'credit-config', label: 'Credit Rules' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${view === tab.key ? 'bg-primary text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)]' : 'border border-slate-200/70 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {view === "dashboard" && renderDashboard()}
        
        {/* Render legacy components for tabs with glass-card wrapping if possible */}
        {view === "pdc" && (
           <div className="page-shell p-6 sm:p-8">
             <ProfessionalDevelopment onSelectCategory={setView} />
           </div>
        )}
        {view === "rnd" && (
          <div className="page-shell p-6 sm:p-8">
            <RnD onSelectCategory={setView} role="FACULTY" />
          </div>
        )}
        {view === "credit-config" && (
          <div className="page-shell p-6 sm:p-8">
            <CreditConfigViewer />
          </div>
        )}

        {/* Dynamic Category Views */}
        {view === "conferences" && <Conferences mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "workshops" && <Workshops mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "fdp" && <FDP mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "books" && <Books mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "nptel" && <NPTEL mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "seminars" && <Seminars mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "webinars" && <Webinars mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "guest-lectures" && <GuestLectures mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "honors-awards" && <HonorsAwards mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "certifications" && <Certifications mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}
        {view === "others" && <Others mode={categoryMode} facultyId={facultyId} onBack={() => setView("pdc")} />}

        {view === "rnd-publications" && <Publications mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-policy" && <ResearchPolicy mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-doctoral-thesis" && <DoctoralThesis mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-projects" && <ResearchProjects mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-memberships" && <ProfessionalMemberships mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-iprs" && <IPRs mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-incubation" && <Incubation mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
        {view === "rnd-consultancy" && <Consultancy mode={categoryMode} facultyId={facultyId} onBack={() => setView("rnd")} />}
      </div>
    </div>
  );
}
