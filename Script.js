(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    data.urgent = !!data.urgent;
    data.timestamp = new Date().toISOString();
    data.source_url = "https://superhuman7142-cmd.github.io/junk-removal-site/";

    // Save locally (basic safety so nothing is "lost" client-side)
    try {
      localStorage.setItem("jr_last_lead", JSON.stringify(data));
    } catch {}

    // Redirect to thank-you page
    window.location.href = "thankyou.html";
  });
})();
