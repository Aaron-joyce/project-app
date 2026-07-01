import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, themeQuartz, colorSchemeDark } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { useToast } from './toastContext.jsx';
import { useAuth } from './authContext.jsx';

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create the custom dark theme to match our Stone + Olive + Gray design
const stoneOliveTheme = themeQuartz
  .withPart(colorSchemeDark)
  .withParams({
    backgroundColor: '#292524', // Stone 800
    foregroundColor: '#fafaf9', // Stone 50
    secondaryForegroundColor: '#d6d3d1', // Stone 300
    headerBackgroundColor: '#1c1917', // Stone 900
    headerForegroundColor: '#fafaf9', // Stone 50
    oddRowBackgroundColor: '#292524', // Stone 800
    rowHoverColor: '#44403c', // Stone 700
    borderColor: '#44403c', // Stone 700
    selectedRowBackgroundColor: 'rgba(97, 130, 102, 0.2)', // Olive 500 w/ opacity
    accentColor: '#618266', // Olive 500
    fontFamily: 'Outfit, sans-serif',
  });

export default function PersonGrid() {
  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { authFetch, user } = useAuth();

  const handleDeleteMap = async (mapId) => {
    if (!window.confirm("Are you sure you want to delete this map drawing?")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await authFetch(`${apiUrl}/api/drawings/${mapId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Map drawing deleted successfully!");
        setRowData(prev => prev.filter(row => row.id !== mapId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || "Failed to delete map drawing.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error: Could not connect to delete endpoint.");
    }
  };

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await authFetch(`${apiUrl}/api/person`);
      if (response.ok) {
        const data = await response.json();
        const currentUser = data[0];
        setRowData(currentUser ? currentUser.drawings : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || errorData.message || "Failed to load directory data.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      const networkMsg = "Network error: Could not reach the API server. Please verify the backend is running.";
      setError(networkMsg);
      toast.error("Failed to connect to the directory API.");
    } finally {
      setLoading(false);
    }
  }, [toast, authFetch]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchPersons();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchPersons]);

  // Custom action buttons renderer inside AG Grid cells
  const ActionButtonRenderer = (params) => {
    return (
      <div className="flex gap-2 items-center h-full">
        <button 
          onClick={() => handleDeleteMap(params.data.id)} 
          className="bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold px-3 py-1 rounded-lg border border-red-900/30 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
        >
          Delete Map
        </button>
      </div>
    );
  };

  const columnDefs = [
    { field: 'name', headerName: 'Map Name', sortable: true, filter: true, flex: 1.2, minWidth: 150 },
    { field: 'id', headerName: 'Map ID', sortable: true, filter: true, flex: 1, minWidth: 130 },
    { 
      field: 'shapeType', 
      headerName: 'Shape Type', 
      sortable: true, 
      filter: true, 
      width: 130,
      cellRenderer: (params) => {
        const type = params.value;
        const colorClass = type === 'Circle' ? 'bg-olive-500/20 text-olive-400 border-olive-500/30' :
                           type === 'Rectangle' ? 'bg-stone-500/25 text-stone-300 border-stone-500/30' :
                           'bg-gray-500/20 text-gray-300 border-gray-500/30';
        return (
          <span className={`inline-block px-2.5 py-0.5 text-xs font-medium border rounded-full ${colorClass}`}>
            {type}
          </span>
        );
      }
    },
    { 
      field: 'geometryDataJson', 
      headerName: 'Coordinates / Bounds', 
      sortable: false, 
      filter: true, 
      flex: 2, 
      minWidth: 250,
      cellRenderer: (params) => {
        try {
          const coords = JSON.parse(params.value);
          if (params.data.shapeType === 'Circle') {
            return `Center: (${coords.center.lat.toFixed(4)}, ${coords.center.lng.toFixed(4)}), Radius: ${Math.round(coords.radius)}m`;
          }
          if (params.data.shapeType === 'Rectangle') {
            return `NE: (${coords.northEast.lat.toFixed(4)}, ${coords.northEast.lng.toFixed(4)}), SW: (${coords.southWest.lat.toFixed(4)}, ${coords.southWest.lng.toFixed(4)})`;
          }
          if (params.data.shapeType === 'Polygon') {
            return `${coords.length} vertices: [(${coords[0].lat.toFixed(4)}, ${coords[0].lng.toFixed(4)}), ...]`;
          }
          return params.value;
        } catch (e) {
          return "Invalid Geometry Data";
        }
      }
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      sortable: true, 
      filter: true, 
      flex: 1, 
      minWidth: 130,
      cellRenderer: (params) => {
        return new Date(params.value).toLocaleDateString();
      }
    },
    { 
      headerName: 'Actions', 
      cellRenderer: ActionButtonRenderer, 
      width: 120, 
      sortable: false, 
      filter: false,
      suppressMovable: true
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-8 max-w-7xl mx-auto w-full">
      {/* Header Panel */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-stone-100 via-stone-300 to-olive-400 bg-clip-text text-transparent">
            My Saved Maps
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Browse and manage your registered details and designated map shapes.
          </p>
        </div>
        <div className="flex gap-3">
          {user?.id && (
            <button
              onClick={() => navigate(`/edit/${user.id}`)}
              className="relative group overflow-hidden bg-stone-800 border border-stone-700/60 text-stone-300 font-medium px-5 py-2.5 rounded-xl shadow-md hover:bg-stone-750 transition-all duration-200 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </span>
            </button>
          )}
          <button
            onClick={() => navigate('/add-map')}
            className="relative group overflow-hidden bg-olive-655 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:shadow-olive-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Map
            </span>
          </button>
        </div>
      </div>

      {/* Grid Panel with glassmorphism border wrapper */}
      <div className="grow w-full backdrop-blur-md rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col bg-stone-900 border border-stone-850">
        {loading ? (
          <div className="grow flex flex-col items-center justify-center py-20 text-stone-400">
            <svg className="animate-spin h-8 w-8 text-olive-500 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium tracking-wide">Connecting to directory database...</span>
          </div>
        ) : error ? (
          <div className="grow flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 shadow-md shadow-red-500/5">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-200">Connection Failed</h3>
            <p className="text-stone-400 text-xs mt-2 mb-6 leading-relaxed">
              {error}
            </p>
            <button 
              onClick={fetchPersons} 
              className="bg-stone-800 hover:bg-stone-750 text-stone-100 text-xs font-semibold px-6 py-2.5 rounded-xl border border-stone-700 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
              </svg>
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="w-full h-full rounded-xl overflow-hidden">
            <AgGridReact
              theme={stoneOliveTheme}
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              domLayout="normal"
              animateRows={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
