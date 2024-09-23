import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Autocomplete } from "@react-google-maps/api";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import "./SearchBar.css";

interface searchBoxProps {
  onPlaceChange: (place: google.maps.places.PlaceResult | null) => void;
}

const SearchBar: React.FC<searchBoxProps> = ({ onPlaceChange }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [searchText, setSearchText] = useState("");

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        onPlaceChange(place);
        setSearchText(place.formatted_address || "");
      } else {
        console.error("No geometry found for the place.");
      }
    }
  };

  //reset the map view and search inputs, ensuring a clean state for new searches.
  const clearHandler = () => {
    onPlaceChange(null);
    setSearchText("");
  };

  const onLoadSearch = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  return (
    <>
      <div className="search-map">
        <div className="input-container">
          <Autocomplete onLoad={onLoadSearch} onPlaceChanged={handlePlaceChanged}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by country, Address, Zip code"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Autocomplete>

          <button onClick={clearHandler} className="clear-btn">
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
