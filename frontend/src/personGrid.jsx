import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, themeQuartz, colorSchemeDark } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

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

const DUMMY_PERSONS = [
  { 
    id: 1, 
    fullName: "Sarah Jenkins", 
    phoneNumber: "+1 (555) 019-2834", 
    emailAddress: "sarah.j@example.com", 
    shapeType: "Circle", 
    geometryDataJson: JSON.stringify({ center: { lat: 19.082, lng: 72.881 }, radius: 1200 }) 
  },
  { 
    id: 2, 
    fullName: "Marcus Vance", 
    phoneNumber: "+1 (555) 014-9921", 
    emailAddress: "marcus.v@example.com", 
    shapeType: "Polygon", 
    geometryDataJson: JSON.stringify([{ lat: 19.076, lng: 72.877 }, { lat: 19.085, lng: 72.890 }, { lat: 19.060, lng: 72.895 }]) 
  },
  { 
    id: 3, 
    fullName: "Elena Rostova", 
    phoneNumber: "+1 (555) 017-8833", 
    emailAddress: "elena.r@example.com", 
    shapeType: "Rectangle", 
    geometryDataJson: JSON.stringify({ northEast: { lat: 19.100, lng: 72.900 }, southWest: { lat: 19.050, lng: 72.850 } }) 
  },
  { 
    id: 4, 
    fullName: "David Kim", 
    phoneNumber: "+1 (555) 012-3456", 
    emailAddress: "david.kim@example.com", 
    shapeType: "Circle", 
    geometryDataJson: JSON.stringify({ center: { lat: 19.070, lng: 72.860 }, radius: 800 }) 
  },
  { 
    id: 5, 
    fullName: "Amara Diallo", 
    phoneNumber: "+1 (555) 015-6789", 
    emailAddress: "amara.d@example.com", 
    shapeType: "Polygon", 
    geometryDataJson: JSON.stringify([{ lat: 19.090, lng: 72.870 }, { lat: 19.095, lng: 72.880 }, { lat: 19.080, lng: 72.890 }]) 
  }
];

export default function PersonGrid({ onEdit, onAddNew }) {
  const [rowData] = useState(DUMMY_PERSONS);

  // Custom action buttons renderer inside AG Grid cells
  const ActionButtonRenderer = (params) => {
    return (
      <div className="flex gap-2 items-center h-full">
        <button 
          onClick={() => onEdit(params.data)} 
          className="bg-olive-600 hover:bg-olive-500 text-stone-50 text-xs font-semibold px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-olive-500/30"
        >
          View / Edit
        </button>
      </div>
    );
  };

  const columnDefs = [
    { field: 'fullName', headerName: 'Full Name', sortable: true, filter: true, flex: 1.2, minWidth: 150 },
    { field: 'phoneNumber', headerName: 'Phone Number', sortable: true, filter: true, flex: 1, minWidth: 130 },
    { field: 'emailAddress', headerName: 'Email Address', sortable: true, filter: true, flex: 1.3, minWidth: 180 },
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
      headerName: 'Actions', 
      cellRenderer: ActionButtonRenderer, 
      width: 140, 
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
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-stone-100 via-stone-300 to-olive-400 bg-clip-text text-transparent">
            Registered Persons Directory
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Browse, search, and manage registered entities and their designated map shapes.
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="relative group overflow-hidden bg-olive-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:shadow-olive-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5 text-stone-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Person
          </span>
        </button>
      </div>

      {/* Grid Panel with glassmorphism border wrapper */}
      <div className="flex-grow w-full backdrop-blur-md rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col">
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
      </div>
    </div>
  );
}
