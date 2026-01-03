// === LIVE LEADS FEED (Google Apps Script Web App URL) ===
const FEED_URL = "https://script.google.com/macros/s/AKfycbzkyOE39RqGKsOIq4c8tOwr0VL5G-jYDHMXPiKlmIXNyK4nZFX21HfrkOqstCHCT67YRg/exec";

// How often to refresh the preview board (milliseconds)
const REFRESH_MS = 30000;

async function loadLeads() {
  const listEl = document.getElementById("leadsList");
  const statusEl = document.getElementById("leadsStatus");

  if (!listEl) return;

  // Loading state
  if (statusEl) statusEl.textContent = "Loading new leads…";

  try {
    const res = await fetch(FEED_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Feed error: ${res.status}`);

    const leads = await res.json();

    // Clear existing
    listEl.innerHTML = "";

    if (!Array.isArray(leads) || leads.length === 0) {
      if (statusEl) statusEl.textContent = "No leads yet. Check back soon.";
      return;
    }

    if (statusEl) statusEl.textContent = `Showing ${leads.length} newest lead(s).`;

    // Render newest first (if your sheet is oldest-first, reverse it)
    const ordered = leads.slice().reverse();

    ordered.forEach((lead, idx) => {
      const card = document.createElement("div");
      card.className = "lead-card";

      const firstName = escapeHtml(lead.firstName ?? "");
      const description = escapeHtml(lead.description ?? "");
      const area = escapeHtml(lead.area ?? "");
      const date = escapeHtml(lead.date ?? "");

      card.innerHTML = `
        <div class="lead-top">
          <div class="lead-title">${firstName || "New Lead"}</div>
          <div class="lead-date">${date || ""}</div>
        </div>
        <div class="lead-row"><strong>Job:</strong> ${description || "-"}</div>
        <div class="lead-row"><strong>Area:</strong> ${area || "-"}</div>
        <div class="lead-row lead-locked">🔒 Contact info locked until purchase</div>
      `;

      listEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = "Could not load live leads right now.";
    listEl.innerHTML = `
      <div class="lead-card">
        <div class="lead-row"><strong>Feed error</strong></div>
        <div class="lead-row">If this keeps happening, we’ll adjust the Apps Script deployment permissions.</div>
      </div>
    `;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Start + auto refresh
document.addEventListener("DOMContentLoaded", () => {
  loadLeads();
  setInterval(loadLeads, REFRESH_MS);
});
