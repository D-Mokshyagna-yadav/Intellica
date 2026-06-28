import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "../../utils/toast";

const steps = [
  { id: 1, title: "Personal" },
  { id: 2, title: "Professional" },
  { id: 3, title: "Academic" },
  { id: 4, title: "Documents" },
  { id: 5, title: "Review" },
];

const wizardSchema = z.object({
  // Step 1: Personal
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  
  // Step 2: Professional
  researchInterests: z.string().optional(),
  
  // Step 3: Academic
  qualifications: z.string().optional(),
  
  // Step 4: Documents (file uploads handled separately in real app)
  resumeLink: z.string().optional(),
});

type WizardData = z.infer<typeof wizardSchema>;

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [offset, setOffset] = useState(251.2);

  const form = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      department: "",
      researchInterests: "",
      qualifications: "",
      resumeLink: "",
    },
  });

  const progressPercent = ((currentStep) / steps.length) * 100;

  useEffect(() => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const currentOffset = circumference - (progressPercent / 100) * circumference;
    setOffset(currentOffset);
  }, [progressPercent]);

  const nextStep = async () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: WizardData) => {
    if (currentStep !== 5) return;
    
    try {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1000));
      
      localStorage.setItem("profileCompleted", "true");
      showToast({ type: "success", message: "Profile setup complete!" });
      
      const role = localStorage.getItem("user_role");
      if (role === "ADMIN") navigate("/admin");
      else if (role === "HOD") navigate("/hod");
      else navigate("/faculty");
      
    } catch (error: any) {
      showToast({ type: "error", message: "Failed to save profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden text-on-surface bg-transparent">
      {/* Background is handled by index.css body background */}
      
      {/* Onboarding Modal Container */}
      <main className="relative z-10 w-full h-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-[2rem] overflow-hidden flex flex-col glass-card p-8 animate-glass-entrance shadow-2xl">
        {/* Header: Progress & Stepper */}
        <header className="pb-6 flex flex-col items-center gap-6">
          {/* Progress Ring */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" fill="transparent" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
              <circle 
                className="progress-ring-circle" 
                cx="40" cy="40" 
                fill="transparent" 
                r="36" 
                stroke="#58a6ff" 
                strokeLinecap="round" 
                strokeWidth="4"
                style={{ strokeDashoffset: offset, strokeDasharray: 251.2 }}
              ></circle>
            </svg>
            <span className="absolute font-headline-md text-headline-md text-primary">{Math.round(progressPercent)}%</span>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between w-full px-2">
            {steps.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1 mx-1">
                  <div className={`h-1 w-full rounded-full transition-colors duration-300 ${isPast || isCurrent ? 'bg-primary-container' : 'bg-surface-container-highest'}`}></div>
                  <span className={`font-label-sm text-label-sm uppercase transition-colors duration-300 ${isPast || isCurrent ? 'text-primary' : 'text-on-surface-variant opacity-40'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                  {currentStep === 1 ? "Complete Your Profile" 
                  : currentStep === 2 ? "Professional Details"
                  : currentStep === 3 ? "Academic Background"
                  : currentStep === 4 ? "Upload Documents"
                  : "Review Profile"}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Step {currentStep} of {steps.length}: {steps.find(s => s.id === currentStep)?.title} Information
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Full Name</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">person</span>
                        <input {...form.register("fullName")} className="w-full h-12 pl-10 pr-4 rounded-xl input-recessed font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/30" placeholder="Dr. Julian Sterling" type="text" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Email Address</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">mail</span>
                        <input {...form.register("email")} className="w-full h-12 pl-10 pr-4 rounded-xl input-recessed font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/30" placeholder="j.sterling@faculty.edu" type="email" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Contact Number</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">call</span>
                        <input {...form.register("phone")} className="w-full h-12 pl-10 pr-4 rounded-xl input-recessed font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/30" placeholder="+1 (555) 000-0000" type="tel" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Department Selection</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">account_tree</span>
                        <select {...form.register("department")} className="w-full h-12 pl-10 pr-4 rounded-xl input-recessed font-body-md text-body-md text-on-surface appearance-none focus:ring-0 bg-surface/50 [&>option]:bg-surface [&>option]:text-on-surface">
                          <option disabled value="">Select Department</option>
                          <option value="cs">Computer Science & Engineering</option>
                          <option value="bio">Biomedical Research</option>
                          <option value="phys">Theoretical Physics</option>
                          <option value="lit">Modern Literature</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/5 flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <p className="font-label-md text-label-md text-primary/70 leading-relaxed">
                          This information will be used to generate your official Faculty ID and directory listing. Ensure your email is correct for verified communication.
                      </p>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Research Interests</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-4 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">science</span>
                        <textarea {...form.register("researchInterests")} className="w-full h-32 pl-10 pr-4 py-3 rounded-xl input-recessed font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/30 resize-none" placeholder="Machine Learning, AI, Robotics (comma separated)"></textarea>
                      </div>
                    </div>
                    <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/5 flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <p className="font-label-md text-label-md text-primary/70 leading-relaxed">
                          Your basic professional details have already been set up by your HOD. You can update your research identifiers later.
                      </p>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Highest Qualifications</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">school</span>
                        <input {...form.register("qualifications")} className="w-full h-12 pl-10 pr-4 rounded-xl input-recessed font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/30" placeholder="e.g. Ph.D in Computer Science" type="text" />
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant px-1">Resume/CV Link (Optional)</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-primary transition-colors">link</span>
                        <input {...form.register("resumeLink")} className="w-full h-12 pl-10 pr-4 rounded-xl input-recessed font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/30" placeholder="https://..." type="url" />
                      </div>
                    </div>
                    
                    <div className="mt-4 border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-surface rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface">Click to upload documents</p>
                      <p className="text-xs mt-1 text-on-surface-variant/70">PDF, DOCX up to 10MB</p>
                    </div>
                  </>
                )}

                {currentStep === 5 && (
                  <>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
                      <h3 className="font-headline-md text-headline-md text-on-surface border-b border-white/10 pb-2">Profile Summary</h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                          <p className="text-on-surface-variant mb-1 font-label-md">Name</p>
                          <p className="font-body-lg text-on-surface">{form.getValues("fullName") || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant mb-1 font-label-md">Phone</p>
                          <p className="font-body-lg text-on-surface">{form.getValues("phone") || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant mb-1 font-label-md">Department</p>
                          <p className="font-body-lg text-on-surface">{form.getValues("department") || "Not provided"}</p>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-white/10">
                          <p className="text-on-surface-variant mb-1 font-label-md">Research Interests</p>
                          <p className="font-body-lg text-on-surface">{form.getValues("researchInterests") || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/10 flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p className="font-label-md text-label-md text-primary/90 leading-relaxed">
                        Everything looks good. You can always edit this information later from your profile settings.
                      </p>
                    </div>
                  </>
                )}

              </form>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Footer Actions */}
        <footer className="pt-6 space-y-3 mt-auto">
          {currentStep < steps.length ? (
            <button 
              type="button"
              onClick={nextStep}
              className="w-full h-14 shimmer-btn text-on-primary-container font-body-lg text-body-lg rounded-2xl shadow-[0_0_24px_rgba(88,166,255,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Continue
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full h-14 shimmer-btn text-on-primary-container font-body-lg text-body-lg rounded-2xl shadow-[0_0_24px_rgba(88,166,255,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  Complete Setup
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </>
              )}
            </button>
          )}

          {currentStep > 1 ? (
             <button 
              type="button"
              onClick={prevStep}
              className="w-full h-12 bg-transparent hover:bg-white/5 text-on-surface-variant/70 font-body-lg text-body-lg rounded-2xl transition-all active:scale-[0.98]"
            >
              Go Back
            </button>
          ) : (
            <button 
              type="button"
              className="w-full h-12 bg-transparent hover:bg-white/5 text-on-surface-variant/70 font-body-lg text-body-lg rounded-2xl transition-all active:scale-[0.98]"
            >
              Save & Resume Later
            </button>
          )}
        </footer>
      </main>
    </div>
  );
}
