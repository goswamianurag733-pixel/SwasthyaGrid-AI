let dashboardData = null;

const $ = id => document.getElementById(id);

function riskClass(value) {
  return String(value).toLowerCase().replace(" ", "-");
}

function renderMetrics(m) {
  $("metrics").innerHTML = `
    <div class="metric"><div class="label">PHC Facilities</div><div class="value">${m.facilities}</div><div class="hint">Connected demo facilities</div></div>
    <div class="metric"><div class="label">Bed Availability</div><div class="value">${m.beds_available}/${m.beds_total}</div><div class="hint">${m.occupancy_pct}% occupancy</div></div>
    <div class="metric"><div class="label">Staff Attendance</div><div class="value">${m.staff_pct}%</div><div class="hint">${m.staff_present}/${m.staff_total} present</div></div>
    <div class="metric"><div class="label">Active Alerts</div><div class="value">${m.active_alerts}</div><div class="hint">Requires monitoring</div></div>`;
}

function renderFacilities(list) {
  $("facilityCount").textContent = `${list.length} shown`;
  $("facilityTable").innerHTML = list.map(f => `
    <tr>
      <td><strong>${f.name}</strong><br><small>${f.district}</small></td>
      <td>${f.state}</td>
      <td>${f.beds_available} / ${f.beds_total}</td>
      <td>${f.staff_present} / ${f.staff_total}</td>
      <td><span class="status ${riskClass(f.status)}">${f.status}</span></td>
    </tr>`).join("");
}

function renderResources(list) {
  const medicine = $("medicineFilter").value.toLowerCase();
  const filtered = list.filter(r => !medicine || r.medicine.toLowerCase() === medicine);
  $("resourceTable").innerHTML = filtered.map(r => {
    const days = r.current_stock / Math.max(r.daily_consumption, .1);
    let risk = days <= 3 ? "CRITICAL" : days <= 5 ? "HIGH" : days <= 7 ? "WATCH" : "LOW";
    return `<tr>
      <td><strong>${r.medicine}</strong></td><td>${r.facility_name}</td>
      <td>${r.current_stock.toLocaleString()}</td><td>${days.toFixed(1)}</td>
      <td><span class="risk ${riskClass(risk)}">${risk}</span></td>
    </tr>`;
  }).join("");
}

function renderAlerts(list) {
  const active = list.filter(a => a.status === "ACTIVE");
  $("alertCount").textContent = `${active.length} active`;
  $("alerts").innerHTML = list.map(a => `
    <div class="alert">
      <div class="alert-title">
        <span>${a.resource} · ${a.facility}</span>
        <span class="risk ${riskClass(a.severity)}">${a.severity}</span>
      </div>
      <p>${a.message}</p>
      <p>${a.district}, ${a.state}</p>
    </div>`).join("");
}

async function loadForecast() {
  const medicine = $("medicineFilter").value || "ORS";
  $("forecastTitle").textContent = medicine;
  const response = await fetch(`/api/forecast?medicine=${encodeURIComponent(medicine)}`);
  const rows = await response.json();
  if (!rows.length) {
    $("forecastChart").innerHTML = "<p>No forecast data available.</p>";
    return;
  }
  const values = rows[0].forecast;
  const max = Math.max(...values.map(x => x.predicted), 1);
  $("forecastChart").innerHTML = values.map(x => `
    <div class="bar-wrap">
      <div class="bar-value">${x.predicted}</div>
      <div class="bar" style="height:${Math.max(4, x.predicted / max * 78)}%"></div>
      <div class="bar-label">D${x.day}</div>
    </div>`).join("");
}

async function loadPlan() {
  const medicine = $("medicineFilter").value;
  const response = await fetch(`/api/redistribution${medicine ? "?medicine=" + encodeURIComponent(medicine) : ""}`);
  const plan = await response.json();
  $("planTable").innerHTML = plan.length ? plan.map(x => `
    <tr><td>${x.medicine}</td><td>${x.from}</td><td>${x.to}</td><td><strong>${x.quantity}</strong></td>
    <td><span class="risk ${riskClass(x.priority)}">${x.priority}</span></td></tr>`).join("") :
    `<tr><td colspan="5">No redistribution action is currently required for the selected filter.</td></tr>`;
}

async function loadDashboard() {
  const response = await fetch("/api/dashboard");
  dashboardData = await response.json();

  renderMetrics(dashboardData.metrics);

  const stateFilter = $("stateFilter");
  const states = dashboardData.states;
  stateFilter.innerHTML = `<option value="">All States</option>` + states.map(s => `<option>${s}</option>`).join("");

  applyFilters();
  renderAlerts(dashboardData.alerts);
  await loadForecast();
  await loadPlan();
}

function applyFilters() {
  if (!dashboardData) return;
  const state = $("stateFilter").value;
  const facilities = dashboardData.facilities.filter(f => !state || f.state === state);
  renderFacilities(facilities);
  renderResources(dashboardData.resources.filter(r => !state || facilities.some(f => f.id === r.facility_id)));
}

$("stateFilter").addEventListener("change", applyFilters);
$("medicineFilter").addEventListener("change", async () => {
  applyFilters();
  await loadForecast();
  await loadPlan();
});
$("refreshPlan").addEventListener("click", loadPlan);

$("trainBtn").addEventListener("click", async () => {
  $("federatedResult").textContent = "Training and aggregating local state updates...";
  const response = await fetch("/api/federated/train", { method:"POST", headers:{"Content-Type":"application/json"}, body:"{}" });
  const result = await response.json();
  $("federatedResult").innerHTML =
    `<strong>FedAvg complete.</strong><br>
     Participating nodes: ${result.participating_states.join(", ")}<br>
     Aggregated global weights: [${result.global_weights.join(", ")}]<br>
     <small>${result.note}</small>`;
});

loadDashboard();
