import { Routes, Route } from "react-router-dom";
import { PacketProvider } from "./context/PacketContext.jsx";
import { ContentProvider } from "./context/ContentContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import BrowseOptions from "./pages/BrowseOptions.jsx";
import ToolsResources from "./pages/ToolsResources.jsx";
import GuidedExplorer from "./pages/GuidedExplorer.jsx";
import AdaptationPacket from "./pages/AdaptationPacket.jsx";
import OptionPage from "./pages/OptionPage.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <ContentProvider>
      <PacketProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="browse-options" element={<BrowseOptions />} />
            <Route path="tools-resources" element={<ToolsResources />} />
            <Route path="guided-explorer" element={<GuidedExplorer />} />
            <Route path="packet" element={<AdaptationPacket />} />
            <Route path="options/:id" element={<OptionPage />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </PacketProvider>
    </ContentProvider>
  );
}
