import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './authContext';
import { useToast } from './toastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back! Logged in successfully.");
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex justify-center items-center bg-stone-900 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-stone-800 border border-stone-700/60 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-600 to-olive-600 flex items-center justify-center shadow-md shadow-olive-600/20 mb-2">
            <svg className="w-7 h-7 text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-100">Sign In to Directory</h2>
          <p className="text-stone-400 text-xs text-center">
            Enter your credentials to view and manage your map drawing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1.5 w-full">
            <label htmlFor="email" className="text-xs font-semibold text-stone-300">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com" 
              className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col space-y-1.5 w-full">
            <label htmlFor="password" className="text-xs font-semibold text-stone-300">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-olive-600 hover:bg-olive-500 text-stone-50 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md shadow-olive-600/10 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400">
          Not registered yet?{' '}
          <Link to="/register" className="text-olive-400 hover:text-olive-300 font-semibold transition-colors">
            Register and Draw Map
          </Link>
        </div>
      </div>
    </div>
  );
}
