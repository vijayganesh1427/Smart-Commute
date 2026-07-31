import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import FleetMap from "../pages/FleetMap/FleetMap";
import BusDetails from "../pages/BusDetails/BusDetails";
import About from "../pages/About/About";
import NotFound from "../pages/NotFound/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<FleetMap />} />
          <Route path="/bus/:id" element={<BusDetails />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}