import { createContext, useContext, useState, useEffect } from "react";
import { OPTIONS as STATIC_OPTIONS } from "../data/options.js";
import { RESOURCES as STATIC_RESOURCES } from "../data/resources.js";
import { OPTION_DETAILS as STATIC_DETAILS } from "../data/optionDetails.js";

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [options,       setOptions]       = useState(STATIC_OPTIONS);
  const [resources,     setResources]     = useState(STATIC_RESOURCES);
  const [optionDetails, setOptionDetails] = useState(STATIC_DETAILS);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/content/options").then((r)        => r.ok ? r.json() : null),
      fetch("/api/content/resources").then((r)      => r.ok ? r.json() : null),
      fetch("/api/content/option-details").then((r) => r.ok ? r.json() : null),
    ])
      .then(([opts, res, details]) => {
        if (opts)    setOptions(opts);
        if (res)     setResources(res);
        if (details) setOptionDetails(details);
      })
      .catch(() => { /* network error — static fallback already set */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContentContext.Provider value={{ options, resources, optionDetails, loading }}>
      {children}
    </ContentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within a ContentProvider");
  return ctx;
}
