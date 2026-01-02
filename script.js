(() => {
  const FEED_URL = window.LEADS_FEED_URL;
  const BUY_URL = "https://buy.stripe.com/14A5kCdNq2dA3p3h1KefC03";

  const leadsGrid = document.getElementById("leadsGrid");
  const statusEl = document.getElementById("status");
  const searchInput = document.getElementById("searchInput");
  const refreshBtn = document.getElementById("refreshBtn");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let allLeads = [];

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeLead(lead) {
    const firstName = (lead?.firstName ?? "").toString().trim() || "New Lead";
    const description = (lead?.description ?? "").toString().trim() || "No description provided";
    const area = (lead?.area ?? "").toString().trim() || "Area not listed";
    const date = (lead?.date ?? "").toString().trim() || "";
    return { firstName, description, area, date };
  }

  function setStatus(msg, kind = "info") {
    if (!statusEl) return;
    statusEl.textContent = msg;

    // If your CSS has variants, we keep it safe:
    statusEl.dataset.kind = kind;
  }

  function render(leads) {
    if (!leadsGrid) return;

    leadsGrid.innerHTML = "";

    if (!leads || leads.length === 0) {
      setStatus("No leads available yet. Check back soon.", "empty");
      return;
    }

    setStatus(`Showing ${leads.length} lead(s).`, "ok");

    const frag = document.createDocumentFragment();

    leads.forEach((lead) => {
      const L = normalizeLead(lead);

      // Uses your existing CSS "card" class to match the rest of your theme
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-title">${escapeHtml(L.firstName)}</div>
        <div class="card-text">${escapeHtml(L.description)}</div>
        <div class="muted small" style="margin-top:8px;">
          <strong>Area:</strong> ${escapeHtml(L.area)}${L.date ? ` • <strong>Date:</strong> ${escapeHtml(L.date)}` : ""}
        </div>
        <div style="margin-top:12px;">
          <a class="btn btn-primary" target="_blank" href="${BUY_URL}">
            Buy This Lead — $20
          </a>
        </div>
      `;

      frag.appendChild(card);
    });

    leadsGrid.appendChild(frag);
  }

  function filterAndRender() {
    const q = (searchInput?.value ?? "").toLowerCase().trim();
    if (!q) return render(allLeads);

    const filtered = allLeads.filter((l) => {
      const L = normalizeLead(l);
      return (
        L.firstName.toLowerCase().includes(q) ||
        L.description.toLowerCase().includes(q) ||
        L.area.toLowerCase().includes(q) ||
        L.date.toLowerCase().includes(q)
      );
    });

    render(filtered);
  }

  async function loadLeads() {
    if (!FEED_URL) {
      setStatus("Feed URL is missing. (window.LEADS_FEED_URL not found)", "error");
      return;
    }

    setStatus("Loading leads…", "loading");

    try {
      // cache-bust to avoid stale results
      const url = FEED_URL + (FEED_URL.includes("?") ? "&" : "?") + "t=" + Date.now();
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);

      const data = await res.json();
      allLeads = Array.isArray(data) ? data.map(normalizeLead) : [];

      filterAndRender();
    } catch (err) {
      console.error(err);
      setStatus("Could not load leads right now. Tap Refresh in a minute.", "error");
      if (leadsGrid) leadsGrid.innerHTML = "";
    }
  }

  // Wire controls
  if (refreshBtn) refreshBtn.addEventListener("click", loadLeads);
  if (searchInput) searchInput.addEventListener("input", filterAndRender);

  // Initial load
  loadLeads();
})();
