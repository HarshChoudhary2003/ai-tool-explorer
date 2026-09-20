import { useLocation } from "react-router-dom";
import { GalleryScene } from "@/components/three/GalleryScene";

export function GalleryFrame() {
  const { pathname } = useLocation();

  return (
    <>
      <GalleryScene />
      <div className="gallery-grid" aria-hidden="true" />
      <div className="gallery-route-index" aria-hidden="true">
        {pathname === "/" ? "00" : String(pathname.split("/").filter(Boolean).length).padStart(2, "0")}
      </div>
    </>
  );
}