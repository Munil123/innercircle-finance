import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './index.css';

import Dashboard from './Dashboard';
import Reports from './Reports';
import Transactions from './Transactions';
import Investments from './Investments';
import Lending from './Lending';
import Settings from './Settings';

// --- Supabase client ---
const supabaseUrl = 'https://zpajciigehfxqyarcson.supabase.co';
const supabaseAnonKey = 'ey...FxB0-c'; // Use your actual key here
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Auth Context ---
interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const { signIn } = useAuth();
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email);
      setMessage('Check your email for the login link!');
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignIn} className="space-y-4 w-80 p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-2">Sign in to Inner Circle Finance</h2>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border w-full px-3 py-2 rounded"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2 w-full">
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
        {message && <div className="text-green-600">{message}</div>}
      </form>
    </div>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investments"
        element={
          <ProtectedRoute>
            <Investments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lending"
        element={
          <ProtectedRoute>
            <Lending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<div>404: Page Not Found</div>} />
    </Routes>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
