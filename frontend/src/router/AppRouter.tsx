import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import FleetMap from "../pages/FleetMap/FleetMap";
import BusDetails from "../pages/BusDetails/BusDetails";
import About from "../pages/About/About";
import NotFound from "../pages/NotFound/NotFound";
import MyFleet from "../pages/MyFleet/MyFleet";

export default function AppRouter() {

  // Saved favourite bus IDs
  const [favoriteBuses, setFavoriteBuses] = useState<number[]>(() => {
    const saved = localStorage.getItem("favoriteBuses");

    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (busId: number) => {

    // Confirm before removing
    if (favoriteBuses.includes(busId)) {

      const confirmed = confirm(
        "Are you sure you want to remove this bus from your favourites?"
      );

      if (!confirmed) {
        return;
      }
    }

    setFavoriteBuses(prev => {

      const updated = prev.includes(busId)
        ? prev.filter(id => id !== busId)
        : [...prev, busId];

      localStorage.setItem(
        "favoriteBuses",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Map application */}
        <Route
          element={
            <MainLayout
              favoriteBuses={favoriteBuses}
              toggleFavorite={toggleFavorite}
            />
          }
        >
          <Route path="/" element={<FleetMap />} />
        </Route>

        {/* Standalone pages */}
        <Route
          path="/my-fleet"
          element={
            <MyFleet
              favoriteBuses={favoriteBuses}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route path="/bus/:id" element={<BusDetails />} />
        <Route path="/about" element={<About />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}