import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import "./NearestLocation.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiamondTurnRight } from "@fortawesome/free-solid-svg-icons";
import CustomMarker from "./CustomMarker ";
import SearchBar from "./search/SearchBar";
import { VenueLocation, LatLng } from "../types";

const isMobile = () => window.innerWidth <= 768;
const denmarkLatLng: LatLng = { lat: 55.676098, lng: 12.568337 };

interface NearestLocationProps {
  locations: VenueLocation[];
}

function NearestLocation({ locations }: NearestLocationProps) {
  const [openInfoWindow, setOpenInfoWindow] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<VenueLocation | null>(null);
  const [zoomLevel, setZoomLevel] = useState(10);
  const [position, setPosition] = useState(denmarkLatLng);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  //Finds the nearest location to the user's position.
  function getNearestVenue(userPosition: LatLng) {
    if (locations.length === 0) return null;

    const userLatLng = new window.google.maps.LatLng(userPosition.lat, userPosition.lng);
    const distances = locations.map((location) => {
      const venuePosition = new window.google.maps.LatLng(location.location.lat, location.location.lng);

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(userLatLng, venuePosition);
      return { ...location, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0];
  }

  //Adjusts the map bounds to include both the user position and the nearest location.
  const viewNearestLocationAndUserPosition = (userPosition: LatLng) => {
    if (mapRef.current == null) {
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(new window.google.maps.LatLng(userPosition.lat, userPosition.lng));

    const nearestVenue = getNearestVenue(userPosition);
    if (nearestVenue) {
      bounds.extend(new window.google.maps.LatLng(nearestVenue.location.lat, nearestVenue.location.lng));
    }
    mapRef.current.fitBounds(bounds, 50);
  };

  const getDirectionsLink = (): string | undefined => {
    if (selectedLocation && userPosition) {
      const { lat: userLat, lng: userLng } = userPosition;

      const destLat = selectedLocation.location.lat;
      const destLng = selectedLocation.location.lng;

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}`;
      const appleMapsUrl = `http://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${destLat},${destLng}`;

      const isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      return isMobile() && isAppleDevice ? appleMapsUrl : googleMapsUrl;
    } else if (selectedLocation) {
      const destLat = selectedLocation.location.lat;
      const destLng = selectedLocation.location.lng;

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
      const isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      return isMobile() && isAppleDevice
        ? `http://maps.apple.com/?saddr=${destLat},${destLng}&daddr=${destLat},${destLng}`
        : googleMapsUrl;
    }
  };

  const handleMarkerClick = (e: React.MouseEvent, location: VenueLocation) => {
    e.stopPropagation();
    setSelectedLocation(location);
    setOpenInfoWindow(true);
  };

  const handleMapClick = useCallback(() => {
    setOpenInfoWindow(false);
  }, []);

  const handleDirectionsClick = () => {
    const url = getDirectionsLink();
    window.open(url);
  };

  //Adjusts the zoom level based on the device type and updates it when the window is resized.
  useEffect(() => {
    const updateZoomLevel = () => {
      setZoomLevel(isMobile() ? 13 : 15);
    };
    window.addEventListener("resize", updateZoomLevel);
    updateZoomLevel();

    return () => window.removeEventListener("resize", updateZoomLevel);
  }, []);

  //Centers the map around the user location and adjust the map bounds to include the nearest location.
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserPosition(currentPosition);
        viewNearestLocationAndUserPosition(currentPosition);
      });
    }
  }, []);

  // function to handle place changes from SearchBar
  const handlePlaceChange = (place: google.maps.places.PlaceResult | null) => {
    if (place && place.geometry && place.geometry.location) {
      const { location } = place.geometry;
      setPosition({
        lat: location.lat(),
        lng: location.lng(),  
      });
      setZoomLevel(10);
      setSelectedLocation(null);
    } else if (userPosition) {
      setZoomLevel(10);
      viewNearestLocationAndUserPosition(userPosition);
    } else {
      console.error("User position is not available");
    }
  };

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  return (
    <>
      <SearchBar onPlaceChange={handlePlaceChange} />

      <div className="map-page">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          zoom={zoomLevel}
          center={position}
          options={{ streetViewControl: false, mapTypeControl: false }}
          onLoad={onLoad}
          onClick={handleMapClick}
          clickableIcons={false}
        >
          //blue dot :
          {userPosition && (
            <Marker
              position={userPosition}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeWeight: 8,
                strokeColor: "#e7f2fd",
                strokeOpacity: 0.6,
              }}
            />
          )}
          {locations.map((location) => (
            <CustomMarker
              key={location.id}
              position={{
                lat: location.location.lat,
                lng: location.location.lng,
              }}
              onClick={(e) => handleMarkerClick(e, location)}
            />
          ))}
          {openInfoWindow && selectedLocation && (
            <InfoWindow
              position={{
                lat: selectedLocation.location.lat,
                lng: selectedLocation.location.lng,
              }}
              onCloseClick={() => setOpenInfoWindow(false)}
            >
              <div className="venue-div">
                <div>
                  <a className="venueName" href={selectedLocation.link}>
                    {selectedLocation.name}
                  </a>
                </div>

                <div>
                  <a href={selectedLocation.link}>
                    <img src={selectedLocation.thumbnail} alt="venueThumbnail" />
                  </a>
                </div>

                <div className="direction-container">
                  <button onClick={handleDirectionsClick}>
                    <FontAwesomeIcon icon={faDiamondTurnRight} className="direction-icon" />
                    Directions
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </>
  );
}

export default NearestLocation;
