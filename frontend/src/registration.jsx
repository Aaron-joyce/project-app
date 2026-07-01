import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import MapComponent from './map';
import { useToast } from './toastContext.jsx';
import { useAuth } from './authContext.jsx';

const NAME_REGEX = /^[a-zA-Z\s\-']{2,100}$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%\+\-]+@[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,}$/;

export default function Registration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { authFetch, login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [geometryData, setGeometryData] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSaveNewShape = async () => {
    if (!geometryData) return;
    const shapeTypeFormatted = geometryData.type.charAt(0).toUpperCase() + geometryData.type.slice(1);
    const payload = {
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
        const result = await response.json();
        toast.success("New shape saved successfully!");
        setDrawings(prev => [...prev, {
          id: result.id,
          shapeType: shapeTypeFormatted,
          geometryDataJson: payload.geometryDataJson
        }]);
        setGeometryData(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || "Failed to save new shape.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error: Could not save the new shape.");
    }
  };

  const handleDeleteShape = async (drawingId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await authFetch(`${apiUrl}/api/drawings/${drawingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Shape deleted successfully!");
        setDrawings(prev => prev.filter(d => d.id !== drawingId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || "Failed to delete shape.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error: Could not delete shape.");
    }
  };

  // Sync state if id changes (Fetch details if in Edit mode)
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      if (id) {
        setLoading(true);
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const response = await authFetch(`${apiUrl}/api/person/${id}`);
          if (response.ok && active) {
            const person = await response.json();
            setFormData({
              fullName: person.fullName || '',
              phone: person.phoneNumber || '',
              email: person.emailAddress || '',
              password: '', // clear password input field during edit
            });
            setDrawings(person.drawings || []);
            setGeometryData(null);
          } else if (active) {
            const errorData = await response.json().catch(() => ({}));
            toast.error(errorData.detail || errorData.message || "Failed to load person details.");
            navigate('/');
          }
        } catch (err) {
          console.error(err);
          if (active) {
            toast.error("Network error: Could not reach the API server to load person details.");
            navigate('/');
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      } else {
        setFormData((prev) => {
          if (prev.fullName === '' && prev.phone === '' && prev.email === '' && prev.password === '') return prev;
          return { fullName: '', phone: '', email: '', password: '' };
        });
        setGeometryData((prev) => {
          if (prev === null) return prev;
          return null;
        });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id, navigate, toast, authFetch]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShapeCapture = useCallback((shape) => {
    setGeometryData(shape);
    console.log("Captured Shape Data:", shape);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.email) {
      toast.error("Please fill out all required fields!");
      return;
    }

    if (!id && !formData.password) {
      toast.error("Please choose a password for registration.");
      return;
    }

    if (!NAME_REGEX.test(formData.fullName)) {
      toast.error("Invalid Name: Names can only contain letters, spaces, hyphens, and apostrophes (2-100 characters).");
      return;
    }

    if (!PHONE_REGEX.test(formData.phone)) {
      toast.error("Invalid Phone Number: Must be exactly 10 digits.");
      return;
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      toast.error("Invalid Email Address format.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const isEditMode = !!id;
    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phone,
      emailAddress: formData.email,
    };

    if (isEditMode) {
      const firstDrawing = drawings[0];
      if (firstDrawing) {
        payload.shapeType = firstDrawing.shapeType;
        payload.geometryDataJson = firstDrawing.geometryDataJson;
      }
    }

    if (formData.password) {
      payload.password = formData.password;
    }

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const url = isEditMode 
      ? `${apiUrl}/api/person/${id}`
      : `${apiUrl}/api/person`;

    try {
      let response;
      if (isEditMode) {
        response = await authFetch(url, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast.success(isEditMode ? "Profile and shape details updated!" : "Registration successful!");
        if (isEditMode) {
          navigate('/');
        } else {
          // Attempt automatic login after registration
          try {
            await login(formData.email, formData.password);
            toast.info("Logged in automatically!");
            navigate('/');
          } catch (loginErr) {
            console.error("Auto login failed:", loginErr);
            navigate('/login');
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || "Failed to save person record.");
      }
    } catch (err) {
      console.error("Network error saving record:", err);
      toast.error("Network error: Could not reach the backend server.");
    }
  };

  const getCoordinatePlaceholder = () => {
    if (!geometryData) return "Draw on the map...";
    return `${geometryData.type.toUpperCase()} shape captured`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-stone-900 text-stone-400">
        <svg className="animate-spin h-8 w-8 text-olive-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-medium tracking-wide">Loading profile details...</span>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center bg-stone-900 px-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-stone-800 border border-stone-700/60 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-600 to-olive-600 flex items-center justify-center shadow-md shadow-olive-600/20 mb-2">
              <svg className="w-7 h-7 text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-100">Create Account</h2>
            <p className="text-stone-400 text-xs text-center">
              Register to start drawing custom maps and saving shapes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="fullName" className="text-xs font-semibold text-stone-300">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName" 
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="E.g. John Doe" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                pattern="^[a-zA-Z\s\-']{2,100}$"
                title="Name can only contain letters, spaces, hyphens, and apostrophes (between 2 and 100 characters)."
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="phone" className="text-xs font-semibold text-stone-300">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="E.g. 9876543210" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                pattern="^[0-9]{10}$"
                title="Phone number must be exactly 10 digits."
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="email" className="text-xs font-semibold text-stone-300">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E.g. xyz@abc.com" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                pattern="^[a-zA-Z0-9._%\+\-]+@[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address (e.g. user@domain.com)."
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="password" className="text-xs font-semibold text-stone-300">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleInputChange}
                placeholder="At least 6 characters" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                minLength="6"
                required
              />
            </div>

            <div className="flex gap-3 w-full mt-4">
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-olive-600 hover:bg-olive-500 text-stone-50 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md shadow-olive-600/10"
              >
                Register
              </button>
            </div>

            <div className="text-center text-xs text-stone-400 mt-2">
              Already registered?{' '}
              <Link to="/login" className="text-olive-400 hover:text-olive-300 font-semibold transition-colors">
                Log in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-stone-900 justify-center items-center h-[calc(100vh-80px)] flex overflow-hidden">
      {/* Left Form Panel */}
      <div className="w-1/3 h-full flex justify-center items-center p-6 border-r border-stone-850 bg-stone-900">
        <div className="flex flex-col items-center gap-6 p-8 w-full max-w-md rounded-2xl bg-stone-800 border border-stone-700/60 shadow-2xl overflow-y-auto max-h-[90%]">
          <h3 className="text-2xl font-bold tracking-tight text-stone-100">
            Edit My Profile
          </h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 items-center w-full">
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="fullName" className="text-xs font-semibold text-stone-300">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName" 
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="E.g. John Doe" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                pattern="^[a-zA-Z\s\-']{2,100}$"
                title="Name can only contain letters, spaces, hyphens, and apostrophes (between 2 and 100 characters)."
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="phone" className="text-xs font-semibold text-stone-300">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="E.g. 9876543210" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                pattern="^[0-9]{10}$"
                title="Phone number must be exactly 10 digits."
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="email" className="text-xs font-semibold text-stone-300">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E.g. xyz@abc.com" 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                pattern="^[a-zA-Z0-9._%\+\-]+@[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address (e.g. user@domain.com)."
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="password" className="text-xs font-semibold text-stone-300">
                {id ? "Change Password (Optional)" : "Password"}
              </label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleInputChange}
                placeholder={id ? "Leave blank to keep unchanged" : "At least 6 characters"} 
                className="bg-stone-950 border border-stone-750 rounded-lg p-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-olive-500 transition-colors"
                minLength="6"
                required={!id}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="coordinates" className="text-xs font-semibold text-stone-300">Drawing Status</label>
              <div className="flex gap-2 w-full">
                <input 
                  type="text" 
                  id="coordinates" 
                  disabled 
                  value={getCoordinatePlaceholder()}
                  className={`grow rounded-lg p-2.5 border text-sm font-semibold ${
                    geometryData 
                      ? 'bg-olive-500/10 text-olive-400 border-olive-500/20' 
                      : 'bg-stone-950 text-stone-500 border-stone-750'
                  }`}
                />
                {id && geometryData && (
                  <button
                    type="button"
                    onClick={handleSaveNewShape}
                    className="bg-olive-655 hover:bg-olive-500 text-stone-50 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-olive-500/30"
                  >
                    Save Shape
                  </button>
                )}
              </div>
            </div>

            {id && (
              <div className="w-full border-t border-stone-750 pt-4 mt-2 flex flex-col space-y-2">
                <h4 className="text-xs font-bold text-stone-300">My Saved Maps ({drawings.length})</h4>
                {drawings.length === 0 ? (
                  <p className="text-stone-500 text-xs italic">No maps saved yet.</p>
                ) : (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1 w-full">
                    {drawings.map((d) => (
                      <li key={d.id} className="flex justify-between items-center bg-stone-950 border border-stone-850 px-3 py-2 rounded-lg">
                        <span className="text-xs font-semibold text-stone-200">{d.shapeType} Map</span>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteShape(d.id)}
                          className="text-red-400 hover:text-red-300 text-xs cursor-pointer font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            <div className="flex gap-3 w-full mt-4">
              <button 
                type="button" 
                onClick={() => navigate(isAuthenticated ? '/' : '/login')}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-olive-600 hover:bg-olive-500 text-stone-50 font-semibold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center text-sm shadow-md shadow-olive-600/10"
              >
                Save
              </button>
            </div>

            {!isAuthenticated && (
              <div className="text-center text-xs text-stone-400 mt-2">
                Already registered?{' '}
                <Link to="/login" className="text-olive-400 hover:text-olive-300 font-semibold transition-colors">
                  Log in here
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="w-2/3 h-full relative">
        <MapComponent 
          onShapeSelect={handleShapeCapture} 
          initialShape={geometryData} 
          savedDrawings={drawings} 
        />
      </div>
    </section>
  );
}