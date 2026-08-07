// Lightweight analytics — fires-and-forgets events to the server.
// If the server is unreachable (dev without Express) it silently does nothing.

function track(type, extra = {}) {
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...extra }),
  }).catch(() => {}); // never throw — analytics should never break the app
}

// Track a page view. Call with the current path.
export function trackPageView(path) {
  track("pageview", { path });
}

// Track an option being opened.
export function trackOptionView(id, label) {
  track("option_view", { id, label });
}

// Track an option being added to the packet.
export function trackAddToPacket(id, label) {
  track("add_to_packet", { id, label });
}

// Track PDF generation.
export function trackGeneratePDF() {
  track("generate_pdf");
}

// Track a search query.
export function trackSearch(query) {
  if (query?.trim()) track("search", { label: query.trim() });
}
