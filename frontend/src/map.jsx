import React, { useEffect, useRef, memo } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

const DrawingManagerControl = ({ onShapeComplete }) => {
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
    
    // Triggered when any shape drawing operation finishes
    window.google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {
      // FIX: If a shape already exists on the map surface, wipe it out immediately
      if (currentOverlayRef.current) {
        currentOverlayRef.current.setMap(null);
      }

      const { type, overlay } = event;
      
      // Save the new shape layer to our Ref so we can delete it next time
      currentOverlayRef.current = overlay;

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

      // Sync coordinate state to the main Registration form
      onShapeComplete(shapeData);
    });

    return () => {
      drawingManager.setMap(null);
      if (currentOverlayRef.current) {
        currentOverlayRef.current.setMap(null);
        currentOverlayRef.current = null;
      }
    };
  }, [map, onShapeComplete]);

  return null;
};

function MapComponent({ onShapeSelect }) {
  return (
    <div className="h-dvh w-full">
      <APIProvider apiKey={""} version="3.64" libraries={['drawing']}>
        <Map
          defaultZoom={12}
          defaultCenter={{ lat: 19.076, lng: 72.877 }}
          gestureHandling={'cooperative'}
          style={{ width: '100%', height: '100%' }}
        >
          <DrawingManagerControl onShapeComplete={onShapeSelect} />
        </Map>
      </APIProvider>
    </div>
  );
}

export default memo(MapComponent);