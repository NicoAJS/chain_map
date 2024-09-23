export type LatLng = { lat: number; lng: number };
export interface VenueLocation {
  id: number;
  name: string;
  link: string;
  location: LatLng;
  thumbnail: string;
}

