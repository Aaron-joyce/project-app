import { useEffect, useRef, memo } from "react";
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
 
const SavedOverlays = ({ drawings }) => {
  const map = useMap();
  const overlaysRef = useRef([]);

  useEffect(() => {
    if (!map || !drawings) return;

    // Clear existing overlays
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];

    // Draw new overlays
    drawings.forEach(d => {
      const type = d.shapeType.toLowerCase();
      let coords;
      try {
        coords = typeof d.geometryDataJson === 'string' ? JSON.parse(d.geometryDataJson) : d.geometryDataJson;
      } catch(e) {
        console.error("Failed to parse coordinates for drawing", d, e);
        return;
      }

      let overlay = null;
      if (type === 'circle') {
        overlay = new window.google.maps.Circle({
          center: coords.center,
          radius: coords.radius,
          editable: false,
          clickable: true,
          map: map,
          fillColor: '#618266',
          strokeColor: '#4d6951',
          fillOpacity: 0.35,
          strokeWeight: 2
        });
      } else if (type === 'rectangle') {
        overlay = new window.google.maps.Rectangle({
          bounds: {
            north: coords.northEast.lat,
            east: coords.northEast.lng,
            south: coords.southWest.lat,
            west: coords.southWest.lng
          },
          editable: false,
          clickable: true,
          map: map,
          fillColor: '#618266',
          strokeColor: '#4d6951',
          fillOpacity: 0.35,
          strokeWeight: 2
        });
      } else if (type === 'polygon') {
        overlay = new window.google.maps.Polygon({
          paths: coords,
          editable: false,
          clickable: true,
          map: map,
          fillColor: '#618266',
          strokeColor: '#4d6951',
          fillOpacity: 0.35,
          strokeWeight: 2
        });
      }

      if (overlay) {
        overlaysRef.current.push(overlay);
      }
    });

    return () => {
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [map, drawings]);

  return null;
};

const MAPS_API_KEY = ""; // Configure Google Maps API Key here

function MapComponent({ onShapeSelect, initialShape, savedDrawings }) {
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
          <SavedOverlays drawings={savedDrawings} />
        </Map>
      </APIProvider>
    </div>
  );
}

export default memo(MapComponent);