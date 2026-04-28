import { useState } from "react";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Timeline from "./pages/Timeline";
import Rankings from "./pages/Rankings";
import Currency from "./pages/Currency";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const PAGE_MAP = {
    home: <Home onNavigate={setCurrentPage} />,
    Map: <Map />,
    Timeline: <Timeline />,
    Rankings: <Rankings />,
    Currency: <Currency />,
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {PAGE_MAP[currentPage]}
    </Layout>
  );
}
