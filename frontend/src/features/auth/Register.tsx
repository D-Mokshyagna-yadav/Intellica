import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useDepartments } from "../../hooks/useDepartments";
import { apiFetch } from "../../api";
import { showToast } from "../../utils/toast";
import collegeImg from "../../assets/college_logo.png";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

// Form schemas
const registerSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["FACULTY", "HOD"], { required_error: "Role is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  googleScholar: z.string().optional(),
  vidwanId: z.string().optional(),
  scopusId: z.string().optional(),
  profileImage: z.any().optional(), // File list is handled separately usually, but we keep it here
}).refine((data) => data.googleScholar || data.vidwanId || data.scopusId, {
  message: "At least one research ID is required",
  path: ["googleScholar"],
});

export default function Register() {
  const navigate = useNavigate();
  const { departments, loading: departmentsLoading } = useDepartments();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      email: "",
      role: "FACULTY",
      department: "",
      designation: "",
      googleScholar: "",
      vidwanId: "",
      scopusId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    // The profile image File object is tricky with react-hook-form uncontrolled inputs.
    // We get it from the DOM.
    const fileInput = document.getElementById("profileImage") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      showToast({ type: "error", message: "Profile photo is required" });
      return;
    }

    try {
      setLoading(true);
      const endpoint = values.role === "FACULTY" ? "/auth/faculty/register" : "/auth/hod/register";
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value as string);
      });
      formData.append("profileImage", file);

      const data = await apiFetch(endpoint, {
        method: "POST",
        body: formData,
      });

      showToast({ type: "success", message: data.message || "Registration completed" });
      navigate("/");
    } catch (error: any) {
      showToast({ type: "error", message: error.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 py-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={collegeImg}
          alt="Campus"
          className="w-full h-full object-cover object-top fixed"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] fixed" />
      </div>

      {/* Top right actions */}
      <div className="fixed top-4 right-4 z-10 flex gap-4">
        <Button variant="secondary" className="bg-white/90 hover:bg-white" onClick={() => navigate("/leaderboard")}>
          Leaderboard
        </Button>
        <Button variant="default" onClick={() => navigate("/")}>
          Login
        </Button>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-2xl z-10 bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Faculty / HOD Registration</CardTitle>
          <CardDescription className="text-slate-600">
            Create an account to access the Intellica platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Employee ID</FormLabel>
                      <FormControl>
                        <Input className="bg-white/60 border-slate-200" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Full Name</FormLabel>
                      <FormControl>
                        <Input className="bg-white/60 border-slate-200" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" className="bg-white/60 border-slate-200" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Role</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={loading}
                        >
                          <option value="FACULTY">Faculty</option>
                          <option value="HOD">HOD</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Department</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={loading || departmentsLoading}
                        >
                          <option value="">Select Dept</option>
                          {departments.map((dept: any) => (
                            <option key={dept.code} value={dept.code}>{dept.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Designation</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={loading}
                        >
                          <option value="">Select Desig</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Professor">Professor</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200/50">
                <p className="text-sm font-medium text-slate-700">Research Identifiers (At least one required)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="googleScholar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Google Scholar</FormLabel>
                        <FormControl>
                          <Input className="bg-white/60 border-slate-200" placeholder="URL or ID" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vidwanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Vidwan ID</FormLabel>
                        <FormControl>
                          <Input className="bg-white/60 border-slate-200" placeholder="ID" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scopusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Scopus ID</FormLabel>
                        <FormControl>
                          <Input className="bg-white/60 border-slate-200" placeholder="ID" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/50">
                <FormItem>
                  <FormLabel className="text-slate-700">Profile Photo</FormLabel>
                  <FormControl>
                    <Input id="profileImage" type="file" accept="image/*" className="bg-white/60 border-slate-200" disabled={loading} />
                  </FormControl>
                </FormItem>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-200/50 pt-4">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Button variant="link" className="px-1 text-primary" onClick={() => navigate("/")} disabled={loading}>
              Login here
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
