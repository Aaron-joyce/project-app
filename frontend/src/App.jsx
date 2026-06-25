import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Registration from './registration.jsx';
import PersonGrid from './personGrid.jsx';

export default function App() {
  const location = useLocation();
  const isEditing = location.pathname.startsWith('/edit/');

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

        {/* Navigation Tabs */}
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
            Directory List
          </NavLink>
          <NavLink 
            to="/register" 
            className={({ isActive }) => 
              `px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-olive-600 text-stone-50 shadow-md' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`
            }
          >
            Add Person
          </NavLink>
          {isEditing && (
            <span className="px-4 py-2 text-xs font-bold text-olive-400 bg-olive-500/10 rounded-lg border border-olive-500/20 animate-pulse">
              Editing Person
            </span>
          )}
        </nav>
      </header>

      {/* Main Panel */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<PersonGrid />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/edit/:id" element={<Registration />} />
        </Routes>
      </main>
    </div>
  );
}
