import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from './map';
import { useToast } from './toastContext';
import { useAuth } from './authContext';

export default function AddMap() {
  const navigate = useNavigate();
  const toast = useToast();
  const { authFetch } = useAuth();

  const [mapName, setMapName] = useState('');
  const [geometryData, setGeometryData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [drawings, setDrawings] = useState([]); // Can be populated if we want to show existing shapes

  // Load existing drawings on mount to render them as read-only on the map
  useState(() => {
    let active = true;
    const fetchExistingDrawings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await authFetch(`${apiUrl}/api/person`);
        if (response.ok && active) {
          const data = await response.json();
          const currentUser = data[0];
          if (currentUser) {
            setDrawings(currentUser.drawings || []);
          }
        }
      } catch (err) {
        console.error("Failed to load existing drawings:", err);
      }
    };
    fetchExistingDrawings();
    return () => {
      active = false;
    };
  });

  const handleShapeCapture = useCallback((shape) => {
    setGeometryData(shape);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!mapName.trim()) {
      toast.error("Please enter a name for the map!");
      return;
    }
    if (!geometryData) {
      toast.error("Please draw a shape on the map before saving!");
      return;
    }

    setSaving(true);
    const shapeTypeFormatted = geometryData.type.charAt(0).toUpperCase() + geometryData.type.slice(1);
    const payload = {
      name: mapName.trim(),
      shapeType: shapeTypeFormatted,
      geometryDataJson: JSON.stringify(geometryData.coordinates),
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await authFetch(`${apiUrl}/api/drawings`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("New map drawing saved successfully!");
        navigate('/');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || "Failed to save map drawing.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error: Could not reach the database API.");
    } finally {
      setSaving(false);
    }
  };

  const getCoordinatePlaceholder = () => {
    if (!geometryData) return "Draw on the map...";
    return `${geometryData.type.toUpperCase()} shape captured`;
  };

  return (
    <section className="bg-stone-900 justify-center items-center h-[calc(100vh-80px)] flex overflow-hidden">
      {/* Left Form Panel */}
      <div className="w-1/4 h-full flex justify-center items-center p-6 border-r border-stone-850 bg-stone-900">
        <div className="flex flex-col items-center gap-6 p-8 w-full max-w-md rounded-2xl bg-stone-800 border border-stone-700/60 shadow-2xl overflow-y-auto max-h-[90%]">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-600 to-olive-600 flex items-center justify-center shadow-md shadow-olive-600/20 mb-2">
              <svg className="w-7 h-7 text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-stone-100">Draw New Map</h3>
            <p className="text-stone-400 text-xs text-center leading-relaxed">
              Select a tool at the top of the map (Polygon, Rectangle, or Circle), draw your boundary, and save.
            </p>
          </div>
          
          <form onSubmit={handleSave} className="flex flex-col space-y-4 items-center w-full">
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="mapName" className="text-xs font-semibold text-stone-300">Map Name</label>
              <input 
                type="text" 
                id="mapName" 
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder="e.g. My Backyard Boundary" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors w-full"
                maxLength={100}
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="coordinates" className="text-xs font-semibold text-stone-300">Drawing Status</label>
              <input 
                type="text" 
                id="coordinates" 
                disabled 
                value={getCoordinatePlaceholder()}
                className={`rounded-lg p-2.5 border text-sm font-semibold w-full ${
                  geometryData 
                    ? 'bg-olive-500/10 text-olive-400 border-olive-500/20' 
                    : 'bg-stone-950 text-stone-500 border-stone-750'
                }`}
              />
            </div>
            
            <div className="flex gap-3 w-full mt-4">
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-olive-600 hover:bg-olive-500 text-stone-50 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md shadow-olive-600/10 disabled:opacity-60"
                disabled={saving || !geometryData || !mapName.trim()}
              >
                {saving ? "Saving..." : "Save Map"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="w-3/4 h-full relative">
        <MapComponent 
          onShapeSelect={handleShapeCapture} 
          initialShape={null} 
          savedDrawings={drawings} 
        />
      </div>
    </section>
  );
}
