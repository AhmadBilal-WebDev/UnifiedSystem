import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Login() {
  const { login } = useApp();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    // AppContext.login(email, password) calls the API and stores the token
    const result = await login(email, password);
    if (result && !result.success) {
      setError(result.message || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:20 }}>
      <div style={{ display:'flex', flexDirection:'column', width:'100%', maxWidth:400, gap:24 }}>

        <div style={{ textAlign:'center' }}>
          <div style={{ width:52, height:52, background:'var(--accent)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#fff', fontWeight:900, fontSize:18 }}>
            ROS
          </div>
          <h1 style={{ fontWeight:900, fontSize:26 }}>RestaurantOS</h1>
          <p style={{ fontSize:13, color:'var(--text-m)', marginTop:6 }}>
            Access your restaurant dashboard
          </p>
        </div>

        <div className="card">
          <div style={{ marginBottom:20 }}>
            <div style={{ fontWeight:800, fontSize:18 }}>Sign In</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Email */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, marginBottom:5 }}>Email Address</div>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                onKeyDown={(e) => e.key === 'Enter' && handle()}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, marginBottom:5 }}>Password</div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handle()}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:'#ffe5e5', border:'1px solid red', borderRadius:6, padding:'8px 12px', fontSize:12, color:'red' }}>
                {error}
              </div>
            )}

            {/* Button */}
            <button
              className="btn btn-primary"
              style={{ width:'100%', padding:'11px' }}
              onClick={handle}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
