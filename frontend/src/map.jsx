import React, { useEffect, useRef, memo } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

const DrawingManagerControl = ({ onShapeComplete, initialShape }) => {
  const map = useMap();
  // Keeps a stable reference to the visible map layer across renders
  const currentOverlayRef = useRef(null); 

  useEffect(() => {
    if (!map) return;

    const drawingModule = window.google.maps?.drawing;

    if (!drawingModule) {
      console.log("Google maps Drawing library failed to load");
      return;
    }

    const drawingManager = new drawingModule.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.RECTANGLE,
          window.google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
      circleOptions: { editable: true, clickable: true },
      polygonOptions: { editable: true, clickable: true },
      rectangleOptions: { editable: true, clickable: true },
    });

    drawingManager.setMap(map);

    const syncShapeUpdate = (overlay, type) => {
      let shapeData = { type, coordinates: null };

      if (type === 'circle') {
        shapeData.coordinates = {
          center: { lat: overlay.getCenter().lat(), lng: overlay.getCenter().lng() },
          radius: overlay.getRadius(),
        };
      } else if (type === 'rectangle') {
        const bounds = overlay.getBounds();
        shapeData.coordinates = {
          northEast: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() },
          southWest: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() },
        };
      } else if (type === 'polygon') {
        const paths = overlay.getPath().getArray();
        shapeData.coordinates = paths.map((coord) => ({
          lat: coord.lat(),
          lng: coord.lng(),
        }));
      }

      onShapeComplete(shapeData);
    };

    // Draw initialShape if supplied (View/Edit mode)
    if (initialShape && initialShape.coordinates) {
      if (currentOverlayRef.current) {
        currentOverlayRef.current.setMap(null);
      }

      let overlay = null;
      const type = initialShape.type.toLowerCase();

      if (type === 'circle') {
        overlay = new window.google.maps.Circle({
          center: initialShape.coordinates.center,
          radius: initialShape.coordinates.radius,
          editable: true,
          clickable: true,
          map: map
        });
        window.google.maps.event.addListener(overlay, 'center_changed', () => syncShapeUpdate(overlay, type));
        window.google.maps.event.addListener(overlay, 'radius_changed', () => syncShapeUpdate(overlay, type));
        map.panTo(initialShape.coordinates.center);
      } else if (type === 'rectangle') {
        overlay = new window.google.maps.Rectangle({
          bounds: {
            north: initialShape.coordinates.northEast.lat,
            east: initialShape.coordinates.northEast.lng,
            south: initialShape.coordinates.southWest.lat,
            west: initialShape.coordinates.southWest.lng
          },
          editable: true,
          clickable: true,
          map: map
        });
        window.google.maps.event.addListener(overlay, 'bounds_changed', () => syncShapeUpdate(overlay, type));
        map.panTo(initialShape.coordinates.southWest);
      } else if (type === 'polygon') {
        overlay = new window.google.maps.Polygon({
          paths: initialShape.coordinates,
          editable: true,
          clickable: true,
          map: map
        });
        const path = overlay.getPath();
        window.google.maps.event.addListener(path, 'set_at', () => syncShapeUpdate(overlay, type));
        window.google.maps.event.addListener(path, 'insert_at', () => syncShapeUpdate(overlay, type));
        window.google.maps.event.addListener(path, 'remove_at', () => syncShapeUpdate(overlay, type));
        if (initialShape.coordinates[0]) {
          map.panTo(initialShape.coordinates[0]);
        }
      }

      if (overlay) {
        currentOverlayRef.current = overlay;
      }
    }
    
    // Triggered when any shape drawing operation finishes
    window.google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
      // If a shape already exists on the map surface, wipe it out immediately
      if (currentOverlayRef.current) {
        currentOverlayRef.current.setMap(null);
      }

      const { type, overlay } = event;
      
      // Save the new shape layer to our Ref so we can delete it next time
      currentOverlayRef.current = overlay;

      syncShapeUpdate(overlay, type);
    });

    return () => {
      drawingManager.setMap(null);
      if (currentOverlayRef.current) {
        currentOverlayRef.current.setMap(null);
        currentOverlayRef.current = null;
      }
    };
  }, [map, onShapeComplete, initialShape]);

  return null;
};
 
const MAPS_API_KEY = ""; // Configure Google Maps API Key here

function MapComponent({ onShapeSelect, initialShape }) {
  const isKeyMissing = !MAPS_API_KEY;

  return (
    <div className="h-full w-full relative">
      <APIProvider apiKey={MAPS_API_KEY} version="3.64" libraries={['drawing']}>
        <Map
          defaultZoom={12}
          defaultCenter={{ lat: 19.076, lng: 72.877 }}
          gestureHandling={'cooperative'}
          style={{ width: '100%', height: '100%' }}
        >
          <DrawingManagerControl onShapeComplete={onShapeSelect} initialShape={initialShape} />
        </Map>
      </APIProvider>

      {isKeyMissing && (
        <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-[999] pointer-events-auto">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5 animate-pulse">
            <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-stone-100">Google Maps API Key Missing</h4>
          <p className="text-stone-400 text-xs mt-2 max-w-sm leading-relaxed">
            Please configure a valid API key in <code className="text-amber-300 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-850 text-[10px]">map.jsx</code>. Interactive geometry tools require a Google Maps client credential to operate.
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(MapComponent);