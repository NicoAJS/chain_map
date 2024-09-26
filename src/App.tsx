import React, { useEffect, useState } from "react";
import { useLoadScript, Libraries } from "@react-google-maps/api";
import ChainVenuesMap from './components/Chains/ChainVenuesMap';
import { VenueLocation } from "./types";


const libraries: Libraries = ["places", "geometry"];

function App() {
  const [locations, setLocations] = useState<VenueLocation[]>([]);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyB8gxj6UUp1NyIL3sEAFFyuN5C-CjtLGXY",
    libraries,
  });

  useEffect(() => {
    const list: VenueLocation[] = [];
    let i = 1;
    let venueName = getVenueValue(i, "venue_name");

    while (venueName != null) {
      const name = venueName;
      const link = getVenueValue(i, "venue_link") || null;
      const latitude = parseNumberOrNull(getVenueValue(i, "venue_latitude"));
      const longitude = parseNumberOrNull(getVenueValue(i, "venue_longitude"));
      const thumbnail = getVenueValue(i, "venue_thumbnail") || null;

      if (name && link && latitude !== null && longitude !== null && thumbnail) {
        list.push({
          id: i,
          name,
          link,
          location: { lat: latitude, lng: longitude },
          thumbnail,
        });
      }

      i++;
      venueName = getVenueValue(i, "venue_name");
    }

    setLocations(list);
  }, []);

  const parseNumberOrNull = (value: string | null) => {
    const num = value ? Number(value) : NaN;
    return Number.isNaN(num) ? null : num;
  };

  const getVenueValue = (i: number, name: string): string | null => {
    const element = document.querySelector<HTMLInputElement>(`input[name="${name}[${i}]"]`);
    return element ? element.value : null;
  };

  if (loadError) return <div>Error loading maps: {loadError.message}</div>;

  console.log(locations); // Log the locations to check their contents

  return (
    <div className="app-container">
      {isLoaded && locations.length > 0 ? (
        <ChainVenuesMap venues={locations} />

      ) : (
        <div>Loading map...</div>
      )}
    </div>
  );
  
}

export default App;
