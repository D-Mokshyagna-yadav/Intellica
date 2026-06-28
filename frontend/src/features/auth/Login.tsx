import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  useLoginWithPassword,
  useForgotPassword,
  useResetPassword,
  useSendOtp,
  useVerifyOtp,
} from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";

// ── Schemas ──────────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z.string().min(1, "Employee ID or Email is required"),
  password: z.string().min(1, "Password is required"),
});

const otpSendSchema = z.object({
  identifier: z.string().min(1, "Employee ID or Email is required"),
});

const otpVerifySchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

const forgotSchema = z.object({
  identifier: z.string().min(1, "Employee ID or Email is required"),
});

const resetSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type OtpSendValues = z.infer<typeof otpSendSchema>;
type OtpVerifyValues = z.infer<typeof otpVerifySchema>;
type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type View = "login" | "forgot" | "reset";

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpView, setOtpView] = useState<"none" | "send" | "verify">("none");
  const [otpVerifyDigits, setOtpVerifyDigits] = useState<string[]>(Array(6).fill(""));
  const [resetOtpDigits, setResetOtpDigits] = useState<string[]>(Array(6).fill(""));

  // ── Hooks ──────────────────────────────────────────────────
  const loginMutation = useLoginWithPassword();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  // ── Forms ──────────────────────────────────────────────────
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { identifier: "" },
  });

  const otpSendForm = useForm<OtpSendValues>({
    resolver: zodResolver(otpSendSchema),
    defaultValues: { identifier: "" },
  });

  const otpVerifyForm = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "" },
  });

  // ── Handlers ───────────────────────────────────────────────
  const onLogin = async (values: LoginValues) => {
    try {
      const data = await loginMutation.mutateAsync({
        identifier: values.identifier.trim(),
        password: values.password,
      });
      try {
        showToast({ type: "success", message: "Login successful!" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
      }
      setTimeout(() => {
        if (data.role === "ADMIN") navigate("/admin");
        else if (data.role === "HOD") navigate("/hod");
        else navigate("/faculty");
      }, 400);
    } catch (err: any) {
      try {
        showToast({ type: "error", message: err.message || "Invalid credentials" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
        alert(err.message || "Invalid credentials");
      }
    }
  };

  const onSendOtp = async (values: OtpSendValues) => {
    try {
      const res = await sendOtpMutation.mutateAsync({ identifier: values.identifier.trim() });
      setResetIdentifier(values.identifier.trim());
      setOtpView("verify");
      try {
        showToast({ type: "success", message: res.message || "OTP sent to your email" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
      }
    } catch (err: any) {
      try {
        showToast({ type: "error", message: err.message || "Failed to send OTP" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
        alert(err.message || "Failed to send OTP");
      }
    }
  };

  const onVerifyOtp = async (values: OtpVerifyValues) => {
    try {
      const data = await verifyOtpMutation.mutateAsync({
        identifier: resetIdentifier,
        otp: values.otp,
      });
      try {
        showToast({ type: "success", message: "Login successful!" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
      }
      setTimeout(() => {
        if (data.role === "ADMIN") navigate("/admin");
        else if (data.role === "HOD") navigate("/hod");
        else navigate("/faculty");
      }, 400);
    } catch (err: any) {
      try {
        showToast({ type: "error", message: err.message || "Invalid OTP" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
        alert(err.message || "Invalid OTP");
      }
    }
  };

  const onForgot = async (values: ForgotValues) => {
    try {
      const res = await forgotMutation.mutateAsync(values.identifier.trim());
      setResetIdentifier(values.identifier.trim());
      setView("reset");
      try {
        showToast({ type: "success", message: res.message || "OTP sent to your email" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
      }
    } catch (err: any) {
      try {
        showToast({ type: "error", message: err.message || "Failed to send OTP" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
        alert(err.message || "Failed to send OTP");
      }
    }
  };

  const onReset = async (values: ResetValues) => {
    try {
      const res = await resetMutation.mutateAsync({
        identifier: resetIdentifier,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      try {
        showToast({ type: "success", message: res.message || "Password reset successful!" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
      }
      setView("login");
      resetForm.reset();
      setResetOtpDigits(Array(6).fill(""));
    } catch (err: any) {
      try {
        showToast({ type: "error", message: err.message || "Reset failed" });
      } catch (toastErr) {
        console.error("Toast error:", toastErr);
        alert(err.message || "Reset failed");
      }
      if (err.message?.toLowerCase().includes("expired")) {
        setView("forgot");
        resetForm.reset();
        setResetOtpDigits(Array(6).fill(""));
      }
    }
  };

  const goToForgot = () => {
    const currentId = loginForm.getValues("identifier");
    forgotForm.setValue("identifier", currentId);
    otpSendForm.setValue("identifier", currentId);
    setOtpView("none");
    setView("forgot");
  };

  const goToOtpSend = () => {
    const currentId = loginForm.getValues("identifier");
    otpSendForm.setValue("identifier", currentId);
    setResetIdentifier(currentId);
    setOtpView("send");
  };

  const goToLogin = () => {
    setView("login");
    setOtpView("none");
    resetForm.reset();
    otpSendForm.reset();
    otpVerifyForm.reset();
    setOtpVerifyDigits(Array(6).fill(""));
    setResetOtpDigits(Array(6).fill(""));
  };

  useEffect(() => {
    otpVerifyForm.setValue("otp", otpVerifyDigits.join(""), { shouldValidate: true });
  }, [otpVerifyDigits, otpVerifyForm]);

  useEffect(() => {
    resetForm.setValue("otp", resetOtpDigits.join(""), { shouldValidate: true });
  }, [resetOtpDigits, resetForm]);

  const focusOtpInput = (id: string) => {
    const element = document.getElementById(id) as HTMLInputElement | null;
    element?.focus();
  };

  const handleOtpChange = (
    value: string,
    index: number,
    digits: string[],
    setDigits: Dispatch<SetStateAction<string[]>>, 
    idPrefix: string
  ) => {
    const nextValue = value.replace(/\D/g, "").slice(0, 1);
    if (!nextValue) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);

    if (index < digits.length - 1) {
      focusOtpInput(`${idPrefix}-${index + 1}`);
    }
  };

  const handleOtpKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    digits: string[],
    setDigits: Dispatch<SetStateAction<string[]>>, 
    idPrefix: string
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const nextDigits = [...digits];
      if (nextDigits[index]) {
        nextDigits[index] = "";
        setDigits(nextDigits);
        return;
      }
      if (index > 0) {
        focusOtpInput(`${idPrefix}-${index - 1}`);
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusOtpInput(`${idPrefix}-${index - 1}`);
    }

    if (event.key === "ArrowRight" && index < digits.length - 1) {
      event.preventDefault();
      focusOtpInput(`${idPrefix}-${index + 1}`);
    }
  };

  const handleOtpPaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    setDigits: Dispatch<SetStateAction<string[]>>, 
    idPrefix: string
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = Array(6).fill("");
    pasted.split("").forEach((char, index) => {
      if (index < 6) nextDigits[index] = char;
    });
    setDigits(nextDigits);
    if (pasted.length < 6) {
      focusOtpInput(`${idPrefix}-${pasted.length}`);
    }
  };

  const renderOtpInputs = (
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>, 
    idPrefix: string
  ) => (
    <div className="otp-digits-grid">
      {digits.map((digit, index) => (
        <input
          key={`${idPrefix}-${index}`}
          id={`${idPrefix}-${index}`}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          type="text"
          value={digit}
          onChange={(event) => handleOtpChange(event.target.value, index, digits, setDigits, idPrefix)}
          onKeyDown={(event) => handleOtpKeyDown(event, index, digits, setDigits, idPrefix)}
          onPaste={(event) => handleOtpPaste(event, setDigits, idPrefix)}
          className="otp-digit-box"
          aria-label={`OTP digit ${index + 1}`}
          disabled={isLoading}
        />
      ))}
    </div>
  );

  const isLoading =
    loginMutation.isPending ||
    sendOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    forgotMutation.isPending ||
    resetMutation.isPending;

  // ── UI ─────────────────────────────────────────────────────
  return (
    <div className="bg-transparent text-slate-900 h-screen w-full flex overflow-hidden antialiased">
      {/* Left Side */}
      <div className="hidden lg:flex w-[60%] h-full relative flex-col items-center justify-between overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.96)_0%,_rgba(241,245,255,1)_100%)] p-edge-margin-lg">
        <div className="w-full flex justify-start pt-4">
          <span className="font-headline-md text-headline-md tracking-tight flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hexagon
            </span>
            <span className="text-xl font-semibold text-slate-900">Intellica</span>
          </span>
        </div>

        <div className="relative w-full max-w-2xl flex-grow flex items-center justify-center pointer-events-none px-4">
          <img
            alt="Abstract 3D glass sculpture"
            className="w-full h-auto object-contain max-h-[65vh] drop-shadow-2xl opacity-95 mix-blend-screen"
            src="https://lh3.googleusercontent.com/aida/AP1WRLt-9W75FsPpTt7hVNZFKbQsMEEOO5EMbrZZl7rBJS6l7DQ0n8zdczBjkq8WUlTkP_DrHMnT3f2aVUVNKnPRPOX2Q4VEPGyfvVQ0417Sdm86bUhoRuK-JvDocJsPf109qNXt77l74MkJxSnE2Huf3qpJz0A4jIDGdnphG89jY7MUaDC4tAX2PZOagT-HL4P4Tc2RU_UTrktA-WvGQCW-Lre_EEX9ANpSXKWo2HuJqCKJzu5HDVcOLSPBNw"
          />
        </div>

        <div className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white/70 px-8 py-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl z-10 pb-12">
          <p className="text-lg font-medium leading-relaxed text-slate-700">
            “Intelligence is the ability to adapt to change.”
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            — Stephen Hawking
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[40%] h-full flex flex-col items-center justify-center p-edge-margin-sm lg:p-edge-margin-md bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(248,250,255,0.9)_100%)] backdrop-blur-xl relative z-10 shadow-[-20px_0_70px_rgba(15,23,42,0.12)] overflow-y-auto">
        <div className="lg:hidden w-full flex justify-center mb-6 pt-6">
          <span className="font-headline-md text-headline-md tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hexagon
            </span>
            <span className="text-lg font-semibold text-on-surface">Intellica</span>
          </span>
        </div>

        <div className="w-full max-w-[470px] rounded-[32px] border border-slate-200/70 bg-white/80 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl flex flex-col gap-8 my-auto animate-glass-entrance lg:p-12">
          {/* Header */}
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {view === "login"
                ? otpView === "send"
                  ? "OTP sign in"
                  : otpView === "verify"
                  ? "Verify OTP"
                  : "Welcome back"
                : view === "forgot"
                ? "Forgot Password"
                : "Reset Password"}
            </h1>
            <p className="max-w-[30rem] text-sm leading-relaxed text-slate-600 sm:text-base">
              {view === "login"
                ? otpView === "send"
                  ? "Enter your employee ID or email to receive a login OTP. You can also return to password sign in at any time."
                  : otpView === "verify"
                  ? "Enter the 6-digit OTP sent to your email to complete sign in."
                  : "Sign in to your account to continue."
                : view === "forgot"
                ? "Enter your email to receive a reset OTP and secure your account."
                : "Use the OTP sent to your email and choose a new password."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Login ── */}
            {view === "login" && otpView === "none" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="flex flex-col gap-5 w-full"
              >
                {/* Identifier */}
                <div className="flex flex-col gap-2">
                  <label className="ml-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700" htmlFor="login-identifier">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0 text-primary">mail</span>
                    Employee ID or Email
                  </label>
                  <input
                    id="login-identifier"
                    type="text"
                    placeholder="you@college.edu or EMP123"
                    disabled={isLoading}
                    {...loginForm.register("identifier")}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-4 pr-4 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {loginForm.formState.errors.identifier && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{loginForm.formState.errors.identifier.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={goToForgot} className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-primary transition-colors hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="ml-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700" htmlFor="login-password">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0 text-primary">lock</span>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...loginForm.register("password")}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-4 pr-12 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-0.5 text-slate-500 transition-colors hover:text-slate-700">
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="w-full btn-primary-custom rounded-2xl py-3.5 mt-2 font-label-md text-label-md text-white font-semibold flex justify-center items-center gap-2 transition-all hover:shadow-lg disabled:opacity-75">
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  Sign In
                  {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                </button>

                <div className="flex flex-col gap-3">
                  <button type="button" onClick={goToOtpSend} disabled={isLoading} className="h-14 w-full rounded-2xl border border-primary/20 bg-blue-50/70 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-blue-100/80">
                    Sign in with OTP
                  </button>
                </div>

                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-border-subtle/50 flex-grow" />
                  <span className="font-label-sm text-label-sm text-outline/60 uppercase tracking-wider">or</span>
                  <div className="h-px bg-border-subtle/50 flex-grow" />
                </div>

                <p className="text-center text-sm text-slate-600">
                  Don't have an account?{" "}
                  <button onClick={() => navigate("/register")} className="cursor-pointer border-none bg-transparent font-semibold text-primary transition-colors hover:text-blue-700">
                    Sign up
                  </button>
                </p>
              </motion.form>
            )}

            {/* ── OTP Send ── */}
            {view === "login" && otpView === "send" && (
              <motion.form
                key="otp-send"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={otpSendForm.handleSubmit(onSendOtp)}
                className="flex flex-col gap-6 w-full"
              >
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant font-medium ml-0.5 flex items-center gap-1.5" htmlFor="otp-send-identifier">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">mail</span>
                    Employee ID or Email
                  </label>
                  <input
                    id="otp-send-identifier"
                    type="text"
                    placeholder="you@college.edu or EMP123"
                    disabled={isLoading}
                    {...otpSendForm.register("identifier")}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-4 pr-4 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {otpSendForm.formState.errors.identifier && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{otpSendForm.formState.errors.identifier.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={isLoading} className="w-full btn-primary-custom rounded-2xl py-3.5 font-label-md text-label-md text-white font-semibold flex justify-center items-center gap-2 transition-all hover:shadow-lg disabled:opacity-75">
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Send OTP
                  </button>
                  <button type="button" onClick={goToLogin} disabled={isLoading} className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface rounded-2xl py-3.5 font-label-md text-label-md flex justify-center items-center transition-colors font-semibold">
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── OTP Verify ── */}
            {view === "login" && otpView === "verify" && (
              <motion.form
                key="otp-verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={otpVerifyForm.handleSubmit(onVerifyOtp)}
                className="flex flex-col gap-6 w-full"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md text-on-surface-variant font-medium" htmlFor="otp-verify-0">
                      6-Digit OTP
                    </label>
                    <span className="font-label-sm text-label-sm text-outline/70 text-right">Sent to {resetIdentifier || "your email"}</span>
                  </div>
                  <div className="otp-input-panel">
                    <span className="material-symbols-outlined text-outline text-[20px] flex-shrink-0">pin</span>
                    <div className="flex-1">
                      {renderOtpInputs(otpVerifyDigits, setOtpVerifyDigits, "otp-verify")}
                    </div>
                  </div>
                  {otpVerifyForm.formState.errors.otp && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{otpVerifyForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-75">
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Verify OTP
                  </button>
                  <button type="button" onClick={goToOtpSend} disabled={isLoading} className="w-full rounded-2xl border border-primary/20 bg-blue-50/70 py-3.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-blue-100/80">
                    Resend OTP
                  </button>
                  <button type="button" onClick={goToLogin} disabled={isLoading} className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Forgot ── */}
            {view === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={forgotForm.handleSubmit(onForgot)}
                className="flex flex-col gap-6 w-full"
              >
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant font-medium ml-0.5 flex items-center gap-1.5" htmlFor="forgot-identifier">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">mail</span>
                    Employee ID or Email
                  </label>
                  <input
                    id="forgot-identifier"
                    type="text"
                    placeholder="you@college.edu or EMP123"
                    disabled={isLoading}
                    {...forgotForm.register("identifier")}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-4 pr-4 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {forgotForm.formState.errors.identifier && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{forgotForm.formState.errors.identifier.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-75">
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Send Reset OTP
                  </button>
                  <button type="button" onClick={() => setView("login")} disabled={isLoading} className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Reset ── */}
            {view === "reset" && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={resetForm.handleSubmit(onReset)}
                className="flex flex-col gap-6 w-full"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md text-on-surface-variant font-medium" htmlFor="reset-0">
                      6-Digit OTP
                    </label>
                    <button type="button" onClick={() => setView("forgot")} className="font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer">
                      Change Email?
                    </button>
                  </div>
                  <div className="otp-input-panel">
                    <span className="material-symbols-outlined text-outline text-[20px] flex-shrink-0">pin</span>
                    <div className="flex-1">
                      {renderOtpInputs(resetOtpDigits, setResetOtpDigits, "reset")}
                    </div>
                  </div>
                  {resetForm.formState.errors.otp && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{resetForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant font-medium ml-0.5 flex items-center gap-1.5" htmlFor="reset-password">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0">lock</span>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...resetForm.register("newPassword")}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-4 pr-12 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center justify-center bg-transparent border-none p-0.5 cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-error text-xs mt-1.5 ml-0.5 font-medium">{resetForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-75">
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  Reset Password
                  {!isLoading && <span className="material-symbols-outlined text-[20px]">check_circle</span>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
