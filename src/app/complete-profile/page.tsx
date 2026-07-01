"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeProfileAction } from "@/app/actions/auth";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [facebookError, setFacebookError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const EyeIcon = ({ show }: { show: boolean }) => (
    show ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    )
  );
  const [showGingerPassword, setShowGingerPassword] = useState(false);

  const [initialFirstName, setInitialFirstName] = useState("");
  const [initialLastName, setInitialLastName] = useState("");

  useEffect(() => {
    // Read names from cookies if they exist
    const cookies = document.cookie.split(';');
    const getCookie = (name: string) => {
      const match = cookies.find(c => c.trim().startsWith(name + '='));
      return match ? decodeURIComponent(match.split('=')[1]) : "";
    };

    const fullName = getCookie("signup_name");
    if (fullName) {
      const parts = fullName.split(" ");
      setInitialFirstName(parts[0] || "");
      setInitialLastName(parts.length > 1 ? parts.slice(1).join(" ") : "");
    }
  }, []);

  const FACEBOOK_REGEX = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com|m\.me|messenger\.com(\/t)?)\/.{3,}$/i;

  const handleFacebookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && !FACEBOOK_REGEX.test(val)) {
      setFacebookError("Invalid link format. E.g., facebook.com/username, fb.com/username, or messenger.com/t/username");
    } else {
      setFacebookError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    
    if (val.startsWith('63')) val = val.substring(2);
    if (val.startsWith('0')) val = val.substring(1);
    
    if (val.length > 0 && val[0] !== '9') {
      val = '';
    }

    if (val.length > 10) {
      val = val.substring(0, 10);
    }
    
    setPhone(val);
    
    if (val && val.length < 10) {
      setPhoneError("Phone number must be exactly 10 digits starting with 9.");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formDataObj = new FormData(e.currentTarget);
    const firstName = formDataObj.get("firstName") as string;
    const lastName = formDataObj.get("lastName") as string;
    
    const rawPhone = formDataObj.get("phone") as string;
    const phoneNum = rawPhone.startsWith("+63") ? rawPhone : `+63${rawPhone.replace(/^0/, '')}`;
    const PHONE_REGEX = /^\+639\d{9}$/;
    if (!PHONE_REGEX.test(phoneNum)) {
      setError("Invalid Philippine phone number. Please use 9XXXXXXXXX format.");
      setIsLoading(false);
      return;
    }
    const finalPhone = phoneNum;
    
    const facebook = formDataObj.get("facebook") as string;
    const password = formDataObj.get("password") as string;
    const password_conf = formDataObj.get("password_conf") as string;
    
    const gingerEmail = formDataObj.get("gingerEmail") as string;
    const gingerUsername = formDataObj.get("gingerUsername") as string;
    const gingerPassword = formDataObj.get("gingerPassword") as string;

    if (!password) {
      setError("Password is required.");
      setIsLoading(false); return;
    }

    if (password.length < 5) {
      setError("Password must be at least 5 characters long." );
      setIsLoading(false); return;
    }

    if (password !== password_conf) {
      setError("Passwords do not match.");
      setIsLoading(false); return;
    }

    if (facebook && !FACEBOOK_REGEX.test(facebook)) {
      setError("Invalid Facebook link format.");
      setIsLoading(false); return;
    }

    if (!gingerEmail || !gingerUsername || !gingerPassword) {
      setError("Ginger credentials are required to link your account.");
      setIsLoading(false); return;
    }

    try {
      const res = await completeProfileAction({ 
        firstName, 
        lastName, 
        phone: finalPhone, 
        facebook, 
        password,
        gingerEmail,
        gingerUsername,
        gingerPassword
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to complete profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while connecting to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#E0E1DD] dark:bg-[#060D14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-8 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-[#55f761] rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0D1B2A] dark:text-white">Account Linked!</h2>
          <p className="text-sm text-[#2F3E46] dark:text-white/70 mt-3 mb-6">
            Your Google account has been successfully linked with your Ginger credentials. Please log in to the Xfinite website to continue.
          </p>
          <button
            onClick={() => window.location.href = 'https://app.xfnite.cloud/'}
            className="w-full bg-[#1F7A1F] hover:bg-[#145214] text-white dark:bg-[#55f761] dark:hover:bg-[#3de34a] dark:text-[#060D14] font-semibold rounded-xl py-3.5 text-sm transition-all"
          >
            Go to Xfinite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0E1DD] dark:bg-[#060D14] flex flex-col items-center justify-center p-4 py-12 relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute rounded-full blur-[80px] opacity-40 dark:opacity-15 bg-[#55f761] w-[40vw] h-[40vw] -top-[10%] -left-[10%] animate-pulse"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 dark:opacity-15 bg-[#1F7A1F] w-[50vw] h-[50vw] top-[40%] -right-[20%] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full flex flex-col justify-center max-w-xl bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-tr-2xl rounded-bl-2xl shadow-2xl p-6 sm:p-8 animate-scale-in">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-[#0D1B2A] dark:text-white">
            Link Your Account
          </h1>
          <p className="text-sm text-[#2F3E46] dark:text-white/60 mt-1.5">
            Complete your profile and link your existing Ginger credentials.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="firstName">First Name <span className="text-red-500">*</span></label>
              <input
                className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                type="text" id="firstName" name="firstName" required defaultValue={initialFirstName} disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="lastName">Last Name <span className="text-red-500">*</span></label>
              <input
                className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                type="text" id="lastName" name="lastName" required defaultValue={initialLastName} disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="facebook">Facebook Profile Link <span className="text-red-500">*</span></label>
            <input
              className={`w-full px-3 py-2.5 bg-white dark:bg-white/10 border rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 ${facebookError ? "border-red-400 focus:ring-red-300" : "border-black/15 dark:border-white/15 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"}`}
              type="text" id="facebook" name="facebook" placeholder="https://facebook.com/yourprofile" required disabled={isLoading} onChange={handleFacebookChange}
            />
            {facebookError && <p className="text-xs text-red-500 mt-1">{facebookError}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="phone">Phone Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-black/15 dark:border-white/15 rounded-lg text-sm font-medium text-[#0D1B2A] dark:text-white">
                <span className="text-lg">🇵🇭</span><span>+63</span>
              </div>
              <input
                className={`flex-1 w-full px-3 py-2.5 bg-white dark:bg-white/10 border rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 ${phoneError ? "border-red-400 focus:ring-red-300" : "border-black/15 dark:border-white/15 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"}`}
                type="tel" id="phone" name="phone" value={phone} placeholder="9123456789" maxLength={10} required disabled={isLoading} onChange={handlePhoneChange}
              />
            </div>
            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="password">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                  type={showPassword ? "text" : "password"} id="password" name="password" placeholder="••••••••" required disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 text-[#2F3E46] dark:text-white/60 hover:text-black dark:hover:text-white transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="password_conf">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                  type={showConfirmPassword ? "text" : "password"} id="password_conf" name="password_conf" placeholder="••••••••" required disabled={isLoading}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 text-[#2F3E46] dark:text-white/60 hover:text-black dark:hover:text-white transition-colors" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  <EyeIcon show={showConfirmPassword} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-black/10 dark:border-white/10 pt-5 mt-2">
            <h3 className="text-md font-semibold text-[#0D1B2A] dark:text-white mb-4">Link Existing Ginger Account</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="gingerEmail">Ginger Email <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                  type="email" id="gingerEmail" name="gingerEmail" required disabled={isLoading} placeholder="example@ginger.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="gingerUsername">Ginger Username <span className="text-red-500">*</span></label>
                  <input
                    className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                    type="text" id="gingerUsername" name="gingerUsername" required disabled={isLoading} placeholder="Username"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#1B263B] dark:text-white/80" htmlFor="gingerPassword">Ginger Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      className="w-full px-3 py-2.5 bg-white dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-lg text-sm text-[#0D1B2A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F7A1F]/30 dark:focus:ring-[#55f761]/40"
                      type={showGingerPassword ? "text" : "password"} id="gingerPassword" name="gingerPassword" required disabled={isLoading} placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowGingerPassword(!showGingerPassword)} className="absolute inset-y-0 right-3 text-[#2F3E46] dark:text-white/60 hover:text-black dark:hover:text-white transition-colors" aria-label={showGingerPassword ? "Hide password" : "Show password"}>
                      <EyeIcon show={showGingerPassword} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1F7A1F] hover:bg-[#145214] text-white dark:bg-[#55f761] dark:hover:bg-[#3de34a] dark:text-[#060D14] font-semibold rounded-tr-xl rounded-bl-xl py-3 text-sm transition-colors shadow-lg shadow-black/10 dark:shadow-[#55f761]/20 disabled:opacity-70 flex justify-center items-center mt-2 cursor-pointer"
          >
            {isLoading ? "Submitting..." : "Complete Registration"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
