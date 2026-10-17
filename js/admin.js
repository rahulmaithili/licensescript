/* ==========================================================================
   LICENSEVAULT / IEMS ERP EXECUTIVE DASHBOARD - ADMIN JAVASCRIPT
   Modular Architecture - Dedicated Backend Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  initSidebarToggle();
  initTabNavigation();
  initDashboardCharts();
  loadAdminData();
  initKeyGenerator();
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

// 3. Render Executive Dashboard Charts (Matching Screenshot)
function initDashboardCharts() {
  // Chart 1: Financial Overview (Multi-line chart)
  const lineCtx = document.getElementById("overviewLineChart")?.getContext("2d");
  if (lineCtx) {
    const days = Array.from({ length: 31 }, (_, i) => (i + 1 < 10 ? "0" + (i + 1) : "" + (i + 1)));
    
    // Sample mock lines matching the image curves
    const incomeData = [0.8, 0.7, 0.6, 0.65, 0.7, 0.85, 0.9, 0.8, 0.75, 0.7, 0.72, 0.75, 0.8, 0.82, 0.85, 0.88, 0.9, 0.85, 0.8, 0.75, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.95];
    const expenseData = [0.3, 0.35, 0.4, 0.38, 0.35, 0.4, 0.45, 0.42, 0.4, 0.38, 0.35, 0.32, 0.3, 0.35, 0.4, 0.38, 0.35, 0.32, 0.3, 0.28, 0.3, 0.32, 0.35, 0.38, 0.4, 0.38, 0.35, 0.32, 0.3, 0.28, 0.3];
    const netData = incomeData.map((v, i) => parseFloat((v - expenseData[i]).toFixed(2)));

    new Chart(lineCtx, {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: "Total Income",
            data: incomeData,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: "Total Expense",
            data: expenseData,
            borderColor: "#ef4444",
            backgroundColor: "transparent",
            tension: 0.4,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          {
            label: "Net Balance",
            data: netData,
            borderColor: "#06b6d4",
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
            ticks: { color: "#64748b", font: { size: 9 } }
          }
        }
      }
    });
  }

  // Chart 2: Income vs Expense Bar Chart
  const barCtx = document.getElementById("incomeExpenseBarChart")?.getContext("2d");
  if (barCtx) {
    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026"],
        datasets: [
          {
            label: "Income",
            data: [0, 0, 0, 11500, 12000, 2400],
            backgroundColor: "#10b981",
            borderRadius: 4
          },
          {
            label: "Expense",
            data: [0, 0, 0, 14200, 13800, 3100],
            backgroundColor: "#ef4444",
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
            ticks: { color: "#64748b", font: { size: 9 } }
          }
        }
      }
    });
  }

  // Chart 3: Top Expense Categories Donut Chart
  const donutCtx = document.getElementById("expenseDonutChart")?.getContext("2d");
  if (donutCtx) {
    new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["Loan EMI", "Internet / Subscriptions", "Utilities", "Tax / License Fees"],
        datasets: [{
          data: [19068, 3729, 1588, 1480],
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
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

// 4. Load Data from Supabase with Mock Fallback
async function loadAdminData() {
  try {
    // If Supabase client is initialized in window.supabaseClient
    if (window.supabaseClient) {
      const { data: licenses } = await window.supabaseClient
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (licenses && licenses.length > 0) {
        renderLicensesTable(licenses);
        updateLiveStats(licenses);
        return;
      }
    }
  } catch (err) {
    console.warn("Using local cached admin data:", err);
  }

  // Fallback initial mock data
  const mockLicenses = [
    {
      license_key: "CDCMS-8891-PROX-2026",
      client_name: "Rahul Maithili",
      client_email: "rahul@maithili.com",
      product_name: "CDCMS Multi-Tool Suite",
      device_id: "HWID-WIN-8931A-F492",
      expiry_date: "2027-10-30",
      status: "Active"
    },
    {
      license_key: "CDCT-4512-VALD-2026",
      client_name: "Aman Sharma",
      client_email: "aman.sharma@gmail.com",
      product_name: "CDC Tools Multi Extension",
      device_id: "HWID-MAC-4192B-9912",
      expiry_date: "2026-12-15",
      status: "Active"
    },
    {
      license_key: "AIOM-9921-UNLM-2026",
      client_name: "Vikas Patel",
      client_email: "vikas.patel@techcorp.in",
      product_name: "All-in-One Master Bundle",
      device_id: "HWID-WIN-1029C-3381",
      expiry_date: "2026-11-01",
      status: "Active"
    }
  ];

  renderLicensesTable(mockLicenses);
  renderUsersTable();
  renderInvoicesTable();
}

function renderLicensesTable(licenses) {
  const tbody = document.getElementById("admin-licenses-tbody");
  if (!tbody) return;

  tbody.innerHTML = licenses.map(item => `
    <tr>
      <td><strong style="color: #f59e0b; font-family: monospace;">${item.license_key}</strong></td>
      <td>
        <div><strong>${item.client_name || 'Client'}</strong></div>
        <div style="font-size: 11px; color: #94a3b8;">${item.client_email || ''}</div>
      </td>
      <td>${item.product_name || 'CDCMS Tool'}</td>
      <td>
        <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">
          ${item.status || 'Active'}
        </span>
      </td>
      <td><span style="font-family: monospace; font-size: 11px; color: #94a3b8;">${item.device_id || 'Not Bound Yet'}</span></td>
      <td>${item.expiry_date || 'Lifetime'}</td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button onclick="copyText('${item.license_key}')" style="padding: 4px 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; cursor: pointer; font-size: 11px;">Copy</button>
          <button onclick="alert('Device reset triggered for ${item.license_key}')" style="padding: 4px 8px; background: rgba(59,130,246,0.15); border: 1px solid #3b82f6; color: #60a5fa; border-radius: 6px; cursor: pointer; font-size: 11px;">Reset HWID</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderUsersTable() {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td>#USR-101</td>
      <td><strong>Rahul Maithili</strong></td>
      <td>rahul@maithili.com</td>
      <td>1 Active License</td>
      <td>Today, 03:15 PM</td>
      <td><span style="color: #10b981; font-weight: 700;">● Verified Client</span></td>
    </tr>
    <tr>
      <td>#USR-102</td>
      <td><strong>Aman Sharma</strong></td>
      <td>aman.sharma@gmail.com</td>
      <td>1 Active License</td>
      <td>Yesterday</td>
      <td><span style="color: #10b981; font-weight: 700;">● Verified Client</span></td>
    </tr>
    <tr>
      <td>#USR-103</td>
      <td><strong>Vikas Patel</strong></td>
      <td>vikas.patel@techcorp.in</td>
      <td>1 Master Key</td>
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
      <td>CDCMS Suite Pro</td>
      <td><strong>₹999.00</strong></td>
      <td>16 Oct 2026</td>
      <td><span style="color: #10b981; font-weight: 700;">Paid (Razorpay)</span></td>
      <td><button onclick="window.print()" class="admin-card-link" style="background:none;border:none;">PDF &darr;</button></td>
    </tr>
    <tr>
      <td><strong>#INV-2026-002</strong></td>
      <td>Aman Sharma</td>
      <td>CDC Tools Extension</td>
      <td><strong>₹1,499.00</strong></td>
      <td>15 Oct 2026</td>
      <td><span style="color: #10b981; font-weight: 700;">Paid (Razorpay)</span></td>
      <td><button onclick="window.print()" class="admin-card-link" style="background:none;border:none;">PDF &darr;</button></td>
    </tr>
  `;
}

function updateLiveStats(licenses) {
  const incomeVal = document.getElementById("stat-income-val");
  const incomeSub = document.getElementById("stat-income-sub");
  if (incomeVal && licenses) {
    incomeVal.textContent = `₹${(licenses.length * 999).toLocaleString()}`;
    if (incomeSub) incomeSub.textContent = `${licenses.length} active licenses in Oct 2026`;
  }
}

// 5. Instant Key Generator Form
function initKeyGenerator() {
  const form = document.getElementById("admin-key-gen-form");
  const resultBox = document.getElementById("gen-key-result");
  const display = document.getElementById("gen-key-display");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const product = document.getElementById("gen-product-select")?.value || "CDCMS";
    const prefix = product === "all_in_one" ? "AIOM" : (product === "cdc_tools" ? "CDCT" : "CDCMS");
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const newKey = `${prefix}-${randPart}-GENX-2026`;

    if (resultBox && display) {
      display.textContent = newKey;
      resultBox.style.display = "block";
    }

    showToast(`Key generated: ${newKey}`, "success");
  });
}

// 6. Theme Toggle
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

// 7. Sign Out
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
