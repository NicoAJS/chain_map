import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { VenueLocation } from "types";

interface ChainVenuesMapProps {
  venues: VenueLocation[];
  padding?: number; 
}

const API_KEY = "AIzaSyB8gxj6UUp1NyIL3sEAFFyuN5C-CjtLGXY"; 

// Component for displaying a map with venue locations, 
// taking an array of venue locations and an optional padding value for map bounds.
function ChainVenuesMap({ venues, padding = 20 }: ChainVenuesMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const fitMapToBounds = () => {
    if (mapRef.current && venues.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      venues.forEach((venue) => {
        bounds.extend(new window.google.maps.LatLng(venue.location.lat, venue.location.lng));
      });
      mapRef.current.fitBounds(bounds, padding); 
    }
  };

// Callback function to be executed when the map loads,
// setting the current map reference and adjusting the bounds to fit the venues.
// It also adds a listener to restrict the zoom level to a maximum of 16.
  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    fitMapToBounds();

    google.maps.event.addListener(map, 'zoom_changed', function() {
      const zoom = map.getZoom();
      if (zoom !== undefined && zoom > 50) {
        map.setZoom(50);
      }
    });
  };

// Effect hook to adjust the map bounds whenever the venues change.
  useEffect(() => {
    fitMapToBounds();
  }, [venues]);

// Render the Google Map component with specified styles and initial settings.
// The map displays markers for each venue based on their latitude and longitude.
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      zoom={3}
      onLoad={onLoad}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={{ lat: venue.location.lat, lng: venue.location.lng }}
        />
      ))}
    </GoogleMap>
  );
}

export default ChainVenuesMap;
