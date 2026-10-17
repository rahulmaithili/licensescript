/* ==========================================================================
   LICENSEVAULT ERP EXECUTIVE DASHBOARD - MODULAR ADMIN LOGIC
   Dedicated Backend Logic for Software Licensing SaaS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAdminDashboard();
});

let allLicensesList = [];

function initAdminDashboard() {
  initSidebarToggle();
  initTabNavigation();
  initDashboardCharts();
  loadAdminData();
  initKeyGenerator();
  initLicenseSearchAndFilter();
  initCompanyProfile();
  initThemeToggle();
  initSignOut();
}

// 1. Sidebar Collapse / Expand & Mobile Open/Close
function initSidebarToggle() {
  const root = document.getElementById("admin-app-root");
  const sidebar = document.getElementById("admin-sidebar");
  const toggleBtn = document.getElementById("btn-admin-toggle-sidebar");
  const closeBtn = document.getElementById("btn-admin-sidebar-close");

  function toggleSidebar() {
    if (window.innerWidth <= 992) {
      if (sidebar) sidebar.classList.toggle("open");
    } else {
      if (root) root.classList.toggle("admin-sidebar-collapsed");
    }
  }

  function closeSidebar() {
    if (window.innerWidth <= 992) {
      if (sidebar) sidebar.classList.remove("open");
    } else {
      if (root) root.classList.add("admin-sidebar-collapsed");
    }
  }

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  window.openAdminSidebar = () => {
    if (window.innerWidth <= 992) {
      if (sidebar) sidebar.classList.add("open");
    } else {
      if (root) root.classList.remove("admin-sidebar-collapsed");
    }
  };
  window.closeAdminSidebar = closeSidebar;
  window.toggleAdminSidebar = toggleSidebar;
}

// 2. Tab Navigation System
function initTabNavigation() {
  const navItems = document.querySelectorAll(".admin-nav-item[data-tab]");
  const tabPanes = document.querySelectorAll(".admin-tab-pane");
  const pageTitle = document.getElementById("admin-page-title");
  const sidebar = document.getElementById("admin-sidebar");

  function switchTab(targetTabId, itemText) {
    navItems.forEach(item => {
      if (item.getAttribute("data-tab") === targetTabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === targetTabId) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });

    if (pageTitle && itemText) {
      pageTitle.textContent = itemText;
    }

    if (window.innerWidth <= 992 && sidebar) {
      sidebar.classList.remove("open");
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTabId = item.getAttribute("data-tab");
      const text = item.querySelector("span:last-child")?.textContent || "Dashboard";
      switchTab(targetTabId, text);
    });
  });

  // Handle shortcut jump links (data-goto-tab)
  document.querySelectorAll("[data-goto-tab]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute("data-goto-tab");
      const matchingNavItem = document.querySelector(`.admin-nav-item[data-tab="${targetTab}"]`);
      const text = matchingNavItem ? matchingNavItem.querySelector("span:last-child")?.textContent : "Workspace";
      switchTab(targetTab, text);
    });
  });
}

// 3. Render Executive Dashboard Charts (Software Licensing Metrics)
function initDashboardCharts() {
  // Chart 1: Financial & License Overview (Multi-line chart)
  const lineCtx = document.getElementById("overviewLineChart")?.getContext("2d");
  if (lineCtx) {
    const days = Array.from({ length: 31 }, (_, i) => (i + 1 < 10 ? "0" + (i + 1) : "" + (i + 1)));
    
    const revenueTrend = [12000, 14500, 18000, 16000, 22000, 24500, 29000, 31000, 28000, 26000, 34000, 38000, 42000, 39000, 45000, 49000, 52000, 48000, 51000, 56000, 60000, 58000, 64000, 69000, 72000, 75000, 71000, 78000, 82000, 86000, 92000];
    const validationsTrend = [350, 420, 390, 480, 510, 560, 620, 590, 640, 700, 750, 720, 810, 850, 890, 920, 960, 910, 980, 1020, 1080, 1040, 1120, 1160, 1200, 1250, 1220, 1300, 1350, 1400, 1450];
    const revokedTrend = [1, 0, 2, 1, 0, 1, 3, 1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 0, 1];

    new Chart(lineCtx, {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: "Total Revenue (₹)",
            data: revenueTrend,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.06)",
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: "Validations Count",
            data: validationsTrend.map(v => v * 60),
            borderColor: "#06b6d4",
            backgroundColor: "transparent",
            tension: 0.4,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: "Revoked / Expired",
            data: revokedTrend.map(v => v * 10000),
            borderColor: "#ef4444",
            backgroundColor: "transparent",
            tension: 0.4,
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.03)" },
            ticks: { color: "#64748b", font: { size: 9 }, maxTicksLimit: 16 }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.03)" },
            ticks: { color: "#64748b", font: { size: 9 }, callback: val => "₹" + (val / 1000) + "k" }
          }
        }
      }
    });
  }

  // Chart 2: Revenue by Software Product (Bar Chart)
  const barCtx = document.getElementById("incomeExpenseBarChart")?.getContext("2d");
  if (barCtx) {
    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        datasets: [
          {
            label: "CDCMS Suite Pro",
            data: [12000, 16500, 22000, 31000, 42000, 48500],
            backgroundColor: "#10b981",
            borderRadius: 4
          },
          {
            label: "CDC Tools Multi",
            data: [8000, 11000, 15000, 24000, 32000, 38000],
            backgroundColor: "#3b82f6",
            borderRadius: 4
          },
          {
            label: "Master Bundle",
            data: [14000, 19000, 26000, 38000, 51000, 59000],
            backgroundColor: "#f59e0b",
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#64748b", font: { size: 9 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.03)" },
            ticks: { color: "#64748b", font: { size: 9 }, callback: val => "₹" + (val / 1000) + "k" }
          }
        }
      }
    });
  }

  // Chart 3: Top Software Categories (Donut Chart)
  const donutCtx = document.getElementById("expenseDonutChart")?.getContext("2d");
  if (donutCtx) {
    new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["CDCMS Pro Suite", "CDC Tools Multi", "Master Bundle", "Custom APIs"],
        datasets: [{
          data: [42, 28, 22, 8],
          backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 8,
              color: "#94a3b8",
              font: { size: 10 }
            }
          }
        },
        cutout: "70%"
      }
    });
  }
}

// 4. Load Data from Supabase with Real-Time Sync & Local Fallback
async function loadAdminData() {
  try {
    if (window.supabaseClient) {
      const { data: licenses, error } = await window.supabaseClient
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && licenses && licenses.length > 0) {
        allLicensesList = licenses;
        renderLicensesTable(licenses);
        updateLiveStats(licenses);
        return;
      }
    }
  } catch (err) {
    console.warn("Supabase fetch fallback to local cache:", err);
  }

  // Default software licenses mock
  allLicensesList = [
    {
      id: "lic-1",
      license_key: "CDCMS-8891-PROX-2026",
      client_name: "Rahul Maithili",
      client_email: "rahul@maithili.com",
      product_name: "CDCMS Multi-Tool Suite",
      device_id: "HWID-WIN-8931A-F492",
      expiry_date: "2027-10-30",
      status: "Active"
    },
    {
      id: "lic-2",
      license_key: "CDCT-4512-VALD-2026",
      client_name: "Aman Sharma",
      client_email: "aman.sharma@gmail.com",
      product_name: "CDC Tools Multi Extension",
      device_id: "HWID-MAC-4192B-9912",
      expiry_date: "2026-12-15",
      status: "Active"
    },
    {
      id: "lic-3",
      license_key: "AIOM-9921-UNLM-2026",
      client_name: "Vikas Patel",
      client_email: "vikas.patel@techcorp.in",
      product_name: "All-in-One Master Bundle",
      device_id: "HWID-WIN-1029C-3381",
      expiry_date: "2026-11-01",
      status: "Active"
    },
    {
      id: "lic-4",
      license_key: "CDCMS-1044-TRIAL-2026",
      client_name: "Pooja Verma",
      client_email: "pooja.v@digitalagency.com",
      product_name: "CDCMS Multi-Tool Suite",
      device_id: "HWID-WIN-5512D-8821",
      expiry_date: "2026-10-22",
      status: "Expiring"
    }
  ];

  renderLicensesTable(allLicensesList);
  renderUsersTable();
  renderInvoicesTable();
}

function renderLicensesTable(licenses) {
  const tbody = document.getElementById("admin-licenses-tbody");
  if (!tbody) return;

  if (licenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">No software licenses found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = licenses.map(item => {
    const isBlocked = item.status === "Blocked";
    const statusColor = isBlocked ? "#ef4444" : (item.status === "Expiring" ? "#f59e0b" : "#10b981");
    const statusBg = isBlocked ? "rgba(239, 68, 68, 0.15)" : (item.status === "Expiring" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)");

    return `
      <tr>
        <td><strong style="color: #f59e0b; font-family: monospace; font-size: 13px;">${item.license_key}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${item.client_name || 'Client'}</div>
          <div style="font-size: 11px; color: #94a3b8;">${item.client_email || ''}</div>
        </td>
        <td><strong>${item.product_name || 'CDCMS Tool'}</strong></td>
        <td>
          <span style="background: ${statusBg}; color: ${statusColor}; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">
            ${item.status || 'Active'}
          </span>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 11px; color: #94a3b8;">${item.device_id || 'Not Bound Yet'}</span>
        </td>
        <td>
          <input type="date" value="${item.expiry_date || '2026-12-31'}" onchange="updateLicenseExpiry('${item.license_key}', this.value)" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; padding: 3px 6px; font-size: 11px;">
        </td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button onclick="copyText('${item.license_key}')" style="padding: 4px 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; cursor: pointer; font-size: 11px;" title="Copy License Key">Copy</button>
            <button onclick="resetHardwareID('${item.license_key}')" style="padding: 4px 8px; background: rgba(59,130,246,0.15); border: 1px solid #3b82f6; color: #60a5fa; border-radius: 6px; cursor: pointer; font-size: 11px;" title="Unlock Machine HWID">Reset HWID</button>
            <button onclick="toggleBlockLicense('${item.license_key}', ${!isBlocked})" style="padding: 4px 8px; background: ${isBlocked ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border: 1px solid ${isBlocked ? '#10b981' : '#ef4444'}; color: ${isBlocked ? '#10b981' : '#f87171'}; border-radius: 6px; cursor: pointer; font-size: 11px;">
              ${isBlocked ? 'Unblock' : 'Block'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function initLicenseSearchAndFilter() {
  const searchInput = document.getElementById("license-search-input");
  const filterSelect = document.getElementById("license-filter-product");

  function filterData() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const prod = filterSelect?.value || "all";

    const filtered = allLicensesList.filter(item => {
      const matchQ = (item.license_key || "").toLowerCase().includes(q) ||
                     (item.client_name || "").toLowerCase().includes(q) ||
                     (item.client_email || "").toLowerCase().includes(q) ||
                     (item.device_id || "").toLowerCase().includes(q);

      const matchProd = prod === "all" || (item.product_name || "").includes(prod);
      return matchQ && matchProd;
    });

    renderLicensesTable(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", filterData);
  if (filterSelect) filterSelect.addEventListener("change", filterData);
}

function renderUsersTable() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td>#USR-101</td>
      <td><strong>Rahul Maithili</strong></td>
      <td>rahul@maithili.com</td>
      <td><span style="color:#10b981;font-weight:700;">1 Active License</span></td>
      <td>Today, 03:15 PM</td>
      <td><span style="color: #10b981; font-weight: 700;">● Verified Client</span></td>
    </tr>
    <tr>
      <td>#USR-102</td>
      <td><strong>Aman Sharma</strong></td>
      <td>aman.sharma@gmail.com</td>
      <td><span style="color:#10b981;font-weight:700;">1 Active License</span></td>
      <td>Yesterday</td>
      <td><span style="color: #10b981; font-weight: 700;">● Verified Client</span></td>
    </tr>
    <tr>
      <td>#USR-103</td>
      <td><strong>Vikas Patel</strong></td>
      <td>vikas.patel@techcorp.in</td>
      <td><span style="color:#f59e0b;font-weight:700;">1 Master Key</span></td>
      <td>14 Oct 2026</td>
      <td><span style="color: #10b981; font-weight: 700;">● Verified Client</span></td>
    </tr>
  `;
}

function renderInvoicesTable() {
  const tbody = document.getElementById("admin-invoices-tbody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td><strong>#INV-2026-001</strong></td>
      <td>Rahul Maithili</td>
      <td>CDCMS Suite Pro (1-Month)</td>
      <td><strong>₹999.00</strong></td>
      <td>16 Oct 2026</td>
      <td><span style="color: #10b981; font-weight: 700;">● Paid (Razorpay)</span></td>
      <td><button onclick="window.print()" class="admin-card-link" style="background:none;border:none;">Print PDF &darr;</button></td>
    </tr>
    <tr>
      <td><strong>#INV-2026-002</strong></td>
      <td>Aman Sharma</td>
      <td>CDC Tools Multi (Quarterly)</td>
      <td><strong>₹1,499.00</strong></td>
      <td>15 Oct 2026</td>
      <td><span style="color: #10b981; font-weight: 700;">● Paid (Razorpay)</span></td>
      <td><button onclick="window.print()" class="admin-card-link" style="background:none;border:none;">Print PDF &darr;</button></td>
    </tr>
    <tr>
      <td><strong>#INV-2026-003</strong></td>
      <td>Vikas Patel</td>
      <td>Master Bundle (Annual VIP)</td>
      <td><strong>₹4,999.00</strong></td>
      <td>14 Oct 2026</td>
      <td><span style="color: #10b981; font-weight: 700;">● Paid (UPI Direct)</span></td>
      <td><button onclick="window.print()" class="admin-card-link" style="background:none;border:none;">Print PDF &darr;</button></td>
    </tr>
  `;
}

function updateLiveStats(licenses) {
  const activeCountEl = document.getElementById("stat-active-licenses");
  if (activeCountEl && licenses) {
    activeCountEl.textContent = licenses.length.toLocaleString();
  }
}

// 5. Instant Key Generator Form
function initKeyGenerator() {
  const form = document.getElementById("admin-key-gen-form");
  const resultBox = document.getElementById("gen-key-result");
  const display = document.getElementById("gen-key-display");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const product = document.getElementById("gen-product-select")?.value || "cdcms_pro";
    const clientName = document.getElementById("gen-client-name")?.value || "Client";
    const clientEmail = document.getElementById("gen-client-email")?.value || "client@gmail.com";
    const days = parseInt(document.getElementById("gen-client-days")?.value) || 30;

    const prefix = product === "all_in_one" ? "AIOM" : (product === "cdc_tools" ? "CDCT" : "CDCMS");
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const newKey = `${prefix}-${randPart}-GENX-2026`;
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const newLicense = {
      license_key: newKey,
      client_name: clientName,
      client_email: clientEmail,
      product_name: product === "all_in_one" ? "All-in-One Master" : (product === "cdc_tools" ? "CDC Tools Multi" : "CDCMS Pro Suite"),
      device_id: null,
      expiry_date: expiryDate,
      status: "Active"
    };

    // Save to Supabase if connected
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from("licenses").insert([newLicense]);
      } catch (err) {
        console.warn("Supabase insert:", err);
      }
    }

    allLicensesList.unshift(newLicense);
    renderLicensesTable(allLicensesList);

    if (resultBox && display) {
      display.textContent = newKey;
      resultBox.style.display = "block";
    }

    showToast(`Key generated & saved: ${newKey}`, "success");
  });
}

window.copyGeneratedKey = function() {
  const key = document.getElementById("gen-key-display")?.textContent;
  if (key) copyText(key);
};

// 6. License Row Actions (Reset HWID, Block/Unblock, Expiry)
window.resetHardwareID = function(key) {
  const item = allLicensesList.find(l => l.license_key === key);
  if (item) {
    item.device_id = null;
    renderLicensesTable(allLicensesList);
    showToast(`Hardware ID cleared for ${key}. Client can now activate on a new machine.`, "info");
  }
};

window.toggleBlockLicense = function(key, block) {
  const item = allLicensesList.find(l => l.license_key === key);
  if (item) {
    item.status = block ? "Blocked" : "Active";
    renderLicensesTable(allLicensesList);
    showToast(`License ${key} status changed to ${item.status}.`, block ? "error" : "success");
  }
};

window.updateLicenseExpiry = function(key, newDate) {
  const item = allLicensesList.find(l => l.license_key === key);
  if (item) {
    item.expiry_date = newDate;
    showToast(`Updated expiry date for ${key} to ${newDate}`, "success");
  }
};

// 7. Theme Toggle
function initThemeToggle() {
  const btn = document.getElementById("btn-theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");
      localStorage.setItem("admin_theme", isLight ? "light" : "dark");
    });
  }

  if (localStorage.getItem("admin_theme") === "light") {
    document.body.classList.add("light-mode");
  }
}

// 8. Sign Out
function initSignOut() {
  const btn = document.getElementById("btn-admin-signout");
  if (btn) {
    btn.addEventListener("click", () => {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_auth");
      showToast("Signed out from admin console", "info");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    });
  }
}

// Global Helpers
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copied to clipboard: " + text, "success");
  });
};

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


// 9. Company Profile Fill Function & Live Invoice Preview
function initCompanyProfile() {
  const form = document.getElementById("form-company-profile");
  if (!form) return;

  const legalNameInput = document.getElementById("cp-legal-name");
  const brandNameInput = document.getElementById("cp-brand-name");
  const taglineInput = document.getElementById("cp-tagline");
  const addressInput = document.getElementById("cp-address");
  const emailInput = document.getElementById("cp-email");
  const phoneInput = document.getElementById("cp-phone");
  const gstinInput = document.getElementById("cp-gstin");
  const invPrefixInput = document.getElementById("cp-inv-prefix");
  const bankNameInput = document.getElementById("cp-bank-name");
  const bankAccInput = document.getElementById("cp-bank-acc");
  const bankIfscInput = document.getElementById("cp-bank-ifsc");
  const upiInput = document.getElementById("cp-upi-id");
  const signatoryInput = document.getElementById("cp-signatory");

  // Preview elements
  const prevName = document.getElementById("prev-cp-name");
  const prevTagline = document.getElementById("prev-cp-tagline");
  const prevAddress = document.getElementById("prev-cp-address");
  const prevGstin = document.getElementById("prev-cp-gstin");
  const prevInvNum = document.getElementById("prev-inv-num");
  const prevUpi = document.getElementById("prev-cp-upi");
  const prevSignatory = document.getElementById("prev-cp-signatory");

  function updatePreview() {
    if (prevName && legalNameInput) prevName.textContent = legalNameInput.value || "Your Company";
    if (prevTagline && taglineInput) prevTagline.textContent = taglineInput.value || "";
    if (prevAddress && addressInput) prevAddress.textContent = addressInput.value || "";
    if (prevGstin && gstinInput) prevGstin.textContent = gstinInput.value || "N/A";
    if (prevInvNum && invPrefixInput) prevInvNum.textContent = (invPrefixInput.value || "INV-") + "001";
    if (prevUpi && upiInput) prevUpi.textContent = upiInput.value || "";
    if (prevSignatory && signatoryInput) prevSignatory.textContent = signatoryInput.value || "";
  }

  // Live input binding
  [legalNameInput, brandNameInput, taglineInput, addressInput, emailInput, phoneInput, gstinInput, invPrefixInput, bankNameInput, bankAccInput, bankIfscInput, upiInput, signatoryInput].forEach(inp => {
    if (inp) inp.addEventListener("input", updatePreview);
  });

  // Load saved profile
  const savedProfileStr = localStorage.getItem("company_profile");
  if (savedProfileStr) {
    try {
      const p = JSON.parse(savedProfileStr);
      if (legalNameInput && p.legalName) legalNameInput.value = p.legalName;
      if (brandNameInput && p.brandName) brandNameInput.value = p.brandName;
      if (taglineInput && p.tagline) taglineInput.value = p.tagline;
      if (addressInput && p.address) addressInput.value = p.address;
      if (emailInput && p.email) emailInput.value = p.email;
      if (phoneInput && p.phone) phoneInput.value = p.phone;
      if (gstinInput && p.gstin) gstinInput.value = p.gstin;
      if (invPrefixInput && p.invPrefix) invPrefixInput.value = p.invPrefix;
      if (bankNameInput && p.bankName) bankNameInput.value = p.bankName;
      if (bankAccInput && p.bankAcc) bankAccInput.value = p.bankAcc;
      if (bankIfscInput && p.bankIfsc) bankIfscInput.value = p.bankIfsc;
      if (upiInput && p.upi) upiInput.value = p.upi;
      if (signatoryInput && p.signatory) signatoryInput.value = p.signatory;
      updatePreview();
    } catch (e) {
      console.warn("Error parsing saved company profile:", e);
    }
  }

  // Handle Form Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const profileData = {
      legalName: legalNameInput?.value,
      brandName: brandNameInput?.value,
      tagline: taglineInput?.value,
      address: addressInput?.value,
      email: emailInput?.value,
      phone: phoneInput?.value,
      gstin: gstinInput?.value,
      invPrefix: invPrefixInput?.value,
      bankName: bankNameInput?.value,
      bankAcc: bankAccInput?.value,
      bankIfsc: bankIfscInput?.value,
      upi: upiInput?.value,
      signatory: signatoryInput?.value,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem("company_profile", JSON.stringify(profileData));

    // Save to Supabase if connected
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from("system_settings").upsert({
          key: "company_profile",
          value: profileData,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Supabase company profile save:", err);
      }
    }

    updatePreview();
    showToast("Official Company & Billing Profile saved successfully!", "success");
  });
}
