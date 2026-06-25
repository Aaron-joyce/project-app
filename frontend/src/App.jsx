import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import Registration from './registration.jsx';
import PersonGrid from './personGrid.jsx';
import Login from './login.jsx';
import { useAuth } from './authContext.jsx';

export default function App() {
  const { isAuthenticated, logout, user, loading } = useAuth();
  const location = useLocation();
  const isEditing = location.pathname.startsWith('/edit/');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-900 text-stone-400">
        <svg className="animate-spin h-8 w-8 text-olive-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-medium tracking-wide">Loading application session...</span>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-olive-650 selection:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-900/70 border-b border-stone-800 px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-600 to-olive-600 flex items-center justify-center shadow-md shadow-olive-600/20">
            <svg className="w-6 h-6 text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-stone-100">Project App</h1>
          </div>
        </div>

        {/* User Session & Navigation */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Authenticated Profile</p>
            <p className="text-xs text-stone-300 font-medium">{user?.name || user?.email}</p>
          </div>
          <nav className="flex items-center gap-1.5 bg-stone-950/40 p-1.5 rounded-xl border border-stone-800">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-olive-600 text-stone-50 shadow-md' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`
              }
            >
              My Map Directory
            </NavLink>
            {isEditing && (
              <span className="px-4 py-2 text-xs font-bold text-olive-400 bg-olive-500/10 rounded-lg border border-olive-500/20 animate-pulse">
                Editing Map
              </span>
            )}
            <button 
              onClick={logout} 
              className="px-4 py-2 text-xs font-semibold rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
            >
              Log Out
            </button>
          </nav>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<PersonGrid />} />
          <Route path="/edit/:id" element={<Registration />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
