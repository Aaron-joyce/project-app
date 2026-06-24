import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from './map';
import { useToast } from './toastContext.jsx';

export default function Registration({ editPerson, onCancel }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [geometryData, setGeometryData] = useState(null);

  // Sync state if editPerson changes
  useEffect(() => {
    if (editPerson) {
      setFormData({
        fullName: editPerson.fullName || '',
        phone: editPerson.phoneNumber || '',
        email: editPerson.emailAddress || '',
      });
      if (editPerson.geometryDataJson) {
        try {
          setGeometryData({
            type: editPerson.shapeType.toLowerCase(),
            coordinates: JSON.parse(editPerson.geometryDataJson)
          });
        } catch (err) {
          console.error("Failed to parse initial shape geometry JSON:", err);
          setGeometryData(null);
        }
      } else {
        setGeometryData(null);
      }
    } else {
      setFormData({ fullName: '', phone: '', email: '' });
      setGeometryData(null);
    }
  }, [editPerson]);

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

    // Capitalize the first letter of the shape type (e.g. 'circle' -> 'Circle') for database consistency
    const shapeTypeFormatted = geometryData.type.charAt(0).toUpperCase() + geometryData.type.slice(1);

    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phone,
      emailAddress: formData.email,
      shapeType: shapeTypeFormatted,
      geometryDataJson: JSON.stringify(geometryData.coordinates),
    };

    const isEditMode = !!editPerson;
    const url = isEditMode 
      ? `http://localhost:5000/api/person/${editPerson.id}`
      : 'http://localhost:5000/api/person';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(isEditMode ? "Person details updated successfully!" : "Person registered successfully!");
        if (onCancel) {
          onCancel(); // Redirect back to grid view
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

  return (
    <section className="bg-stone-900 justify-center items-center h-[calc(100vh-80px)] flex overflow-hidden">
      {/* Left Form Panel */}
      <div className="w-1/3 h-full flex justify-center items-center p-6 border-r border-stone-850 bg-stone-900">
        <div className="flex flex-col items-center gap-6 p-8 w-full max-w-md rounded-2xl bg-stone-800 border border-stone-700/60 shadow-2xl">
          <h3 className="text-2xl font-bold tracking-tight text-stone-100">
            {editPerson ? "Edit Person Details" : "Register New Person"}
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
                pattern="^\+?[0-9\s\-()]{7,20}$"
                title="Phone number must be digits between 7 and 20 characters (optional '+' prefix, spaces, hyphens, and parentheses allowed)."
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
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address (e.g. user@domain.com)."
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
                onClick={onCancel}
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