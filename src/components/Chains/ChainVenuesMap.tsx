import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { VenueLocation } from "types"; // Ensure this path is correct

interface ChainVenuesMapProps {
  venues: VenueLocation[]; // Keep the venues prop here
  padding?: number; 
}

const API_KEY = "AIzaSyB8gxj6UUp1NyIL3sEAFFyuN5C-CjtLGXY"; 

const ChainVenuesMap: React.FC<ChainVenuesMapProps> = ({ venues, padding = 20 }) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fitMapToBounds = () => {
    if (mapRef.current && venues.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      venues.forEach((venue) => {
        if (venue.location.lat && venue.location.lng) {
          bounds.extend(new window.google.maps.LatLng(venue.location.lat, venue.location.lng));
        }
      });

      const paddingObj = {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      };

      mapRef.current.fitBounds(bounds, paddingObj); 
    }
  };

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    fitMapToBounds();

    google.maps.event.addListener(map, 'zoom_changed', () => {
      const zoom = map.getZoom();
      if (zoom !== undefined && zoom > 50) {
        map.setZoom(50);
      }
    });
  };

  useEffect(() => {
    if (mapRef.current) {
      fitMapToBounds();
    }
  }, [venues]);

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
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
