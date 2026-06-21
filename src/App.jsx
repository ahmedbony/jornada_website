import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import BrowseOptions from "./pages/BrowseOptions.jsx";
import ToolsResources from "./pages/ToolsResources.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse-options" element={<BrowseOptions />} />
        <Route path="tools-resources" element={<ToolsResources />} />
      </Route>
    </Routes>
  );
}
