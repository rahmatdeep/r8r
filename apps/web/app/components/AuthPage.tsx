"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { SignupSchema, SigninSchema } from "@repo/types/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [error, setError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError("");
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Client-side validation
    if (!isSignin) {
      const validation = SignupSchema.safeParse({ email, password, name });
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setValidationErrors(errors);
        setIsPending(false);
        return;
      }
    } else {
      const validation = SigninSchema.safeParse({ email, password });
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setValidationErrors(errors);
        setIsPending(false);
        return;
      }
    }

    if (!isSignin) {
      // Handle signup
      try {
        const signupData = {
          email,
          password,
          name: name || email.split("@")[0],
        };

        await axios.post(`${BACKEND_URL}/api/v1/user/signup`, signupData);

        // After successful signup, sign in
        await signInUser(email, password);
      } catch (error: unknown) {
        setIsPending(false);
        if (error instanceof Error) {
          setError(error.message);
        } else if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          setError(axiosError.response?.data?.message || "Signup failed");
        } else {
          setError("Signup failed");
        }
      }
    } else {
      // Handle signin
      await signInUser(email, password);
    }
  };

  const signInUser = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      router.push("/dashboard");
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
    if (error) {
      setError("");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#262624]">
      <form onSubmit={handleSubmit}>
        <div className="p-8 bg-[#30302e] rounded-2xl shadow-2xl w-96 border border-[#4a4945]">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#faf9f5]">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h2>

          <div className="space-y-4">
            {!isSignin && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  className={`w-full px-4 py-3 border rounded-lg bg-[#3a3938] text-[#faf9f5] placeholder:text-[#a6a29e] focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-[#4a4945] focus:ring-[#c6613f] focus:border-[#c6613f]"
                  }`}
                  onChange={() => clearFieldError("name")}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-400 mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                className={`w-full px-4 py-3 border rounded-lg bg-[#3a3938] text-[#faf9f5] placeholder:text-[#a6a29e] focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-[#4a4945] focus:ring-[#c6613f] focus:border-[#c6613f]"
                }`}
                onChange={() => clearFieldError("email")}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-400 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password field with eye toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                className={`w-full px-4 py-3 pr-12 border rounded-lg bg-[#3a3938] text-[#faf9f5] placeholder:text-[#a6a29e] focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-[#4a4945] focus:ring-[#c6613f] focus:border-[#c6613f]"
                }`}
                onChange={() => clearFieldError("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a6a29e] hover:text-[#faf9f5] transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {validationErrors.password && (
                <p className="text-sm text-red-400 mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#c6613f] hover:bg-[#b5572e] disabled:bg-[#c6613f]/50 text-[#faf9f5] font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c6613f] focus:ring-offset-2 focus:ring-offset-[#30302e]"
              >
                {isPending
                  ? isSignin
                    ? "Signing in..."
                    : "Creating account..."
                  : isSignin
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-[#a6a29e]">
              {isSignin ? (
                <p>
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="text-[#c6613f] hover:text-[#b5572e] font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-[#c6613f] hover:text-[#b5572e] font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
