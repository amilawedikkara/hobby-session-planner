// Leaflet marker icon fix for Vite + TS
import L from "leaflet";

// These imports let Vite resolve the image URLs correctly
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// (Optional) Clear any cached URL getter from older bundlers
// @ts-expect-error - private Leaflet property in some builds
delete L.Icon.Default.prototype._getIconUrl;

// Merge proper URLs so default markers show up
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});
