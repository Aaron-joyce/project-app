import React, { useState, useCallback } from 'react'; // Added useCallback
import MapComponent from './map';

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [geometryData, setGeometryData] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FIX: Memoize this function callback so it doesn't change on input keystrokes
  const handleShapeCapture = useCallback((shape) => {
    setGeometryData(shape);
    console.log("Captured Shape Data:", shape);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.email || !geometryData) {
      alert("Please fill out all fields and draw a shape on the map!");
      return;
    }

    const payload = {
      fullName: formData.fullName,
      phoneNumber: formData.phone,
      emailAddress: formData.email,
      shapeType: geometryData.type,
      geometryDataJson: JSON.stringify(geometryData.coordinates),
    };

    try {
      const response = await fetch('http://localhost:5000/api/person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Registration saved successfully!");
      } else {
        alert("Server error saving data.");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const getCoordinatePlaceholder = () => {
    if (!geometryData) return "Draw on the map...";
    return `${geometryData.type.toUpperCase()} shape captured`;
  };

  return (
    <section className="bg-olive-50 justify-center items-center h-screen flex">
      {/* Left Form Panel */}
      <div className="w-1/3 flex justify-center">
        <div className="flex flex-col items-center gap-6 p-10 w-5/7 rounded-3xl bg-white shadow-2xl">
          <h3 className="text-3xl font-semibold">Registration</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 items-center w-full">
            <div className="flex flex-col space-y-1 w-full">
              <label htmlFor="fullName" className="text-sm">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName" 
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="E.g. John Doe" 
                className="bg-olive-100 rounded-md p-2 border text-sm"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1 w-full">
              <label htmlFor="phone" className="text-sm">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="E.g. 9876543210" 
                className="bg-olive-100 rounded-md p-2 border text-sm"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1 w-full">
              <label htmlFor="email" className="text-sm">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E.g. xyz@abc.com" 
                className="bg-olive-100 rounded-md p-2 border text-sm"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1 w-full">
              <label htmlFor="coordinates" className="text-sm">Drawing Status</label>
              <input 
                type="text" 
                id="coordinates" 
                disabled 
                value={getCoordinatePlaceholder()}
                className={`rounded-md p-2 border text-sm font-medium ${geometryData ? 'bg-green-100 text-green-800 border-green-300' : 'bg-olive-100 text-gray-500'}`}
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-blue-500 text-white font-medium p-3 text-lg rounded-xl mt-4 w-2/3 hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="w-2/3 h-full relative">
        <MapComponent onShapeSelect={handleShapeCapture} />
      </div>
    </section>
  );
}