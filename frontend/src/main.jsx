import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Registration from './registration.jsx';
import PersonGrid from './personGrid.jsx';

function App() {
  const [currentView, setCurrentView] = useState('grid'); // 'grid', 'add', 'edit'
  const [selectedPerson, setSelectedPerson] = useState(null);

  const navigateToGrid = () => {
    setSelectedPerson(null);
    setCurrentView('grid');
  };

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
    setCurrentView('edit');
  };

  const handleAddNew = () => {
    setSelectedPerson(null);
    setCurrentView('add');
  };

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
          <button 
            onClick={navigateToGrid} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              currentView === 'grid' 
                ? 'bg-olive-600 text-stone-50 shadow-md' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            Directory List
          </button>
          <button 
            onClick={handleAddNew} 
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              currentView === 'add' 
                ? 'bg-olive-600 text-stone-50 shadow-md' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            Add Location
          </button>
          {currentView === 'edit' && (
            <span className="px-4 py-2 text-xs font-bold text-olive-400 bg-olive-500/10 rounded-lg border border-olive-500/20 animate-pulse">
              Editing Record
            </span>
          )}
        </nav>
      </header>

      {/* Main Panel */}
      <main className="flex-grow">
        {currentView === 'grid' && (
          <PersonGrid onEdit={handleEditPerson} onAddNew={handleAddNew} />
        )}
        {(currentView === 'add' || currentView === 'edit') && (
          <Registration editPerson={selectedPerson} onCancel={navigateToGrid} />
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
