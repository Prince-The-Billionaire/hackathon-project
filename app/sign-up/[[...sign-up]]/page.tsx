import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl pointer-events-none" />
      <div className="relative z-10 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
        <SignUp 
          path="/sign-up" // Correctly anchors the sign-up route
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}