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
  const [loading, setLoading] = useState(false);

  // Sync state if id changes (Fetch details if in Edit mode)
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      if (id) {
        setLoading(true);
        try {
          const response = await authFetch(`http://localhost:5000/api/person/${id}`);
          if (response.ok && active) {
            const person = await response.json();
            setFormData({
              fullName: person.fullName || '',
              phone: person.phoneNumber || '',
              email: person.emailAddress || '',
              password: '', // clear password input field during edit
            });
            if (person.geometryDataJson) {
              try {
                setGeometryData({
                  type: person.shapeType.toLowerCase(),
                  coordinates: JSON.parse(person.geometryDataJson)
                });
              } catch (err) {
                console.error("Failed to parse initial shape geometry JSON:", err);
                setGeometryData(null);
              }
            } else {
              setGeometryData(null);
            }
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

    if (!formData.fullName || !formData.phone || !formData.email || !geometryData) {
      toast.error("Please fill out all fields and draw a shape on the map!");
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

    // Capitalize the first letter of the shape type (e.g. 'circle' -> 'Circle') for database consistency
    const shapeTypeFormatted = geometryData.type.charAt(0).toUpperCase() + geometryData.type.slice(1);

    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phone,
      emailAddress: formData.email,
      shapeType: shapeTypeFormatted,
      geometryDataJson: JSON.stringify(geometryData.coordinates),
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    const isEditMode = !!id;
    const url = isEditMode 
      ? `http://localhost:5000/api/person/${id}`
      : 'http://localhost:5000/api/person';

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

  return (
    <section className="bg-stone-900 justify-center items-center h-[calc(100vh-80px)] flex overflow-hidden">
      {/* Left Form Panel */}
      <div className="w-1/3 h-full flex justify-center items-center p-6 border-r border-stone-850 bg-stone-900">
        <div className="flex flex-col items-center gap-6 p-8 w-full max-w-md rounded-2xl bg-stone-800 border border-stone-700/60 shadow-2xl overflow-y-auto max-h-[90%]">
          <h3 className="text-2xl font-bold tracking-tight text-stone-100">
            {id ? "Edit My Profile" : "Register & Draw"}
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
              <input 
                type="text" 
                id="coordinates" 
                disabled 
                value={getCoordinatePlaceholder()}
                className={`rounded-lg p-2.5 border text-sm font-semibold ${
                  geometryData 
                    ? 'bg-olive-500/10 text-olive-400 border-olive-500/20' 
                    : 'bg-stone-950 text-stone-500 border-stone-750'
                }`}
              />
            </div>
            
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
        <MapComponent onShapeSelect={handleShapeCapture} initialShape={geometryData} />
      </div>
    </section>
  );
}