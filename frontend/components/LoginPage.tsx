"use client"
import React, { useState, useEffect } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';
import Link from 'next/link';

const carouselData = [
  {
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    title: "Discover Winning Products",
    description: "Analyze market trends and discover the next big product ideas effortlessly."
  },
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    title: "Real-time Data Insights",
    description: "Harness the power of AI to analyze social discussions and market demands."
  },
  {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    title: "Launch with Confidence",
    description: "Validate your ideas with data and launch your products ahead of the competition."
  }
];

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-full flex bg-[#F6F8FB] font-sans overflow-hidden">

      {/* Left: Form Panel */}
      <div className="w-full lg:w-[45%] flex flex-col h-full px-8 sm:px-12 lg:px-16 py-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg shadow-sm" unoptimized />
          <span className="text-lg font-bold text-[#111111] tracking-tight">IdeaForge AI</span>
        </Link>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full max-w-[420px]">

            <h1 className="text-3xl font-bold text-[#0D0D0D] mb-1 tracking-tight">Welcome Back!</h1>
            <p className="text-[#6B7280] text-sm font-medium mb-5">Sign in to your account to continue</p>

            {/* Google Button */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-14 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center gap-3 text-sm font-semibold text-[#0D0D0D] hover:bg-gray-50 shadow-sm transition-all active:scale-[0.99] mb-4"
            >
              <FcGoogle size={20} />
              Log in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#E5E7EB]"></div>
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-[#E5E7EB]"></div>
            </div>

            {/* Email / Password Form */}
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              try {
                const res = await signIn("credentials", {
                  redirect: false,
                  email,
                  password,
                });
                if (res?.error) {
                  toast.error("Invalid email or password");
                } else {
                  toast.success("Successfully logged in!");
                  router.refresh();
                  router.push("/dashboard");
                }
              } catch {
                toast.error("An error occurred during login");
              } finally {
                setIsLoading(false);
              }
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                className="w-full h-14 bg-white rounded-xl px-4 text-sm font-medium text-gray-900 border border-[#E5E7EB] outline-none focus:border-[#FB611E] focus:ring-2 focus:ring-[#FB611E]/10 transition-all placeholder:text-gray-400"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full h-14 bg-white rounded-xl pl-4 pr-12 text-sm font-medium text-gray-900 border border-[#E5E7EB] outline-none focus:border-[#FB611E] focus:ring-2 focus:ring-[#FB611E]/10 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <Eye size={16} strokeWidth={2} /> : <EyeOff size={16} strokeWidth={2} />}
                </button>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-[12px] font-semibold text-[#0D0D0D] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#FB611E] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#FB611E]/20 hover:bg-black transition-all active:scale-[0.99] disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[13px] text-[#6B7280] font-medium text-center shrink-0">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#FB611E] font-bold hover:underline">Sign Up</Link>
        </p>
      </div>

      {/* Right: Carousel Panel */}
      <div className="hidden lg:flex flex-1 bg-[#121214] rounded-l-[32px] relative overflow-hidden my-4 mr-4">
        <div className="w-full h-full flex flex-col items-center justify-center px-10 gap-6">

          {/* Carousel Image */}
          <div className="relative w-full max-w-[560px] aspect-[16/10] overflow-hidden rounded-2xl shrink-0">
            {carouselData.map((slide, index) => (
              <Image
                key={index}
                src={slide.image}
                alt={slide.title}
                fill
                sizes="560px"
                className={`absolute inset-0 object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Carousel Text */}
          <div className="w-full max-w-[520px] text-center relative h-[100px]">
            {carouselData.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center px-4 transition-all duration-700 ${
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
              >
                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{slide.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{slide.description}</p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex gap-2 shrink-0">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide ? "w-5 bg-[#FB611E]" : "w-1.5 bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
