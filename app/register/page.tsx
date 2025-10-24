"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamId: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap harus diisi";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }

    // Password validation - minimum 8 chars, uppercase, lowercase, number
    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password harus mengandung huruf besar";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password harus mengandung huruf kecil";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password harus mengandung angka";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, "");

      setSuccessMessage(
        `Pendaftaran berhasil! Silakan login dengan email ${formData.email}`
      );
      setStep("success");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Register error:", error);
      setErrors((prev) => ({
        ...prev,
        form: error instanceof Error ? error.message : "Pendaftaran gagal",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white mb-4">
            <span className="text-xl font-bold">J</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Jiwaku</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-Powered Omnichannel CRM
          </p>
        </div>

        {/* Registration Card - Form */}
        {step === "form" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
              <CardDescription>
                Daftar untuk mengakses Jiwaku CRM
              </CardDescription>
            </CardHeader>

            <CardContent>
              {errors.form && (
                <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <Input
                  label="Nama Lengkap"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  disabled={isLoading}
                />

                {/* Email */}
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="your@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={isLoading}
                />

                {/* Password */}
                <div>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-2 ml-1">
                    Password harus mengandung: Huruf besar, huruf kecil, dan angka
                  </p>
                </div>

                {/* Confirm Password */}
                <Input
                  label="Konfirmasi Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                />

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border border-input cursor-pointer mt-1"
                    disabled={isLoading}
                  />
                  <label htmlFor="agreeToTerms" className="text-xs text-muted-foreground cursor-pointer flex-1">
                    Saya setuju dengan{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      syarat dan ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      kebijakan privasi
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-xs text-destructive">{errors.agreeToTerms}</p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Mendaftar..." : "Buat Akun"}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Masuk
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Success Card */
          <Card>
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Pendaftaran Berhasil!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {successMessage}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Anda akan diarahkan ke halaman login dalam beberapa detik...
                </p>

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Masuk ke Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
