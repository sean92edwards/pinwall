import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
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
      <div style={{ background:"#f5f0e8", padding:"40px", borderRadius:8, width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:34, height:34, background:"#1a1a1a", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📌</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:24 }}>Pinwall</span>
        </div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:6 }}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </div>
        <div style={{ fontFamily:"'Lato',sans-serif", fontSize:13, color:"#888", marginBottom:28 }}>
          {isSignUp ? "Photos. Not noise." : "Sign in to your Pinwall"}
        </div>
        <input
          type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", padding:"12px 14px", border:"2px solid #ddd", borderRadius:8, fontFamily:"'Lato',sans-serif", fontSize:14, outline:"none", marginBottom:12, background:"white" }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:"12px 14px", border:"2px solid #ddd", borderRadius:8, fontFamily:"'Lato',sans-serif", fontSize:14, outline:"none", marginBottom:20, background:"white" }}
        />
        {error && <div style={{ fontFamily:"'Lato',sans-serif", fontSize:12, color:"#e63946", marginBottom:12 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", background:"#1a1a1a", color:"white", border:"none", borderRadius:28, padding:"14px", fontFamily:"'Lato',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:16 }}>
          {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
        </button>
        <div style={{ textAlign:"center", fontFamily:"'Lato',sans-serif", fontSize:13, color:"#888" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color:"#1a1a1a", fontWeight:700, cursor:"pointer" }}>
            {isSignUp ? "Sign in" : "Sign up"}
          </span>
        </div>
      </div>
    </div>
  );
}