import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import OverlayPanel from "../../components/auth/OverlayPanel";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      
      <div className="relative w-[900px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT FORM AREA */}
        <div className="w-1/2 flex items-center justify-center">
          <LoginForm />
        </div>

        {/* RIGHT FORM AREA */}
        <div className="w-1/2 flex items-center justify-center">
          <RegisterForm />
        </div>

        {/* OVERLAY */}
        <OverlayPanel isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

      </div>
    </div>
  );
}