import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({onTryDemo}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    if (isSignUp) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      <div style={{ background:"#f5f0e8", padding:"40px", borderRadius:12, width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:32 }}>
          <span style={{ fontSize:28, lineHeight:1 }}>📌</span>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:28, letterSpacing:"-0.02em", color:"#1a1a1a" }}>Pinwall</span>
        </div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:800, marginBottom:28, color:"#1a1a1a" }}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </div>
        <input
          type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", padding:"12px 14px", border:"2px solid #e8e2d8", borderRadius:8, fontFamily:"'Nunito',sans-serif", fontSize:14, outline:"none", marginBottom:12, background:"white" }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"12px 14px", border:"2px solid #e8e2d8", borderRadius:8, fontFamily:"'Nunito',sans-serif", fontSize:14, outline:"none", marginBottom:20, background:"white" }}
        />
        {error && <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"#e63946", marginBottom:12 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", background:"#1a1a1a", color:"white", border:"none", borderRadius:28, padding:"14px", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:16 }}>
          {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
        </button>
        <div style={{ textAlign:"center", fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#888" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color:"#1a1a1a", fontWeight:700, cursor:"pointer" }}>
            {isSignUp ? "Sign in" : "Sign up"}
          </span>
        </div>
        <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid #e8e2d8", textAlign:"center" }}>
          <button onClick={onTryDemo} style={{ background:"none", border:"2px solid #2a9d8f", color:"#2a9d8f", borderRadius:28, padding:"12px 24px", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", width:"100%" }}>
            Try it without an account
          </button>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#aaa", marginTop:8 }}>Explore a demo wall. Resets on refresh.</div>
        </div>
      </div>
    </div>
  );
}
