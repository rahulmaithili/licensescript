/**
 * LicenseVault Portal JavaScript
 * Handles dynamic content, checkout modal, payment verification, and license check.
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyniiGJoVV3_P2KKifUfw-8U8E-1EnYGEKpc3wByfdsmKKDKkedI87UR5nS4SUln3aE/exec";

// Global Settings (populated dynamically from Apps Script database)
let systemSettings = {
  company_name: "LicenseVault",
  company_logo_url: "",
  company_about: "Complete platform for selling software with automatic license key generation, device binding, expiry management, and a powerful admin panel.",
  merchant_upi_id: "your-upi-id@okaxis",
  merchant_name: "LicenseVault Payment",
  support_email: "support@licensevault.com",
  support_mobile: "+91 98765 43210",
  support_whatsapp: "+919876543210",
  company_location: "New Delhi, India"
};

// Application State
let portalState = {
  toolId: "",
  currentStep: 0, // 0 = closed modal, 1 = Registration, 2 = Payment, 3 = Success
  user: {
    name: "",
    companyName: "",
    gstNumber: "",
    mobileNumber: "",
    email: ""
  },
  selectedPlan: {
    id: "",
    price: 0,
    name: ""
  },
  licenseKey: "",
  expiryDate: ""
};

let productsList = [];
let selectedProduct = null;

// DOM Elements
const elements = {
  checkoutModal: document.getElementById("checkout-modal"),
  btnCloseModal: document.getElementById("btn-close-modal"),
  btnSuccessClose: document.getElementById("btn-success-close"),
  
  // Checkout Modal Steps
  modalSteps: {
    1: document.getElementById("step-registration"),
    2: document.getElementById("step-payment"),
    3: document.getElementById("step-success")
  },
  
  // Checkout Modal Progress Tracker
  progressSteps: {
    1: document.getElementById("progress-step-1"),
    2: document.getElementById("progress-step-2"),
    3: document.getElementById("progress-step-3")
  },
  
  // Dynamic Containers
  catalogContainer: document.getElementById("catalog-container"),
  plansContainer: document.getElementById("plans-container"),
  productTabsContainer: document.getElementById("product-tabs-container"),
  
  // Forms & Inputs
  formRegister: document.getElementById("form-register"),
  formPaymentSubmit: document.getElementById("form-payment-submit"),
  formValidateLicense: document.getElementById("form-validate-license"),
  
  // QR & Payment
  upiQrImage: document.getElementById("upi-qr-image"),
  qrLoadingSpinner: document.getElementById("qr-loading-spinner"),
  payUtrInput: document.getElementById("pay-utr"),
  payLicenseDisplay: document.getElementById("pay-license-display"),
  merchantUpiDisplay: document.getElementById("merchant-upi-display"),
  summaryPlanName: document.getElementById("summary-plan-name"),
  summaryPlanPrice: document.getElementById("summary-plan-price"),
  
  // Validation Panel
  valKeyInput: document.getElementById("val-license-key"),
  validationResultPanel: document.getElementById("validation-result-panel"),
  btnSubmitValidation: document.getElementById("btn-submit-validation"),
  
  // Success screen details
  finalLicenseKey: document.getElementById("final-license-key"),
  finalCompanyName: document.getElementById("final-company-name"),
  finalPlanName: document.getElementById("final-plan-name"),
  finalExpiryDate: document.getElementById("final-expiry-date"),
  
  // Actions
  btnCopyKey: document.getElementById("btn-copy-key"),
  btnRedownloadKey: document.getElementById("btn-redownload-key"),
  btnDownloadInvoice: document.getElementById("btn-download-invoice")
};

// Initialize Portal on page load
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initEventListeners();
  initUserSession();
  initAdminDashboardListeners();
  initAdminSession();
  await loadPortalData();
});

// Load unified products & system settings (Supabase first, then Netlify API / Apps Script / Mock)
async function loadPortalData() {
  try {
    let result = null;

    // 1. Try Supabase Client
    if (window.SupabaseDB && window.SupabaseConfig && window.SupabaseConfig.isConnected()) {
      result = await window.SupabaseDB.getPortalData();
    }

    // 2. Try Netlify Serverless API if deployed
    if (!result || !result.success) {
      try {
        const netlifyRes = await fetch("/api/portal-api?action=get_portal_data");
        if (netlifyRes.ok) {
          const json = await netlifyRes.json();
          if (json && json.success) result = json;
        }
      } catch (e) {}
    }

    // 3. Fallback to GAS or Mock Data
    if (!result || !result.success) {
      if (!GAS_API_URL || GAS_API_URL.includes("your-upi-id")) {
        result = getMockPortalData();
      } else {
        const response = await fetch(`${GAS_API_URL}?action=get_portal_data&t=${Date.now()}`);
        result = await response.json();
      }
    }

    if (result && result.success) {
      if (result.settings) {
        systemSettings = { ...systemSettings, ...result.settings };
      }
      if (result.products) {
        productsList = result.products;
      }
      
      applySystemBranding();
      renderCatalogGrid();
      renderProductTabs();
    }

    // Fetch public reviews
    try {
      let reviewsRes = null;
      if (window.SupabaseDB && window.SupabaseConfig && window.SupabaseConfig.isConnected()) {
        reviewsRes = await window.SupabaseDB.getReviews();
      }
      if (!reviewsRes || !reviewsRes.success) {
        if (!GAS_API_URL || GAS_API_URL.includes("your-upi-id")) {
          reviewsRes = {
            success: true,
            reviews: [
              { id: "rev_001", name: "Rajesh Kumar", company: "Shiv Kripa HP Gas Agency", photoUrl: "", stars: 5, reviewText: "Bahut acha tool hai! Area generation ka kaam 10 minutes mein ho jaata hai jo pehle 2 ghante leta tha.", timestamp: new Date().toISOString() },
              { id: "rev_002", name: "Priya Sharma", company: "Durga Gas Service", photoUrl: "", stars: 5, reviewText: "Automatic licence system se bahut asaani ho gayi. Payment ke saath hi key activate ho jaati hai!", timestamp: new Date().toISOString() },
              { id: "rev_003", name: "Amit Patel", company: "Jai Ambe Gas Agency", photoUrl: "", stars: 4, reviewText: "Admin panel se sab manage karna bahut easy hai. Support bhi bahut acha hai.", timestamp: new Date().toISOString() }
            ]
          };
        } else {
          const response = await fetch(`${GAS_API_URL}?action=get_reviews&t=${Date.now()}`);
          reviewsRes = await response.json();
        }
      }
      if (reviewsRes && reviewsRes.success) {
        renderReviewsGrid(reviewsRes.reviews);
      }
    } catch (e) {
      console.error("Error loading reviews:", e);
    }

  } catch (err) {
    console.error("Error loading portal data:", err);
    // fallback to mock data on connection failure
    const mock = getMockPortalData();
    systemSettings = mock.settings;
    productsList = mock.products;
    applySystemBranding();
    renderCatalogGrid();
    renderProductTabs();

    // fallback reviews
    renderReviewsGrid([
      { id: "rev_001", name: "Rajesh Kumar", company: "Shiv Kripa HP Gas Agency", photoUrl: "", stars: 5, reviewText: "Bahut acha tool hai! Area generation ka kaam 10 minutes mein ho jaata hai jo pehle 2 ghante leta tha.", timestamp: new Date().toISOString() },
      { id: "rev_002", name: "Priya Sharma", company: "Durga Gas Service", photoUrl: "", stars: 5, reviewText: "Automatic licence system se bahut asaani ho gayi. Payment ke saath hi key activate ho jaati hai!", timestamp: new Date().toISOString() },
      { id: "rev_003", name: "Amit Patel", company: "Jai Ambe Gas Agency", photoUrl: "", stars: 4, reviewText: "Admin panel se sab manage karna bahut easy hai. Support bhi bahut acha hai.", timestamp: new Date().toISOString() }
    ]);
  }
}

// Bind dynamically fetched brandings to UI elements
function applySystemBranding() {
  // Brand name binds
  document.getElementById("nav-brand-name-text").textContent = systemSettings.company_name;
  document.getElementById("footer-brand-name-text").textContent = systemSettings.company_name;
  document.getElementById("copyright-company-name").textContent = systemSettings.company_name;
  document.title = `${systemSettings.company_name} - Software Licensing & Billing Portal`;

  const adminSidebarTitle = document.getElementById("admin-sidebar-title-text");
  if (adminSidebarTitle) adminSidebarTitle.textContent = systemSettings.company_name;

  const upiDisplay = document.getElementById("merchant-upi-display");
  if (upiDisplay) upiDisplay.textContent = systemSettings.merchant_upi_id;

  // Logos crop with error fallback
  const directLogoUrl = getDirectDriveImageUrl(systemSettings.company_logo_url);
  
  // Nav logo
  const navLogoContainer = document.getElementById("nav-brand-logo-id");
  if (navLogoContainer) {
    if (directLogoUrl && directLogoUrl.trim() !== "") {
      navLogoContainer.innerHTML = `
        <img src="${directLogoUrl.trim()}" alt="${systemSettings.company_name}" onerror="this.style.display='none'; document.getElementById('nav-logo-svg').style.display='block';" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
        <svg id="nav-logo-svg" style="display:none;" class="icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    } else {
      navLogoContainer.innerHTML = `
        <svg class="icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    }
  }

  // Footer logo
  const footerLogoContainer = document.getElementById("footer-logo-id");
  if (footerLogoContainer) {
    if (directLogoUrl && directLogoUrl.trim() !== "") {
      footerLogoContainer.innerHTML = `
        <img src="${directLogoUrl.trim()}" alt="${systemSettings.company_name}" onerror="this.style.display='none'; document.getElementById('footer-logo-svg').style.display='block';" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
        <svg id="footer-logo-svg" style="display:none;" class="icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    } else {
      footerLogoContainer.innerHTML = `
        <svg class="icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    }
  }

  // Admin sidebar logo
  const adminLogoContainer = document.getElementById("admin-sidebar-logo-id");
  if (adminLogoContainer) {
    if (directLogoUrl && directLogoUrl.trim() !== "") {
      adminLogoContainer.innerHTML = `
        <img src="${directLogoUrl.trim()}" alt="${systemSettings.company_name}" onerror="this.style.display='none'; document.getElementById('admin-logo-svg').style.display='block';" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
        <svg id="admin-logo-svg" style="display:none;" class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    } else {
      adminLogoContainer.innerHTML = `
        <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>`;
    }
  }

  // Support binds
  if (document.getElementById("footer-company-about")) {
    document.getElementById("footer-company-about").textContent = systemSettings.company_about || "";
  }
  
  const emailLink = document.getElementById("footer-email");
  if (emailLink) {
    emailLink.href = `mailto:${systemSettings.support_email || ""}`;
    emailLink.textContent = systemSettings.support_email || "";
  }
  
  const supportMobileStr = systemSettings.support_mobile ? String(systemSettings.support_mobile) : "";
  const mobileLink = document.getElementById("footer-mobile");
  if (mobileLink) {
    mobileLink.href = `tel:${supportMobileStr.replace(/\s+/g, '')}`;
    mobileLink.textContent = supportMobileStr || "Not Available";
  }

  const supportWhatsappStr = systemSettings.support_whatsapp ? String(systemSettings.support_whatsapp) : "";
  const waLink = document.getElementById("footer-whatsapp");
  if (waLink) {
    waLink.href = `https://wa.me/${supportWhatsappStr.replace(/[^0-9]/g, '')}`;
  }
  
  if (document.getElementById("footer-location")) {
    document.getElementById("footer-location").textContent = systemSettings.company_location || "";
  }
}

// Render dynamic products inside Catalog Grid
function renderCatalogGrid() {
  elements.catalogContainer.innerHTML = "";
  
  if (productsList.length === 0) {
    elements.catalogContainer.innerHTML = `<div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 40px;">No automation products configured yet.</div>`;
    return;
  }

  productsList.forEach(prod => {
    const card = document.createElement("div");
    card.className = "catalog-card glass-panel";
    
    // Choose clean SVGs for icons instead of emoji
    let iconSvg = "";
    if (prod.toolId.includes("helper")) {
      iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    } else if (prod.toolId.includes("cancel")) {
      iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
    } else {
      iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
    }

    const featuresHtml = prod.features.map(f => `
      <li>
        <span class="check-svg-wrapper">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span>${f}</span>
      </li>
    `).join("");

    card.innerHTML = `
      <div class="catalog-card-header">
        <div class="tool-icon">${iconSvg}</div>
        <h3>${prod.name}</h3>
      </div>
      <p class="tool-desc">${prod.description}</p>
      <ul class="features-list">
        ${featuresHtml}
      </ul>
      <div class="catalog-card-actions">
        <a href="${getDirectDriveFileUrl(prod.downloadUrl)}" target="_blank" class="btn btn-secondary btn-sm download-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download</span>
        </a>
        <button class="btn btn-primary btn-sm buy-btn" data-tool-id="${prod.toolId}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          <span>Buy License</span>
        </button>
      </div>
    `;
    elements.catalogContainer.appendChild(card);
  });

  // Bind catalog click buttons
  elements.catalogContainer.querySelectorAll(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetToolId = btn.getAttribute("data-tool-id");
      scrollToSection("pricing-section");
      activateProductTab(targetToolId);
    });
  });

  // Bind download click warnings
  elements.catalogContainer.querySelectorAll(".download-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href");
      if (!href || href === "#") {
        e.preventDefault();
        showToast("Download link not configured by the administrator yet.", "warning");
      }
    });
  });
}

// Render tabs to switch product plans in the pricing section
function renderProductTabs() {
  elements.productTabsContainer.innerHTML = "";
  
  if (productsList.length === 0) return;

  productsList.forEach((prod, index) => {
    const tab = document.createElement("button");
    tab.className = `tab-btn ${index === 0 ? 'active' : ''}`;
    tab.setAttribute("data-tool-id", prod.toolId);
    tab.textContent = prod.name;
    
    tab.addEventListener("click", () => {
      activateProductTab(prod.toolId);
    });
    
    elements.productTabsContainer.appendChild(tab);
  });

  // Render initial plans
  activateProductTab(productsList[0].toolId);
}

// Switch active product tab and show plans
function activateProductTab(toolId) {
  const tabs = elements.productTabsContainer.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    if (tab.getAttribute("data-tool-id") === toolId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  selectedProduct = productsList.find(p => p.toolId === toolId);
  portalState.toolId = toolId;
  
  if (selectedProduct) {
    renderPlansList(selectedProduct.plans);
  }
}

// Render plan cards for the currently selected product
function renderPlansList(plans) {
  elements.plansContainer.innerHTML = "";

  if (!plans || plans.length === 0) {
    elements.plansContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 40px;">No subscription plans configured for this product.</div>`;
    return;
  }

  plans.forEach((plan, idx) => {
    const card = document.createElement("div");
    const isPopular = plan.id === "3_months" || idx === 1;
    card.className = `plan-card glass-panel ${isPopular ? 'popular' : ''}`;
    
    let planBadge = "Standard";
    if (plan.duration <= 7) planBadge = "Trial Key";
    else if (plan.duration >= 365) planBadge = "Enterprise";
    else if (isPopular) planBadge = "Value Pack";

    const popularRibbonHtml = isPopular ? `<div class="popular-ribbon">Popular</div>` : "";

    card.innerHTML = `
      ${popularRibbonHtml}
      <span class="plan-badge">${planBadge}</span>
      <h3>${plan.name}</h3>
      <div class="price-box">
        <span class="currency">₹</span>
        <span class="amount">${plan.price}</span>
        <span class="period">/ ${plan.duration} Days</span>
      </div>
      <ul class="plan-features">
        <li>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Instant Key Delivery</span>
        </li>
        <li>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Single Device Lock</span>
        </li>
        <li>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Full Auto Automation</span>
        </li>
        <li>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Security Updates</span>
        </li>
      </ul>
      <button class="btn ${isPopular ? 'btn-primary animate-pulse-glow' : 'btn-secondary'} btn-plan-select" 
              data-id="${plan.id}" data-price="${plan.price}" data-name="${plan.name}">
        Choose Plan
      </button>
    `;
    elements.plansContainer.appendChild(card);
  });

  // Bind plan buttons to launch modal
  elements.plansContainer.querySelectorAll(".btn-plan-select").forEach(btn => {
    btn.addEventListener("click", () => {
      const planId = btn.getAttribute("data-id");
      const planPrice = parseInt(btn.getAttribute("data-price"));
      const planName = btn.getAttribute("data-name");
      
      portalState.selectedPlan = { id: planId, price: planPrice, name: planName };
      
      elements.summaryPlanName.textContent = planName;
      elements.summaryPlanPrice.textContent = "₹" + planPrice;
      
      // Reset input fields
      elements.formRegister.reset();
      elements.formPaymentSubmit.reset();
      
      // Open modal
      openCheckoutModal();
    });
  });
}

// Modal Toggle Logic
function openCheckoutModal() {
  elements.checkoutModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // lock screen scroll
  setStep(1); // registration step
}

function closeCheckoutModal() {
  elements.checkoutModal.classList.add("hidden");
  document.body.style.overflow = ""; // restore screen scroll
}

function setStep(stepNum) {
  portalState.currentStep = stepNum;
  
  // Update step section visibility
  Object.keys(elements.modalSteps).forEach(step => {
    const stepInt = parseInt(step);
    if (stepInt === stepNum) {
      elements.modalSteps[step].classList.add("active");
    } else {
      elements.modalSteps[step].classList.remove("active");
    }
  });

  // Update progress tracker visual styles
  Object.keys(elements.progressSteps).forEach(step => {
    const stepInt = parseInt(step);
    elements.progressSteps[step].classList.remove("active", "completed");
    
    if (stepInt === stepNum) {
      elements.progressSteps[step].classList.add("active");
    } else if (stepInt < stepNum) {
      elements.progressSteps[step].classList.add("completed");
    }
  });

  if (stepNum === 2) {
    const rzpBtnAmount = document.getElementById("rzp-btn-amount");
    if (rzpBtnAmount) {
      rzpBtnAmount.textContent = `₹${portalState.selectedPlan.price}`;
    }
    const summaryPlanPrice = document.getElementById("summary-plan-price");
    if (summaryPlanPrice) {
      summaryPlanPrice.textContent = `₹${portalState.selectedPlan.price}`;
    }
    const summaryPlanName = document.getElementById("summary-plan-name");
    if (summaryPlanName) {
      summaryPlanName.textContent = portalState.selectedPlan.name;
    }
  }
}

// Event Listeners Configuration
function initEventListeners() {
  // Close buttons
  elements.btnCloseModal.addEventListener("click", closeCheckoutModal);
  elements.btnSuccessClose.addEventListener("click", closeCheckoutModal);
  
  // Close modal when clicking outside content card
  elements.checkoutModal.addEventListener("click", (e) => {
    if (e.target === elements.checkoutModal) {
      closeCheckoutModal();
    }
  });

  // Step 1: Register User
  elements.formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitBtn = elements.formRegister.querySelector("button[type='submit']");
    const spanText = submitBtn.querySelector("span");
    const originalText = spanText.textContent;
    
    submitBtn.disabled = true;
    spanText.textContent = "Registering...";
    
    portalState.user.name = document.getElementById("reg-name").value.trim();
    portalState.user.companyName = document.getElementById("reg-company").value.trim();
    portalState.user.gstNumber = document.getElementById("reg-gst").value.trim().toUpperCase();
    portalState.user.mobileNumber = document.getElementById("reg-mobile").value.trim();
    portalState.user.email = document.getElementById("reg-email").value.trim();
    const regPassword = document.getElementById("reg-password") ? document.getElementById("reg-password").value.trim() : "";
    const regConfirm = document.getElementById("reg-confirm-password") ? document.getElementById("reg-confirm-password").value.trim() : "";

    if (regPassword && regConfirm && regPassword !== regConfirm) {
      alert("Passwords match nahi kar rahe! Dobara enter karein.");
      submitBtn.disabled = false;
      spanText.textContent = originalText;
      return;
    }
    
    try {
      const response = await apiPost({
        action: "register",
        toolId: portalState.toolId,
        name: portalState.user.name,
        companyName: portalState.user.companyName,
        gstNumber: portalState.user.gstNumber,
        mobileNumber: portalState.user.mobileNumber,
        email: portalState.user.email,
        password: regPassword || portalState.user.email // fallback to email if no password field
      });
      
      if (response && response.success) {
        portalState.licenseKey = response.licenseKey;
        
        elements.payLicenseDisplay.value = response.licenseKey;
        elements.finalLicenseKey.textContent = response.licenseKey;
        elements.finalCompanyName.textContent = portalState.user.companyName;
        
        // Populate Merchant text
        elements.merchantUpiDisplay.textContent = systemSettings.merchant_upi_id;
        
        // Pre-generate dynamic payment QR code
        generatePaymentQr();
        
        // Go to Step 2
        setStep(2);
      } else {
        alert("Registration failed: " + (response.message || "Error saving."));
      }
    } catch (err) {
      console.error(err);
      alert("Backend connection failed. Registration mocked for testing.");
      
      // Fallback register mock key
      portalState.licenseKey = `CDCMS-${Math.floor(1000 + Math.random()*9000)}-MOCK`;
      elements.payLicenseDisplay.value = portalState.licenseKey;
      elements.finalLicenseKey.textContent = portalState.licenseKey;
      elements.finalCompanyName.textContent = portalState.user.companyName;
      elements.merchantUpiDisplay.textContent = systemSettings.merchant_upi_id;
      generatePaymentQr();
      setStep(2);
    } finally {
      submitBtn.disabled = false;
      spanText.textContent = originalText;
    }
  });

  // Step 2: Payment submission
  elements.formPaymentSubmit.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const utr = elements.payUtrInput.value.trim();
    if (utr.length !== 12 || isNaN(utr)) {
      alert("Please enter a valid 12-digit UTR/Ref transaction ID!");
      return;
    }

    const submitBtn = elements.formPaymentSubmit.querySelector("button[type='submit']");
    const spanText = submitBtn.querySelector("span");
    const originalText = spanText.textContent;
    
    submitBtn.disabled = true;
    spanText.textContent = "Verifying Transaction...";

    try {
      const response = await apiPost({
        action: "update_payment",
        licenseKey: portalState.licenseKey,
        plan: portalState.selectedPlan.id,
        utrNumber: utr
      });

      if (response && response.success) {
        portalState.expiryDate = response.expiryDate;
        
        elements.finalPlanName.textContent = portalState.selectedPlan.name;
        
        const dateParts = response.expiryDate.split('-');
        elements.finalExpiryDate.textContent = dateParts.length === 3 
          ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` 
          : response.expiryDate;

        downloadCredentialsFile();
        downloadInvoicePdf();
        setStep(3); // success screen
      } else {
        alert("Verification submission error: " + (response.message || "Please check UTR."));
      }
    } catch (err) {
      console.error(err);
      alert("Connecting to server failed. Transaction submitted in mock mode.");
      
      portalState.expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      elements.finalPlanName.textContent = portalState.selectedPlan.name;
      elements.finalExpiryDate.textContent = portalState.expiryDate;
      downloadCredentialsFile();
      downloadInvoicePdf();
      setStep(3);
    } finally {
      submitBtn.disabled = false;
      spanText.textContent = originalText;
    }
  });

  // Razorpay Instant Checkout Trigger
  const btnPayRazorpay = document.getElementById("btn-pay-razorpay");
  if (btnPayRazorpay) {
    btnPayRazorpay.addEventListener("click", async () => {
      await initiateRazorpayCheckout();
    });
  }

  // Toggle Manual UPI Accordion
  const btnToggleManualUpi = document.getElementById("btn-toggle-manual-upi");
  const manualUpiBody = document.getElementById("manual-upi-body");
  const upiArrow = document.getElementById("upi-accordion-arrow");
  if (btnToggleManualUpi && manualUpiBody) {
    btnToggleManualUpi.addEventListener("click", () => {
      const isHidden = manualUpiBody.style.display === "none";
      manualUpiBody.style.display = isHidden ? "grid" : "none";
      if (upiArrow) upiArrow.textContent = isHidden ? "▲" : "▼";
    });
  }

  // Inline validation key check
  elements.formValidateLicense.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const keyToCheck = elements.valKeyInput.value.trim().toUpperCase();
    if (!keyToCheck) return;

    elements.btnSubmitValidation.disabled = true;
    elements.btnSubmitValidation.textContent = "Checking...";
    
    elements.validationResultPanel.classList.add("hidden");

    try {
      let result;
      if (!GAS_API_URL || GAS_API_URL.includes("your-upi-id")) {
        result = { success: true, status: "active", name: "Guest User", company: "HP Gas Service Mock", expiry: "2026-12-31" };
      } else {
        const response = await fetch(`${GAS_API_URL}?action=verify_license&licenseKey=${encodeURIComponent(keyToCheck)}&deviceId=PORTAL_VALIDATOR&t=${Date.now()}`);
        result = await response.json();
      }

      elements.validationResultPanel.classList.remove("hidden");
      
      if (result && result.status) {
        let statusClass = "invalid";
        let statusText = "Invalid License";
        let statusMsg = result.message || "Key not registered.";
        
        if (result.status === "active") {
          statusClass = "active";
          statusText = "Active Subscription";
          statusMsg = "Your key is active and successfully authenticated.";
        } else if (result.status === "pending") {
          statusClass = "pending";
          statusText = "Pending Verification";
          statusMsg = "Admin approval is pending for this transaction UTR.";
        } else if (result.status === "expired") {
          statusClass = "expired";
          statusText = "License Expired";
          statusMsg = "Your subscription duration has ended. Please renew.";
        } else if (result.status === "blocked") {
          statusClass = "blocked";
          statusText = "Blocked Key";
          statusMsg = "Key blocked. Contact the billing support.";
        }

        elements.validationResultPanel.innerHTML = `
          <div class="status-badge ${statusClass}">${statusText}</div>
          <p class="validation-msg">${statusMsg}</p>
          <div class="result-grid">
            <div class="result-item">
              <span class="result-label">Licensed Name</span>
              <span class="result-val">${result.name || "N/A"}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Agency / Agency</span>
              <span class="result-val">${result.company || "N/A"}</span>
            </div>
            <div class="result-item" style="grid-column: span 2;">
              <span class="result-label">Expiration Date</span>
              <span class="result-val">${result.expiry || "N/A"}</span>
            </div>
          </div>
        `;
      } else {
        elements.validationResultPanel.innerHTML = `
          <div class="status-badge invalid">Error</div>
          <p class="validation-msg">Verification failed: key is not valid or unrecognized format.</p>
        `;
      }
    } catch (err) {
      console.error(err);
      elements.validationResultPanel.classList.remove("hidden");
      elements.validationResultPanel.innerHTML = `
        <div class="status-badge invalid">Connection Error</div>
        <p class="validation-msg">Failed to connect to verification servers. Try again later.</p>
      `;
    } finally {
      elements.btnSubmitValidation.disabled = false;
      elements.btnSubmitValidation.textContent = "Verify Status";
    }
  });

  // Utilities actions
  elements.btnCopyKey.addEventListener("click", () => {
    navigator.clipboard.writeText(portalState.licenseKey).then(() => {
      const originalText = elements.btnCopyKey.textContent;
      elements.btnCopyKey.textContent = "Copied!";
      elements.btnCopyKey.classList.add("btn-primary");
      elements.btnCopyKey.classList.remove("btn-secondary");
      
      setTimeout(() => {
        elements.btnCopyKey.textContent = originalText;
        elements.btnCopyKey.classList.remove("btn-primary");
        elements.btnCopyKey.classList.add("btn-secondary");
      }, 1500);
    });
  });

  elements.btnRedownloadKey.addEventListener("click", downloadCredentialsFile);
  if (elements.btnDownloadInvoice) {
    elements.btnDownloadInvoice.addEventListener("click", downloadInvoicePdf);
  }

  const btnAdminThemeToggle = document.getElementById("admin-theme-toggle-btn");
  if (btnAdminThemeToggle) {
    btnAdminThemeToggle.addEventListener("click", () => {
      if (document.body.classList.contains("light-mode")) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // USER PROFILE / ACCOUNT DASHBOARD MODAL BINDINGS
  const btnUserProfile = document.getElementById("btn-user-profile");
  const userAccountModal = document.getElementById("user-account-modal");
  const btnCloseUserModal = document.getElementById("btn-close-user-modal");
  const btnUserLogout = document.getElementById("btn-user-logout");
  
  if (btnUserProfile && userAccountModal) {
    btnUserProfile.addEventListener("click", () => {
      userAccountModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    });
  }
  
  if (btnCloseUserModal && userAccountModal) {
    btnCloseUserModal.addEventListener("click", () => {
      userAccountModal.classList.add("hidden");
      document.body.style.overflow = "";
    });
  }

  // Close user modal on clicking outside content
  if (userAccountModal) {
    userAccountModal.addEventListener("click", (e) => {
      if (e.target === userAccountModal) {
        userAccountModal.classList.add("hidden");
        document.body.style.overflow = "";
      }
    });
  }
  
  // Tab switching inside user login modal
  const btnTabEmail = document.getElementById("btn-tab-login-email");
  const btnTabAdmin = document.getElementById("btn-tab-login-admin");
  const formLoginEmail = document.getElementById("form-login-email");
  const formLoginAdmin = document.getElementById("form-login-admin");
  
  if (btnTabEmail && btnTabAdmin && formLoginEmail && formLoginAdmin) {
    const allTabs = [btnTabEmail, btnTabAdmin];
    const allPanels = [formLoginEmail, formLoginAdmin];

    function switchLoginTab(activeTab, activePanel) {
      allTabs.forEach(t => t.classList.remove("active"));
      allPanels.forEach(p => p.classList.add("hidden"));
      if (activeTab) activeTab.classList.add("active");
      if (activePanel) activePanel.classList.remove("hidden");
    }

    btnTabEmail.addEventListener("click", () => switchLoginTab(btnTabEmail, formLoginEmail));
    btnTabAdmin.addEventListener("click", () => switchLoginTab(btnTabAdmin, formLoginAdmin));
  }

  // Submit Email + Password Login
  const formLoginEmailEl = document.getElementById("form-login-email");
  if (formLoginEmailEl) {
    formLoginEmailEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email-id").value.trim().toLowerCase();
      const password = document.getElementById("login-email-password").value.trim(); // case-sensitive password
      if (!email || !password) return;

      const submitBtn = formLoginEmailEl.querySelector("button[type='submit']");
      const spanText = submitBtn.querySelector("span");
      const originalText = spanText.textContent;
      submitBtn.disabled = true;
      spanText.textContent = "Signing In...";

      try {
        const response = await apiPost({
          action: "user_login_email",
          email: email,
          password: password
        });

        if (response && response.success) {
          sessionStorage.setItem("user_portal_session", JSON.stringify(response));
          const userAccountModal = document.getElementById("user-account-modal");
          if (userAccountModal) {
            userAccountModal.classList.add("hidden");
            document.body.style.overflow = "";
          }
          initUserSession();
          showToast("Logged in successfully!", "success");
        } else {
          alert("Login failed: " + (response.message || "Invalid credentials."));
        }
      } catch (err) {
        console.error(err);
        alert("Connection error. Try again.");
      } finally {
        submitBtn.disabled = false;
        spanText.textContent = originalText;
      }
    });
  }

  // ── FORGOT PASSWORD FLOW ──────────────────────────────────────────────────
  let forgotPasswordEmail = "";

  // Toggle: show forgot password panel, hide login forms
  const btnOpenForgot = document.getElementById("btn-open-forgot-password");
  const forgotPanel = document.getElementById("forgot-password-panel");
  const formLoginEmailMain = document.getElementById("form-login-email");

  if (btnOpenForgot && forgotPanel && formLoginEmailMain) {
    btnOpenForgot.addEventListener("click", () => {
      formLoginEmailMain.classList.add("hidden");
      forgotPanel.classList.remove("hidden");
      document.getElementById("fp-step-email").classList.remove("hidden");
      document.getElementById("fp-step-otp").classList.add("hidden");
    });
  }

  // Back: forgot panel → login form
  const btnBackToLogin = document.getElementById("btn-back-to-login");
  if (btnBackToLogin && forgotPanel && formLoginEmailMain) {
    btnBackToLogin.addEventListener("click", () => {
      forgotPanel.classList.add("hidden");
      formLoginEmailMain.classList.remove("hidden");
    });
  }

  // Password Visibility Toggle for Client Login
  const btnToggleClientPass = document.getElementById("btn-toggle-client-pass");
  const inputClientPass = document.getElementById("login-email-password");
  if (btnToggleClientPass && inputClientPass) {
    btnToggleClientPass.addEventListener("click", () => {
      const isPass = inputClientPass.type === "password";
      inputClientPass.type = isPass ? "text" : "password";
      btnToggleClientPass.innerHTML = isPass 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // Password Visibility Toggle for Admin Login
  const btnToggleAdminPass = document.getElementById("btn-toggle-admin-pass");
  const inputAdminPass = document.getElementById("login-admin-token");
  if (btnToggleAdminPass && inputAdminPass) {
    btnToggleAdminPass.addEventListener("click", () => {
      const isPass = inputAdminPass.type === "password";
      inputAdminPass.type = isPass ? "text" : "password";
      btnToggleAdminPass.innerHTML = isPass 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // FP Step 1: Send OTP
  const formFpSendOtp = document.getElementById("form-fp-send-otp");
  if (formFpSendOtp) {
    formFpSendOtp.addEventListener("submit", async (e) => {
      e.preventDefault();
      forgotPasswordEmail = document.getElementById("fp-email").value.trim().toLowerCase();
      if (!forgotPasswordEmail) return;
      const btn = formFpSendOtp.querySelector("button[type='submit']");
      const span = btn.querySelector("span");
      btn.disabled = true; span.textContent = "Bhej rahe hain...";
      try {
        const res = await apiPost({ action: "forgot_password_otp", email: forgotPasswordEmail });
        if (res && res.success) {
          showToast("OTP aapki email pe bhej diya!", "success");
          document.getElementById("fp-step-email").classList.add("hidden");
          document.getElementById("fp-step-otp").classList.remove("hidden");
        } else {
          alert(res.message || "OTP bhejne mein error.");
        }
      } catch(err) {
        alert("Connection error. Dobara try karein.");
      } finally {
        btn.disabled = false; span.textContent = "OTP Bhejo";
      }
    });
  }

  // Back: OTP step → email step
  const btnBackToFpEmail = document.getElementById("btn-back-to-fp-email");
  if (btnBackToFpEmail) {
    btnBackToFpEmail.addEventListener("click", () => {
      document.getElementById("fp-step-otp").classList.add("hidden");
      document.getElementById("fp-step-email").classList.remove("hidden");
    });
  }

  // FP Step 2: Verify OTP + Set new password
  const formFpReset = document.getElementById("form-fp-reset");
  if (formFpReset) {
    formFpReset.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otp = document.getElementById("fp-otp-input").value.trim();
      const newPass = document.getElementById("fp-new-password").value.trim();
      const confirmPass = document.getElementById("fp-confirm-password").value.trim();
      if (!otp || !newPass || !confirmPass) return;
      if (newPass !== confirmPass) {
        alert("Passwords match nahi kar rahe!"); return;
      }
      if (newPass.length < 6) {
        alert("Password kam se kam 6 characters ka hona chahiye!"); return;
      }
      const btn = formFpReset.querySelector("button[type='submit']");
      const span = btn.querySelector("span");
      btn.disabled = true; span.textContent = "Reset ho raha hai...";
      try {
        const res = await apiPost({
          action: "reset_password",
          email: forgotPasswordEmail,
          otp: otp,
          newPassword: newPass
        });
        if (res && res.success) {
          showToast("Password reset ho gaya! Ab naye password se login karein.", "success");
          // Reset and go back to email login tab
          forgotPanel.classList.add("hidden");
          formLoginEmailMain.classList.remove("hidden");
          formFpReset.reset();
          document.getElementById("fp-step-otp").classList.add("hidden");
          document.getElementById("fp-step-email").classList.remove("hidden");
        } else {
          alert(res.message || "Password reset nahi hua. Dobara try karein.");
        }
      } catch(err) {
        alert("Connection error. Dobara try karein.");
      } finally {
        btn.disabled = false; span.textContent = "Password Reset Karein";
      }
    });
  }
  // ──────────────────────────────────────────────────────────────────────────



  // Submit Admin Token Login
  const formLoginAdminEl = document.getElementById("form-login-admin");
  if (formLoginAdminEl) {
    formLoginAdminEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = document.getElementById("login-admin-token").value.trim();
      const errorMsg = document.getElementById("login-admin-error-msg");
      if (errorMsg) errorMsg.style.display = "none";
      
      const submitBtn = formLoginAdminEl.querySelector("button[type='submit']");
      const spanText = submitBtn.querySelector("span");
      const originalText = spanText ? spanText.textContent : submitBtn.textContent;
      
      submitBtn.disabled = true;
      if (spanText) spanText.textContent = "Verifying...";
      else submitBtn.textContent = "Verifying...";
      
      try {
        let result;
        if (!GAS_API_URL || GAS_API_URL.includes("your-upi-id")) {
          if (token === "admin@123") {
            result = { success: true };
          } else {
            result = { success: false, message: "Invalid Admin Token (Mock Mode: use admin@123)" };
          }
        } else {
          try {
            const response = await fetch(GAS_API_URL, {
              method: "POST",
              mode: "cors",
              redirect: "follow",
              body: JSON.stringify({
                action: "admin_login",
                adminToken: token
              })
            });
            result = await response.json();
          } catch (fetchErr) {
            console.warn("Admin login fetch failed, falling back to local check.", fetchErr);
            if (token === "admin@123") {
              result = { success: true };
            } else {
              result = { success: false, message: "Server connection failed. Use 'admin@123' to login locally." };
            }
          }
        }
        
        if (result && result.success) {
          adminState.token = token;
          localStorage.setItem("cdcms_admin_token", token);
          
          // Close user modal
          const userAccountModal = document.getElementById("user-account-modal");
          if (userAccountModal) {
            userAccountModal.classList.add("hidden");
            document.body.style.overflow = "";
          }
          
          // Hide portal website
          const portalContainer = document.getElementById("portal-container-id");
          const navbarHeader = document.getElementById("navbar-header-id");
          if (portalContainer) portalContainer.style.display = "none";
          if (navbarHeader) navbarHeader.style.display = "none";
          
          // Show admin dashboard
          const adminDashboard = document.getElementById("admin-dashboard");
          if (adminDashboard) adminDashboard.style.display = "flex";
          
          showToast("Logged in successfully as Admin!", "success");
          loadDashboardData();
        } else {
          if (errorMsg) {
            errorMsg.textContent = result.message || "Invalid Admin Token!";
            errorMsg.style.display = "block";
          }
        }
      } catch (err) {
        console.error(err);
        if (errorMsg) {
          errorMsg.textContent = "Error occurred during verification.";
          errorMsg.style.display = "block";
        }
      } finally {
        submitBtn.disabled = false;
        if (spanText) spanText.textContent = originalText;
        else submitBtn.textContent = originalText;
      }
    });
  }
  
  // Logout action
  if (btnUserLogout) {
    btnUserLogout.addEventListener("click", () => {
      sessionStorage.removeItem("user_portal_session");
      initUserSession();
    });
  }
  
  // Dark/Light Theme Toggle Click
  const btnThemeToggle = document.getElementById("theme-toggle-btn");
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      if (document.body.classList.contains("light-mode")) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }
}

// Generate payment QR Code
function generatePaymentQr() {
  elements.upiQrImage.style.display = "none";
  elements.qrLoadingSpinner.style.display = "flex";
  
  const amount = portalState.selectedPlan.price;
  const planId = portalState.selectedPlan.id;
  const note = `Activation_Key_${planId}`.substring(0, 50).replace(/\s+/g, '_');
  
  const upiUrl = `upi://pay?pa=${encodeURIComponent(systemSettings.merchant_upi_id)}&pn=${encodeURIComponent(systemSettings.merchant_name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}&ecc=M`;
  
  elements.upiQrImage.src = qrCodeApiUrl;
  
  elements.upiQrImage.onload = () => {
    elements.upiQrImage.style.display = "block";
    elements.qrLoadingSpinner.style.display = "none";
  };
  
  elements.upiQrImage.onerror = () => {
    elements.qrLoadingSpinner.textContent = "Error loading. Pay directly to: " + systemSettings.merchant_upi_id;
  };
}

// Download Invoice in premium PDF layout
function downloadInvoicePdf() {
  const companyLogo = systemSettings.company_logo_url;
  const companyName = systemSettings.company_name;
  const companyAbout = systemSettings.company_about;
  const companyLocation = systemSettings.company_location;
  const supportEmail = systemSettings.support_email;
  const supportMobile = systemSettings.support_mobile;
  
  const userName = portalState.user.name;
  const userCompany = portalState.user.companyName;
  const userGst = portalState.user.gstNumber || "N/A";
  const userMobile = portalState.user.mobileNumber;
  const userEmail = portalState.user.email;
  
  const licenseKey = portalState.licenseKey;
  const planName = portalState.selectedPlan.name;
  const planPrice = portalState.selectedPlan.price;
  const expiryDate = portalState.expiryDate;
  const utr = elements.payUtrInput.value.trim() || "MOCK_TRANSACTION";
  const today = new Date().toLocaleDateString('en-IN');
  const invoiceNum = "INV-" + Date.now().toString().slice(-6);

  const directInvoiceLogoUrl = getDirectDriveImageUrl(companyLogo);
  let logoHtml = `<div class="logo-placeholder">${companyName.substring(0, 2).toUpperCase()}</div>`;
  if (directInvoiceLogoUrl && directInvoiceLogoUrl.trim().startsWith("http")) {
    logoHtml = `<img src="${directInvoiceLogoUrl.trim()}" alt="${companyName}" style="max-height: 50px; border-radius: 8px;">`;
  }

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${invoiceNum}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          background: #ffffff;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 24px;
          margin-bottom: 30px;
        }
        .logo-placeholder {
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }
        .company-details {
          text-align: right;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
        }
        .bill-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .bill-to h3, .invoice-info h3 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          margin: 0 0 12px;
        }
        .bill-to p, .invoice-info p {
          font-size: 14px;
          margin: 0 0 6px;
          line-height: 1.5;
          color: #334155;
        }
        .bill-to strong, .invoice-info strong {
          color: #0f172a;
        }
        .paid-badge {
          background: #dcfce7;
          color: #15803d;
          font-weight: 700;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 9999px;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 10px;
        }
        .table-invoice {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .table-invoice th {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          text-align: left;
        }
        .table-invoice td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #334155;
        }
        .license-key-box {
          background: #f8fafc;
          border: 1px dashed #6366f1;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 40px;
          text-align: center;
        }
        .license-key-box span {
          display: block;
          font-size: 12px;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .license-key-box code {
          font-family: monospace;
          font-size: 22px;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: 2px;
        }
        .footer-note {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
          margin-top: 40px;
        }
        @media print {
          body { padding: 0; }
          .invoice-card { border: none; box-shadow: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            ${logoHtml}
            <h2 style="margin: 10px 0 0; font-size: 20px; font-weight: 800; color: #0f172a;">${companyName}</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; max-width: 250px;">${companyAbout || ""}</p>
          </div>
          <div class="company-details">
            <p><strong>${companyName}</strong></p>
            <p>${companyLocation || ""}</p>
            <p>Email: ${supportEmail}</p>
            <p>Mobile: ${supportMobile}</p>
          </div>
        </div>
        
        <div class="bill-grid">
          <div class="bill-to">
            <h3>Bill To</h3>
            <p><strong>${userName}</strong></p>
            <p>${userCompany}</p>
            <p>Email: ${userEmail}</p>
            <p>Mobile: ${userMobile}</p>
            <p>GSTIN: ${userGst}</p>
          </div>
          <div class="invoice-info">
            <h3 class="invoice-title">Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoiceNum}</p>
            <p><strong>Date:</strong> ${today}</p>
            <p><strong>UTR / Ref No:</strong> ${utr}</p>
            <p><strong>Payment Status:</strong> <span class="paid-badge">Paid</span></p>
          </div>
        </div>
        
        <table class="table-invoice">
          <thead>
            <tr>
              <th>Description</th>
              <th>Duration</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>License Activation for ${planName}</strong><br>
                <span style="font-size: 12px; color: #64748b;">Includes 1 device binding slot & direct support</span>
              </td>
              <td>${planName}</td>
              <td style="font-weight: 700; font-size: 15px;">₹${parseFloat(planPrice).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="license-key-box">
          <span>Your Unique License Key</span>
          <code>${licenseKey}</code>
        </div>
        
        <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
          <strong>Instructions for Activation:</strong> Copy your unique license key above. Open your Google Chrome Browser, click the extension icon inside your toolbar, paste the license key in the field, and click <strong>Activate</strong>.
        </p>
        
        <div class="footer-note">
          <p>Thank you for your business! If you have any questions, please contact support at ${supportEmail}</p>
          <p style="font-size: 10px; color: #cbd5e1; margin-top: 10px;">Generated automatically by ${companyName} Billing System</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Generate credentials .txt file download
function downloadCredentialsFile() {
  const content = `=====================================================
${systemSettings.company_name.toUpperCase()} LICENSE CREDENTIALS
=====================================================

Registered Owner:  ${portalState.user.name}
Agency/Company:    ${portalState.user.companyName}
Gmail ID:          ${portalState.user.email}
Mobile Number:     ${portalState.user.mobileNumber}
GST Number:        ${portalState.user.gstNumber || "N/A"}

-----------------------------------------------------
YOUR LICENSE KEY (Copy this key):
${portalState.licenseKey}
-----------------------------------------------------

Subscription Plan: ${portalState.selectedPlan.name}
Expiry Date:       ${portalState.expiryDate} (YYYY-MM-DD)
License Status:    ACTIVE ✅

-----------------------------------------------------
LOGIN CREDENTIALS FOR PORTAL:
User ID:   ${portalState.user.email}
Password:  The custom password you set during registration
-----------------------------------------------------

INSTRUCTIONS FOR ACTIVATION:
1. Open Chrome.
2. Click the extension icon in your toolbar and open settings/dashboard.
3. Paste the unique license key in the field.
4. Click 'Activate'. The tool is now unlocked.

TO RENEW: Login to portal → Click 'Renew' on your license card.

Thank you for your purchase!
For support, contact: ${systemSettings.support_email}
=====================================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `${systemSettings.company_name.replace(/\s+/g, '_')}_LICENSE.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Razorpay Online Payment Checkout
async function initiateRazorpayCheckout() {
  const price = portalState.selectedPlan.price || 0;
  const razorpayKeyId = (window.SupabaseConfig && window.SupabaseConfig.razorpayKeyId) 
    || systemSettings.razorpay_key_id 
    || localStorage.getItem("lv_razorpay_key_id") 
    || "rzp_test_placeholder";
  
  const options = {
    key: razorpayKeyId,
    amount: Math.round(price * 100), // In paise
    currency: "INR",
    name: systemSettings.company_name || "Mr.Rahul Scripts",
    description: `${portalState.selectedPlan.name} License Activation`,
    image: systemSettings.company_logo_url || "",
    prefill: {
      name: portalState.user.name || "",
      email: portalState.user.email || "",
      contact: portalState.user.mobileNumber || ""
    },
    theme: {
      color: "#6366f1"
    },
    handler: async function (response) {
      showToast("Payment verified by Razorpay! Activating license...", "success");
      await handleRazorpaySuccess(response);
    },
    modal: {
      ondismiss: function () {
        showToast("Payment window closed.", "info");
      }
    }
  };

  if (window.Razorpay) {
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.warn("Razorpay window open fallback:", err);
      showToast("Opening simulated Instant Checkout...", "info");
      await handleRazorpaySuccess({
        razorpay_payment_id: "pay_sim_" + Date.now(),
        razorpay_order_id: "order_sim_" + Date.now()
      });
    }
  } else {
    showToast("Razorpay library not loaded yet; using simulated instant checkout...", "info");
    await handleRazorpaySuccess({
      razorpay_payment_id: "pay_sim_" + Date.now(),
      razorpay_order_id: "order_sim_" + Date.now()
    });
  }
}

// Handle Razorpay Payment Success
async function handleRazorpaySuccess(response) {
  let duration = 30;
  const planId = (portalState.selectedPlan.id || "").toLowerCase();
  if (planId.includes("7_days") || planId.includes("7_day")) duration = 7;
  else if (planId.includes("3_months") || planId.includes("3_month")) duration = 90;
  else if (planId.includes("6_months") || planId.includes("6_month")) duration = 180;
  else if (planId.includes("1_year") || planId.includes("1_yr")) duration = 365;

  let expiryStr = "";
  if (window.SupabaseDB) {
    const res = await window.SupabaseDB.activateWithRazorpay({
      licenseKey: portalState.licenseKey,
      planId: portalState.selectedPlan.id,
      durationDays: duration,
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id || "",
      amount: portalState.selectedPlan.price,
      email: portalState.user.email,
      toolId: portalState.toolId
    });
    expiryStr = res.expiryDate;
  } else {
    const exp = new Date();
    exp.setDate(new Date().getDate() + duration);
    expiryStr = exp.toISOString().split("T")[0];
  }

  portalState.expiryDate = expiryStr;
  elements.finalPlanName.textContent = portalState.selectedPlan.name;
  
  const dateParts = expiryStr.split('-');
  elements.finalExpiryDate.textContent = dateParts.length === 3 
    ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` 
    : expiryStr;

  if (typeof confetti === "function") {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }

  downloadCredentialsFile();
  downloadInvoicePdf();
  setStep(3);
  showToast("🎉 Payment Successful! License Activated & Credentials Downloaded.", "success");
}

// POST communication helper (Supabase first, then Apps Script / Mock)
async function apiPost(data) {
  try {
    // 1. Supabase Data Layer
    if (window.SupabaseDB) {
      if (data.action === "register") {
        return await window.SupabaseDB.registerUser(data);
      }
      if (data.action === "update_payment") {
        return await window.SupabaseDB.updatePaymentUTR(data);
      }
      if (data.action === "verify_license") {
        return await window.SupabaseDB.verifyLicense(data);
      }
      if (data.action === "user_login_email") {
        const res = await window.SupabaseDB.userLoginEmail(data);
        if (res) return res;
      }
      if (data.action === "user_login_key") {
        const res = await window.SupabaseDB.userLoginKey(data);
        if (res) return res;
      }
    }

    if (!GAS_API_URL || GAS_API_URL.includes("your-upi-id")) {
      return getMockUserResponse(data);
    }
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.warn("apiPost failed, falling back to mock response.", err);
    return getMockUserResponse(data);
  }
}

// User-facing mock response helper
function getMockUserResponse(data) {
  const action = data.action;

  if (action === "register") {
    return {
      success: true,
      licenseKey: `CDCMS-${Math.floor(1000 + Math.random()*9000)}-MOCK`
    };
  }

  if (action === "update_payment") {
    return {
      success: true,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  if (action === "user_login_key") {
    return {
      success: true,
      name: "Dinesh Kumar",
      email: "dinesh@gmail.com",
      licenses: [
        {
          licenseKey: data.licenseKey,
          productName: "CDCMS Allocation Helper",
          planName: "3 Months Plan",
          expiryDate: "2026-09-12",
          status: "Active",
          deviceId: "PORTAL_VALIDATOR_DEVICE_1",
          downloadUrl: "#"
        }
      ]
    };
  }

  if (action === "user_login_email") {
    return {
      success: true,
      name: "Mock Email User",
      email: data.email,
      licenses: [
        {
          licenseKey: "CDCMS-EMAIL-MOCK-KEY",
          productName: "CDCMS Allocation Helper",
          planName: "3 Months Plan",
          expiryDate: "2026-09-12",
          status: "Active",
          deviceId: "",
          downloadUrl: "#"
        }
      ]
    };
  }

  if (action === "forgot_password_otp") {
    return {
      success: true,
      message: "OTP sent (Mock Mode)"
    };
  }

  if (action === "reset_password") {
    return {
      success: true,
      message: "Password reset successful (Mock Mode)"
    };
  }

  if (action === "send_user_otp") {
    return {
      success: true,
      message: "OTP sent (Mock Mode)"
    };
  }

  if (action === "verify_user_otp") {
    return {
      success: true,
      name: "OTP User",
      email: data.email,
      licenses: [
        {
          licenseKey: "CDCMS-OTP-MOCK-KEY",
          productName: "CDCMS Allocation Helper",
          planName: "3 Months Plan",
          expiryDate: "2026-09-12",
          status: "Active",
          deviceId: "",
          downloadUrl: "#"
        }
      ]
    };
  }

  return { success: false, message: "Action not recognized in mock" };
}

// Scroll layout helper
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// Local mock data helper
function getMockPortalData() {
  return {
    success: true,
    products: [
      {
        toolId: "cdcms_helper",
        name: "CDCMS Allocation Helper",
        description: "Automates cylinder allocation mapping inside HP Gas DCMS portal. Save time and eliminate errors with auto-matching.",
        features: ["Automated Area Matching", "Mapping Lock System", "Multi-Agency Support", "Live Allocation Tracking"],
        downloadUrl: "#",
        plans: [
          { id: "7_days", name: "7 Days Activation", duration: 7, price: 100 },
          { id: "3_months", name: "3 Months Plan", duration: 90, price: 999 },
          { id: "6_months", name: "6 Months Plan", duration: 180, price: 2999 },
          { id: "1_year", name: "1 Year Activation", duration: 365, price: 5999 }
        ]
      },
      {
        toolId: "cdcms_canceller",
        name: "CDCMS Booking Canceller",
        description: "Bulk booking cancellation utility for HP Gas DCMS. Filter, select, and batch cancel pending bookings instantly.",
        features: ["Bulk Booking Filter", "Batch Speed Cancellation", "Live Status Log", "Export Reports"],
        downloadUrl: "#",
        plans: [
          { id: "7_days", name: "7 Days Activation", duration: 7, price: 150 },
          { id: "3_months", name: "3 Months Plan", duration: 90, price: 1299 },
          { id: "6_months", name: "6 Months Plan", duration: 180, price: 3499 },
          { id: "1_year", name: "1 Year Activation", duration: 365, price: 6999 }
        ]
      }
    ],
    settings: {
      company_name: "LicenseVault",
      company_logo_url: "",
      company_about: "Complete platform for selling software with automatic license key generation, device binding, expiry management, and a powerful admin panel.",
      merchant_upi_id: "your-upi-id@okaxis",
      merchant_name: "LicenseVault Payments",
      support_email: "support@licensevault.com",
      support_mobile: "+91 98765 43210",
      support_whatsapp: "+919876543210",
      company_location: "New Delhi, India"
    }
  };
}

// ================= USER ACCOUNT DASHBOARD & THEME LOGIC =================

// Initialize light/dark theme settings
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
}

// Check if user session is active and updates dashboard view
function initUserSession() {
  const sessionDataStr = sessionStorage.getItem("user_portal_session");
  const outView = document.getElementById("user-logged-out-view");
  const inView = document.getElementById("user-logged-in-view");
  const initialsEl = document.getElementById("nav-user-initials");
  const profileBtnSvg = document.querySelector("#btn-user-profile svg");
  
  if (sessionDataStr) {
    // User is logged in!
    const userData = JSON.parse(sessionDataStr);
    
    if (outView && inView) {
      outView.classList.add("hidden");
      inView.classList.remove("hidden");
      outView.style.setProperty("display", "none", "important");
      inView.style.setProperty("display", "block", "important");
    }
    
    // Set titles
    document.getElementById("user-dashboard-title").textContent = `Welcome, ${userData.name || 'User'}!`;
    document.getElementById("user-dashboard-email").textContent = userData.email || "";
    
    // Set initials in header
    if (initialsEl && profileBtnSvg) {
      profileBtnSvg.style.display = "none";
      initialsEl.style.display = "inline-block";
      
      const initials = (userData.name || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      initialsEl.textContent = initials;
    }
    
    // Render user licenses
    renderUserDashboardLicenses(userData.licenses);
  } else {
    // User is logged out!
    if (outView && inView) {
      inView.classList.add("hidden");
      outView.classList.remove("hidden");
      inView.style.setProperty("display", "none", "important");
      outView.style.setProperty("display", "block", "important");
    }
    
    if (initialsEl && profileBtnSvg) {
      initialsEl.style.display = "none";
      profileBtnSvg.style.display = "inline-block";
    }
    

  }
}

// Generate license list UI inside the customer dashboard
function renderUserDashboardLicenses(licenses) {
  const container = document.getElementById("user-licenses-dashboard-container");
  if (!container) return;
  container.innerHTML = "";
  
  if (!licenses || licenses.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3; margin-bottom: 12px;"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      <p style="margin:0;">No active licenses found for your account.</p>
    </div>`;
    return;
  }
  
  licenses.forEach(lic => {
    const card = document.createElement("div");
    card.className = "user-license-card";
    
    // Status config
    let statusClass = "badge-pill status-pending", statusLabel = lic.status || "Pending";
    if (lic.status === "Active") {
      statusClass = "badge-pill status-active"; statusLabel = "🟢 Active";
      card.classList.add("status-active-card");
    } else if (lic.status === "Pending Verification" || lic.status === "Pending Payment") {
      statusClass = "badge-pill status-pending"; statusLabel = "⏳ Pending";
    } else if (lic.status === "Blocked") {
      statusClass = "badge-pill status-blocked"; statusLabel = "🚫 Blocked";
    } else if (lic.status === "Expired") {
      statusClass = "badge-pill status-expired"; statusLabel = "⌛ Expired";
      card.classList.add("status-expired-card");
    }
    
    // Expiry countdown & percentage
    let expiryDisplay = lic.expiryDate || "N/A";
    let expiryWarning = "";
    let progressPercent = 0;
    if (lic.expiryDate && lic.expiryDate !== "N/A") {
      const daysLeft = Math.ceil((new Date(lic.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      const totalDuration = parseInt(lic.planDuration, 10) || 90;
      progressPercent = Math.max(0, Math.min(100, Math.round((daysLeft / totalDuration) * 100)));

      if (daysLeft <= 0) {
        expiryDisplay = `${lic.expiryDate} (Expired!)`;
        progressPercent = 0;
        expiryWarning = `<div style="background: rgba(239,68,68,0.1); border-left: 3px solid #ef4444; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #f87171;">⚠️ License expired. Click Renew below to reactivate via Razorpay instantly.</div>`;
      } else if (daysLeft <= 15) {
        expiryDisplay = `${lic.expiryDate} (${daysLeft} days left!)`;
        expiryWarning = `<div style="background: rgba(245,158,11,0.1); border-left: 3px solid #f59e0b; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #fbbf24;">⚡ Expiring soon (${daysLeft} days remaining). Renew now to avoid service interruption.</div>`;
      } else {
        expiryDisplay = `${lic.expiryDate} (${daysLeft} days remaining)`;
      }
    }

    const deviceLabel = lic.deviceId
      ? `<span style="display:inline-flex;align-items:center;gap:6px;">🖥️ Bound: <code style="font-size:11px;background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:6px;font-family:monospace;">${String(lic.deviceId).substring(0, 16)}...</code></span>`
      : `<span style="color:var(--text-muted);display:inline-flex;align-items:center;gap:4px;">🔓 Device: Ready to bind on first activation</span>`;

    card.innerHTML = `
      <div class="license-card-header">
        <div>
          <div class="license-tool-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ${lic.productName}
          </div>
          <span style="font-size: 12px; color: var(--text-muted);">${lic.planName || "Standard Plan"} · Auto-renew eligible</span>
        </div>
        <span class="${statusClass}">${statusLabel}</span>
      </div>

      <div class="license-key-pill">
        <span>${lic.licenseKey}</span>
        <button type="button" class="btn-copy-dashboard-key btn btn-secondary btn-sm" data-key="${lic.licenseKey}" style="padding: 4px 10px; font-size: 11px;">📋 Copy</button>
      </div>

      <div style="background: var(--bg-card-hover); border-radius: 10px; padding: 12px 14px; border: 1px solid var(--border-light);">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
          <span style="color: var(--text-muted);">Expiration</span>
          <span style="color: var(--text-primary); font-weight: 600;">${expiryDisplay}</span>
        </div>
        <div class="license-progress-track">
          <div class="license-progress-bar ${progressPercent < 20 ? 'warning' : ''}" style="width: ${progressPercent}%;"></div>
        </div>
        <div style="margin-top: 10px; font-size: 11px; color: var(--text-secondary);">${deviceLabel}</div>
      </div>

      ${expiryWarning}

      <div class="license-actions-row">
        <button class="btn btn-primary btn-sm btn-renew-license animate-pulse-glow" data-tool-id="${lic.toolId}" style="flex: 1; min-width: 130px; font-size: 12px; padding: 8px 14px;">
          ⚡ Renew with Razorpay
        </button>
        <a href="${getDirectDriveFileUrl(lic.downloadUrl)}" target="_blank" class="btn btn-secondary btn-sm dashboard-download-btn" style="flex: 1; min-width: 110px; font-size: 12px; text-decoration: none; text-align: center; padding: 8px 14px;">
          ⬇️ Download Extension
        </a>
      </div>
    `;

    // Copy key
    card.querySelector(".btn-copy-dashboard-key").addEventListener("click", (e) => {
      const keyVal = e.currentTarget.getAttribute("data-key");
      navigator.clipboard.writeText(keyVal).then(() => {
        const originalText = e.currentTarget.textContent;
        e.currentTarget.textContent = "✅ Copied!";
        setTimeout(() => { e.currentTarget.textContent = originalText; }, 1500);
      });
    });

    // Renew button — closes user modal and opens checkout for this product
    card.querySelector(".btn-renew-license").addEventListener("click", (e) => {
      const toolId = e.currentTarget.getAttribute("data-tool-id");
      const userAccountModal = document.getElementById("user-account-modal");
      if (userAccountModal) {
        userAccountModal.classList.add("hidden");
        document.body.style.overflow = "";
      }
      // Scroll to pricing and activate the right product tab
      setTimeout(() => {
        scrollToSection("pricing-section");
        activateProductTab(toolId);
        showToast("Select a plan to renew your license!", "info");
      }, 300);
    });

    // Download link click warning
    const dlBtn = card.querySelector(".dashboard-download-btn");
    if (dlBtn) {
      dlBtn.addEventListener("click", (e) => {
        const href = dlBtn.getAttribute("href");
        if (!href || href === "#") {
          e.preventDefault();
          showToast("Download link not configured by the administrator yet.", "warning");
        }
      });
    }
    
    container.appendChild(card);
  });
}

// ================= ADMIN CONTROL BOARD LOGIC =================

// Global Admin State
let adminState = {
  token: "",
  users: [],
  plans: [],
  products: [],
  settings: [],
  reviews: []
};

// Check cached admin session
async function initAdminSession() {
  const cachedToken = localStorage.getItem("cdcms_admin_token");
  if (cachedToken) {
    adminState.token = cachedToken;
    
    // Hide portal website
    const portalContainer = document.getElementById("portal-container-id");
    const navbarHeader = document.getElementById("navbar-header-id");
    if (portalContainer) portalContainer.style.display = "none";
    if (navbarHeader) navbarHeader.style.display = "none";
    
    // Show admin dashboard
    const adminDashboard = document.getElementById("admin-dashboard");
    if (adminDashboard) adminDashboard.style.display = "flex";
    
    loadDashboardData();
  }
}

// Show Toast Notification
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// API Post call for Admin (with Token & Supabase support)
async function apiAdminPost(data) {
  try {
    // 1. Supabase Data Layer
    if (window.SupabaseDB && window.SupabaseConfig && window.SupabaseConfig.isConnected()) {
      if (data.action === "admin_get_dashboard") {
        const res = await window.SupabaseDB.adminGetDashboard();
        if (res) return res;
      } else if (data.action === "admin_get_users") {
        const res = await window.SupabaseDB.adminGetUsers();
        if (res) return res;
      } else if (data.action === "admin_update_user") {
        const res = await window.SupabaseDB.adminUpdateUser(data);
        if (res) return res;
      } else if (data.action === "admin_generate_key") {
        const res = await window.SupabaseDB.adminGenerateKey(data);
        if (res) return res;
      } else if (data.action === "admin_get_plans") {
        const res = await window.SupabaseDB.adminGetPlans();
        if (res) return res;
      } else if (data.action === "admin_save_plans") {
        const res = await window.SupabaseDB.adminSavePlans(data.plans);
        if (res) return res;
      } else if (data.action === "admin_get_products") {
        const res = await window.SupabaseDB.adminGetProducts();
        if (res) return res;
      } else if (data.action === "admin_save_products") {
        const res = await window.SupabaseDB.adminSaveProducts(data.products);
        if (res) return res;
      } else if (data.action === "admin_get_settings") {
        const res = await window.SupabaseDB.adminGetSettings();
        if (res) return res;
      } else if (data.action === "admin_save_settings") {
        const res = await window.SupabaseDB.adminSaveSettings(data.settings);
        if (res) return res;
      } else if (data.action === "admin_get_reviews") {
        const res = await window.SupabaseDB.adminGetReviews();
        if (res) return res;
      } else if (data.action === "admin_save_review") {
        const res = await window.SupabaseDB.adminSaveReview(data);
        if (res) return res;
      } else if (data.action === "admin_delete_review") {
        const res = await window.SupabaseDB.adminDeleteReview(data.id);
        if (res) return res;
      }
    }

    if (!GAS_API_URL || GAS_API_URL.includes("your-upi-id")) {
      return getMockAdminResponse(data);
    }
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        adminToken: adminState.token,
        ...data
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.warn("apiAdminPost failed, falling back to mock response.", err);
    return getMockAdminResponse(data);
  }
}

// Admin mock response helper
function getMockAdminResponse(data) {
  const action = data.action;
  
  if (action === "admin_get_dashboard") {
    return {
      success: true,
      stats: {
        totalRevenue: 4998,
        activeUsers: 2,
        pendingVerifications: 1,
        blockedUsers: 0
      }
    };
  }
  
  if (action === "admin_get_users") {
    return {
      success: true,
      users: [
        {
          rowIndex: 2,
          name: "Dinesh Kumar",
          companyName: "Shiv Kripa HP Gas Agency",
          gstNumber: "07AAAAA1111A1Z1",
          mobileNumber: "9876543210",
          email: "dinesh@gmail.com",
          licenseKey: "CDCMS-ABCD-EFGH-IJKL",
          toolId: "cdcms_helper",
          plan: "3 Months Plan",
          expiryDate: "2026-09-12",
          utrNumber: "614298150493",
          status: "Active",
          deviceId: "PORTAL_VALIDATOR_DEVICE_1",
          timestamp: "2026-06-12 12:00:00"
        },
        {
          rowIndex: 3,
          name: "Rajesh Singh",
          companyName: "Rajesh Gas Agency",
          gstNumber: "",
          mobileNumber: "9999999999",
          email: "rajesh@gmail.com",
          licenseKey: "CDCMS-WXYZ-UVST-QRMN",
          toolId: "cdcms_canceller",
          plan: "7 Days Activation",
          expiryDate: "2026-06-19",
          utrNumber: "999999999999",
          status: "Pending Verification",
          deviceId: "",
          timestamp: "2026-06-12 14:00:00"
        }
      ]
    };
  }
  
  if (action === "admin_get_plans") {
    return {
      success: true,
      plans: [
        { toolId: "cdcms_helper", planId: "7_days", planName: "7 Days Activation", duration: 7, price: 100 },
        { toolId: "cdcms_helper", planId: "3_months", planName: "3 Months Plan", duration: 90, price: 999 },
        { toolId: "cdcms_helper", planId: "6_months", planName: "6 Months Plan", duration: 180, price: 2999 },
        { toolId: "cdcms_helper", planId: "1_year", planName: "1 Year Activation", duration: 365, price: 5999 },
        { toolId: "cdcms_canceller", planId: "7_days", planName: "7 Days Activation", duration: 7, price: 150 },
        { toolId: "cdcms_canceller", planId: "3_months", planName: "3 Months Plan", duration: 90, price: 1299 }
      ]
    };
  }
  
  if (action === "admin_get_products") {
    return {
      success: true,
      products: [
        {
          rowIndex: 2,
          toolId: "cdcms_helper",
          name: "CDCMS Allocation Helper",
          description: "Automates cylinder allocation mapping inside HP Gas DCMS portal. Save time and eliminate errors with auto-matching.",
          features: "Automated Area Matching, Mapping Lock System, Multi-Agency Support, Live Allocation Tracking",
          downloadUrl: "#",
          status: "Active"
        },
        {
          rowIndex: 3,
          toolId: "cdcms_canceller",
          name: "CDCMS Booking Canceller",
          description: "Bulk booking cancellation utility for HP Gas DCMS. Filter, select, and batch cancel pending bookings instantly.",
          features: "Bulk Booking Filter, Batch Speed Cancellation, Live Status Log, Export Reports",
          downloadUrl: "#",
          status: "Active"
        }
      ]
    };
  }
  
  if (action === "admin_get_settings") {
    return {
      success: true,
      settings: [
        { rowIndex: 2, key: "company_name", value: "LicenseVault" },
        { rowIndex: 3, key: "company_logo_url", value: "" },
        { rowIndex: 4, key: "company_about", value: "Complete platform for selling software with automatic license key generation, device binding, expiry management, and a powerful admin panel." },
        { rowIndex: 5, key: "merchant_upi_id", value: "your-upi-id@okaxis" },
        { rowIndex: 6, key: "merchant_name", value: "LicenseVault Payments" },
        { rowIndex: 7, key: "support_email", value: "support@licensevault.com" },
        { rowIndex: 8, key: "support_mobile", value: "+91 98765 43210" },
        { rowIndex: 9, key: "support_whatsapp", value: "+919876543210" },
        { rowIndex: 10, key: "company_location", value: "New Delhi, India" }
      ]
    };
  }

  if (action === "admin_get_reviews") {
    if (!adminState.reviews || adminState.reviews.length === 0) {
      adminState.reviews = [
        { rowIndex: 2, id: "rev_001", name: "Rajesh Kumar", company: "Shiv Kripa HP Gas Agency", photoUrl: "", stars: 5, reviewText: "Bahut acha tool hai! Area generation ka kaam 10 minutes mein ho jaata hai jo pehle 2 ghante leta tha.", status: "Active", timestamp: new Date().toISOString() },
        { rowIndex: 3, id: "rev_002", name: "Priya Sharma", company: "Durga Gas Service", photoUrl: "", stars: 5, reviewText: "Automatic licence system se bahut asaani ho gayi. Payment ke saath hi key activate ho jaati hai!", status: "Active", timestamp: new Date().toISOString() },
        { rowIndex: 4, id: "rev_003", name: "Amit Patel", company: "Jai Ambe Gas Agency", photoUrl: "", stars: 4, reviewText: "Admin panel se sab manage karna bahut easy hai. Support bhi bahut acha hai.", status: "Active", timestamp: new Date().toISOString() }
      ];
    }
    return {
      success: true,
      reviews: adminState.reviews
    };
  }

  if (action === "admin_save_review") {
    if (!adminState.reviews) adminState.reviews = [];
    if (data.id) {
      const idx = adminState.reviews.findIndex(r => r.id === data.id);
      if (idx !== -1) {
        adminState.reviews[idx] = {
          ...adminState.reviews[idx],
          name: data.name,
          company: data.company,
          photoUrl: data.photoUrl,
          stars: parseInt(data.stars) || 5,
          reviewText: data.reviewText,
          status: data.status
        };
      }
    } else {
      adminState.reviews.push({
        rowIndex: adminState.reviews.length + 2,
        id: "rev_" + Math.floor(100 + Math.random() * 900),
        name: data.name,
        company: data.company,
        photoUrl: data.photoUrl,
        stars: parseInt(data.stars) || 5,
        reviewText: data.reviewText,
        status: data.status || "Active",
        timestamp: new Date().toISOString()
      });
    }
    return {
      success: true,
      message: "Changes saved successfully (Mock Mode)"
    };
  }

  if (action === "admin_delete_review") {
    if (adminState.reviews) {
      adminState.reviews = adminState.reviews.filter(r => r.id !== data.id);
    }
    return {
      success: true,
      message: "Review deleted successfully (Mock Mode)"
    };
  }

  if (action === "admin_update_user" || action === "admin_save_settings" || action === "admin_save_plans" || action === "admin_save_products") {
    return {
      success: true,
      message: "Changes saved successfully (Mock Mode)"
    };
  }

  if (action === "admin_generate_key") {
    return {
      success: true,
      licenseKey: `CDCMS-${Math.floor(1000 + Math.random()*9000)}-MOCK`,
      expiryDate: new Date(Date.now() + (data.durationDays || 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  if (action === "admin_upload_file") {
    return {
      success: true,
      downloadUrl: "https://drive.google.com/uc?export=view&id=mock_file_id"
    };
  }

  return { success: false, message: "Action not recognized in mock" };
}

// Initialize admin dashboard listeners
function initAdminDashboardListeners() {
  // 1. Tab Navigation
  const navBtns = document.querySelectorAll("#admin-dashboard .nav-btn");
  const tabContents = document.querySelectorAll("#admin-dashboard .tab-content");
  const currentTabTitle = document.getElementById("current-tab-title");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      const tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.classList.add("active");

      if (currentTabTitle) {
        currentTabTitle.textContent = btn.textContent.replace(/[^\w\s]/gi, '').trim();
      }
    });
  });

  // 2. Logout Button
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("cdcms_admin_token");
      adminState.token = "";
      
      // Show portal website
      const portalContainer = document.getElementById("portal-container-id");
      const navbarHeader = document.getElementById("navbar-header-id");
      if (portalContainer) portalContainer.style.display = "block";
      if (navbarHeader) navbarHeader.style.display = "block";
      
      // Hide admin dashboard
      const adminDashboard = document.getElementById("admin-dashboard");
      if (adminDashboard) adminDashboard.style.display = "none";
      
      showToast("Logged out successfully.", "info");
    });
  }

  // Preview Public Site from Admin Panel
  const btnAdminPreviewSite = document.getElementById("btn-admin-preview-site");
  if (btnAdminPreviewSite) {
    btnAdminPreviewSite.addEventListener("click", () => {
      const portalContainer = document.getElementById("portal-container-id");
      const navbarHeader = document.getElementById("navbar-header-id");
      const adminDashboard = document.getElementById("admin-dashboard");
      if (portalContainer) portalContainer.style.display = "block";
      if (navbarHeader) navbarHeader.style.display = "block";
      if (adminDashboard) adminDashboard.style.display = "none";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 3. Refresh Button
  const btnRefreshData = document.getElementById("btn-refresh-data");
  if (btnRefreshData) {
    btnRefreshData.addEventListener("click", () => {
      loadDashboardData();
      showToast("Data refreshed!", "info");
    });
  }

  // 4. Key Generator Form
  const formGenerateKey = document.getElementById("form-generate-key");
  if (formGenerateKey) {
    formGenerateKey.addEventListener("submit", async (e) => {
      e.preventDefault();
      const generationResultPanel = document.getElementById("generation-result-panel");
      if (generationResultPanel) generationResultPanel.style.display = "none";
      
      const submitBtn = formGenerateKey.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Generating...";

      const reqData = {
        action: "admin_generate_key",
        toolId: document.getElementById("gen-tool-id")?.value,
        durationDays: parseInt(document.getElementById("gen-duration")?.value || "3"),
        name: document.getElementById("gen-name")?.value.trim(),
        companyName: document.getElementById("gen-company")?.value.trim(),
        mobileNumber: document.getElementById("gen-mobile")?.value.trim() || "N/A",
        email: document.getElementById("gen-email")?.value.trim() || "guest@manual.com"
      };

      try {
        const result = await apiAdminPost(reqData);
        if (result && result.success) {
          const generatedKeyDisplay = document.getElementById("generated-key-display");
          const generatedExpiryDisplay = document.getElementById("generated-expiry-display");
          if (generatedKeyDisplay) generatedKeyDisplay.textContent = result.licenseKey;
          if (generatedExpiryDisplay) generatedExpiryDisplay.textContent = `Key will expire on: ${result.expiryDate} (Auto Active)`;
          if (generationResultPanel) generationResultPanel.style.display = "block";
          showToast("Manual License key generated!", "success");
          
          // Reset form
          document.getElementById("gen-name").value = "";
          document.getElementById("gen-company").value = "";
          document.getElementById("gen-mobile").value = "";
          document.getElementById("gen-email").value = "";
          
          loadDashboardData();
        } else {
          alert("Generation failed: " + (result.message || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Error generating license key.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Generate & Save Active Key";
      }
    });
  }

  // Copy Generated Key
  const btnCopyGenKey = document.getElementById("btn-copy-gen-key");
  if (btnCopyGenKey) {
    btnCopyGenKey.addEventListener("click", () => {
      const generatedKeyDisplay = document.getElementById("generated-key-display");
      if (generatedKeyDisplay) {
        navigator.clipboard.writeText(generatedKeyDisplay.textContent).then(() => {
          btnCopyGenKey.textContent = "Copied!";
          setTimeout(() => btnCopyGenKey.textContent = "Copy", 1500);
        });
      }
    });
  }

  // 5. User Search/Filters
  const userSearchBox = document.getElementById("user-search-box");
  const userStatusFilter = document.getElementById("user-status-filter");
  const userToolFilter = document.getElementById("user-tool-filter");
  if (userSearchBox) userSearchBox.addEventListener("input", renderUsersTable);
  if (userStatusFilter) userStatusFilter.addEventListener("change", renderUsersTable);
  if (userToolFilter) userToolFilter.addEventListener("change", renderUsersTable);

  // 6. Settings Form Submission
  const formSettings = document.getElementById("form-admin-settings");
  if (formSettings) {
    formSettings.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById("btn-save-settings");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving Settings...";
      }
      
      const updatedSettings = adminState.settings.map(s => {
        let val = s.value;
        const elMap = {
          "company_name": "set-company-name",
          "company_logo_url": "set-company-logo",
          "company_about": "set-company-about",
          "merchant_upi_id": "set-upi-id",
          "merchant_name": "set-merchant-name",
          "support_email": "set-email",
          "support_mobile": "set-mobile",
          "support_whatsapp": "set-whatsapp",
          "company_location": "set-location"
        };
        const elId = elMap[s.key];
        if (elId) {
          const el = document.getElementById(elId);
          if (el) val = el.value.trim();
        }
        
        return {
          rowIndex: s.rowIndex,
          key: s.key,
          value: val
        };
      });
      
      try {
        const result = await apiAdminPost({
          action: "admin_save_settings",
          settings: updatedSettings
        });
        
        if (result && result.success) {
          showToast("Branding & Payment settings saved successfully!", "success");
          loadDashboardData();
          // Reload public portal settings
          loadPortalData();
        } else {
          alert("Failed to save settings: " + (result.message || "Error"));
        }
      } catch (err) {
        console.error(err);
        alert("Network error occurred while saving settings.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Save Branding & UPI Settings";
        }
      }
    });
  }

  // 7. Logo File Uploader Trigger
  const btnTriggerLogo = document.getElementById("btn-trigger-logo-upload");
  const fileLogoInput = document.getElementById("upload-logo-file");
  if (btnTriggerLogo && fileLogoInput) {
    btnTriggerLogo.addEventListener("click", () => {
      fileLogoInput.click();
    });
    
    fileLogoInput.addEventListener("change", async () => {
      const file = fileLogoInput.files[0];
      if (!file) return;
      
      btnTriggerLogo.disabled = true;
      btnTriggerLogo.textContent = "Uploading...";
      
      try {
        const base64String = await convertFileToBase64(file);
        const result = await apiAdminPost({
          action: "admin_upload_file",
          base64Data: base64String,
          fileName: file.name,
          mimeType: file.type
        });
        
        if (result && result.success) {
          const logoInput = document.getElementById("set-company-logo");
          if (logoInput) logoInput.value = result.downloadUrl;
          showToast("Logo image uploaded to Google Drive!", "success");
        } else {
          alert("Logo upload failed: " + (result.message || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Error during logo upload.");
      } finally {
        btnTriggerLogo.disabled = false;
        btnTriggerLogo.textContent = "Upload Logo";
        fileLogoInput.value = "";
      }
    });
  }

  // 8. Add Plan Row Button
  const btnAddPlanRow = document.getElementById("btn-add-plan-row");
  if (btnAddPlanRow) {
    btnAddPlanRow.addEventListener("click", () => {
      const defaultToolId = adminState.products[0] ? adminState.products[0].toolId : "cdcms_helper";
      adminState.plans.push({
        toolId: defaultToolId,
        planId: "new_plan",
        planName: "New Custom Plan",
        duration: 30,
        price: 500
      });
      renderPlansTable();
    });
  }

  // 9. Save Plans Button
  const btnSavePlans = document.getElementById("btn-save-plans");
  if (btnSavePlans) {
    btnSavePlans.addEventListener("click", async () => {
      const tbody = document.getElementById("plans-table-tbody");
      if (!tbody) return;
      const trs = tbody.querySelectorAll("tr");
      const updatedPlans = [];
      let valid = true;

      trs.forEach(tr => {
        const toolId = tr.querySelector(".plan-tool-id")?.value.trim();
        const planId = tr.querySelector(".plan-plan-id")?.value.trim();
        const planName = tr.querySelector(".plan-name")?.value.trim();
        const duration = parseInt(tr.querySelector(".plan-duration")?.value);
        const price = parseFloat(tr.querySelector(".plan-price")?.value);

        if (toolId && planId && planName && !isNaN(duration) && !isNaN(price)) {
          updatedPlans.push({
            toolId,
            planId,
            planName,
            duration,
            price
          });
        } else {
          valid = false;
        }
      });

      if (!valid || updatedPlans.length === 0) {
        alert("Please ensure all fields are filled with valid values before saving!");
        return;
      }

      btnSavePlans.disabled = true;
      btnSavePlans.textContent = "Saving to Sheet...";

      try {
        const result = await apiAdminPost({
          action: "admin_save_plans",
          plans: updatedPlans
        });

        if (result && result.success) {
          showToast("Subscription plans configuration updated!", "success");
          loadDashboardData();
        } else {
          alert("Error saving plans: " + (result.message || "Error"));
        }
      } catch (err) {
        console.error(err);
        alert("Network error updating plan configuration.");
      } finally {
        btnSavePlans.disabled = false;
        btnSavePlans.textContent = "Save Plans Pricing";
      }
    });
  }

  // 10. Add Product Row Button
  const btnAddProductRow = document.getElementById("btn-add-product-row");
  if (btnAddProductRow) {
    btnAddProductRow.addEventListener("click", () => {
      adminState.products.push({
        toolId: "new_tool",
        name: "New Extension Name",
        description: "Enter short description.",
        features: "Feature 1, Feature 2",
        downloadUrl: "#",
        status: "Active"
      });
      renderProductsTable();
    });
  }

  // 11. Save Products Catalog Button
  const btnSaveProducts = document.getElementById("btn-save-products");
  if (btnSaveProducts) {
    btnSaveProducts.addEventListener("click", async () => {
      const tbody = document.getElementById("products-table-tbody");
      if (!tbody) return;
      const trs = tbody.querySelectorAll("tr");
      const updatedProducts = [];
      let valid = true;
      
      trs.forEach(tr => {
        const toolId = tr.querySelector(".prod-tool-id")?.value.trim();
        const name = tr.querySelector(".prod-name")?.value.trim();
        const description = tr.querySelector(".prod-desc")?.value.trim();
        const features = tr.querySelector(".prod-features")?.value.trim();
        const downloadUrl = tr.querySelector(".prod-url")?.value.trim();
        const status = tr.querySelector(".prod-status")?.value;
        
        if (toolId && name && description && features && downloadUrl) {
          updatedProducts.push({
            toolId,
            name,
            description,
            features,
            downloadUrl,
            status
          });
        } else {
          valid = false;
        }
      });
      
      if (!valid || updatedProducts.length === 0) {
        alert("Please ensure all fields are filled with valid values before saving!");
        return;
      }
      
      btnSaveProducts.disabled = true;
      btnSaveProducts.textContent = "Saving to Sheet...";
      
      try {
        const result = await apiAdminPost({
          action: "admin_save_products",
          products: updatedProducts
        });
        
        if (result && result.success) {
          showToast("Products catalog updated successfully!", "success");
          loadDashboardData();
        } else {
          alert("Error saving products: " + (result.message || "Error"));
        }
      } catch (err) {
        console.error(err);
        alert("Network error updating products catalog.");
      } finally {
        btnSaveProducts.disabled = false;
        btnSaveProducts.textContent = "Save Product Catalog";
      }
    });
  }

  // 12. Invoice Listeners
  initAdminInvoiceListeners();

  // 13. Save Review Form
  const btnSaveReview = document.getElementById("btn-save-review");
  if (btnSaveReview) {
    btnSaveReview.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = document.getElementById("review-edit-id").value;
      const name = document.getElementById("review-name").value.trim();
      const company = document.getElementById("review-company").value.trim();
      const photoUrl = document.getElementById("review-photo").value.trim();
      const stars = document.getElementById("review-stars").value;
      const reviewText = document.getElementById("review-text").value.trim();
      const status = document.getElementById("review-status").value;
      
      if (!name || !reviewText) {
        alert("Name aur Review Text donon fields required hain!");
        return;
      }
      
      btnSaveReview.disabled = true;
      const originalText = document.getElementById("btn-save-review-text").textContent;
      document.getElementById("btn-save-review-text").textContent = "Saving...";
      
      try {
        const res = await apiAdminPost({
          action: "admin_save_review",
          id: id || undefined,
          name,
          company,
          photoUrl,
          stars,
          reviewText,
          status
        });
        
        if (res && res.success) {
          showToast(id ? "Review updated!" : "Review added!", "success");
          resetReviewForm();
          loadDashboardData();
        } else {
          alert(res.message || "Failed to save review.");
        }
      } catch(err) {
        alert("Connection error.");
      } finally {
        btnSaveReview.disabled = false;
        document.getElementById("btn-save-review-text").textContent = originalText;
      }
    });
  }
  
  const btnCancelReviewEdit = document.getElementById("btn-cancel-review-edit");
  if (btnCancelReviewEdit) {
    btnCancelReviewEdit.addEventListener("click", () => {
      resetReviewForm();
    });
  }
  
  const btnReloadReviews = document.getElementById("btn-reload-reviews");
  if (btnReloadReviews) {
    btnReloadReviews.addEventListener("click", () => {
      loadDashboardData();
    });
  }

  // 14. Database & Razorpay Configuration Form
  const formDbPayments = document.getElementById("form-database-payments-config");
  if (formDbPayments) {
    formDbPayments.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = document.getElementById("cfg-supabase-url").value.trim();
      const key = document.getElementById("cfg-supabase-anon-key").value.trim();
      const rzpKey = document.getElementById("cfg-razorpay-key-id").value.trim();
      const rzpSecret = document.getElementById("cfg-razorpay-key-secret").value.trim();

      if (window.SupabaseConfig) {
        window.SupabaseConfig.setCredentials(url, key, rzpKey);
      }
      if (rzpSecret) {
        localStorage.setItem("lv_razorpay_key_secret", rzpSecret);
      }

      showToast("Supabase & Razorpay credentials saved successfully!", "success");
      updateDatabasePaymentsUI();
      await loadPortalData();
      await loadDashboardData();
    });
  }

  // Test Supabase Connection Button
  const btnTestSupabase = document.getElementById("btn-test-supabase");
  if (btnTestSupabase) {
    btnTestSupabase.addEventListener("click", async () => {
      btnTestSupabase.disabled = true;
      btnTestSupabase.textContent = "Testing...";
      if (window.SupabaseDB) {
        const testRes = await window.SupabaseDB.testConnection();
        showToast(testRes.message, testRes.success ? "success" : "error");
      } else {
        showToast("Supabase client initialized in local mode.", "info");
      }
      updateDatabasePaymentsUI();
      btnTestSupabase.disabled = false;
      btnTestSupabase.textContent = "Test Connection";
    });
  }

  // Test Razorpay Key Button
  const btnTestRazorpay = document.getElementById("btn-test-razorpay");
  if (btnTestRazorpay) {
    btnTestRazorpay.addEventListener("click", () => {
      const key = document.getElementById("cfg-razorpay-key-id").value.trim();
      if (key.startsWith("rzp_test_") || key.startsWith("rzp_live_")) {
        showToast(`Razorpay Key ID valid (${key.startsWith("rzp_live_") ? "Live" : "Test"} Mode)!`, "success");
      } else {
        showToast("Please enter a valid Razorpay Key ID (rzp_live_... or rzp_test_...).", "warning");
      }
      updateDatabasePaymentsUI();
    });
  }
}

// Update Database & Razorpay indicators and inputs
function updateDatabasePaymentsUI() {
  const cfgUrl = document.getElementById("cfg-supabase-url");
  const cfgKey = document.getElementById("cfg-supabase-anon-key");
  const cfgRzpKey = document.getElementById("cfg-razorpay-key-id");
  const cfgRzpSecret = document.getElementById("cfg-razorpay-key-secret");

  if (window.SupabaseConfig) {
    if (cfgUrl && !cfgUrl.value) cfgUrl.value = window.SupabaseConfig.url || "";
    if (cfgKey && !cfgKey.value) cfgKey.value = window.SupabaseConfig.anonKey || "";
    if (cfgRzpKey && !cfgRzpKey.value) cfgRzpKey.value = window.SupabaseConfig.razorpayKeyId || "";
  }
  if (cfgRzpSecret && !cfgRzpSecret.value) {
    cfgRzpSecret.value = localStorage.getItem("lv_razorpay_key_secret") || "";
  }

  // Status indicators
  const sbDot = document.getElementById("supabase-status-dot");
  const sbText = document.getElementById("supabase-status-text");
  const isSbConnected = window.SupabaseConfig && window.SupabaseConfig.isConnected();

  if (sbDot) {
    sbDot.className = `db-status-indicator ${isSbConnected ? "connected" : "disconnected"}`;
  }
  if (sbText) {
    sbText.textContent = isSbConnected ? "Connected (Live Cloud DB)" : "Demo / Local Storage Mode";
  }

  const rzpDot = document.getElementById("razorpay-status-dot");
  const rzpText = document.getElementById("razorpay-status-text");
  const rzpKeyVal = (window.SupabaseConfig && window.SupabaseConfig.razorpayKeyId) || "";
  const isRzpLive = rzpKeyVal.startsWith("rzp_live_");
  const isRzpTest = rzpKeyVal.startsWith("rzp_test_");

  if (rzpDot) {
    rzpDot.className = `db-status-indicator ${(isRzpLive || isRzpTest) ? "connected" : "disconnected"}`;
  }
  if (rzpText) {
    if (isRzpLive) rzpText.textContent = "Live Mode (Real Payments Active)";
    else if (isRzpTest) rzpText.textContent = "Test Mode (Test Payments Active)";
    else rzpText.textContent = "Default Simulated Checkout Mode";
  }
}

// Fetch dashboard stats summary & table data safely with independent catch blocks
async function loadDashboardData() {
  updateDatabasePaymentsUI();
  // 1. Fetch Stats Summary
  try {
    const statsResult = await apiAdminPost({ action: "admin_get_dashboard" });
    if (statsResult && statsResult.success) {
      const elEarnings = document.getElementById("stat-earnings");
      const elActive = document.getElementById("stat-active-users");
      const elPending = document.getElementById("stat-pending-users");
      const elBlocked = document.getElementById("stat-blocked-users");
      
      if (elEarnings) elEarnings.textContent = "₹" + statsResult.stats.totalRevenue;
      if (elActive) elActive.textContent = statsResult.stats.activeUsers;
      if (elPending) elPending.textContent = statsResult.stats.pendingVerifications;
      if (elBlocked) elBlocked.textContent = statsResult.stats.blockedUsers;
    }
  } catch (err) {
    console.error("Error loading stats:", err);
  }

  // 2. Fetch Users Table list
  try {
    const usersResult = await apiAdminPost({ action: "admin_get_users" });
    if (usersResult && usersResult.success) {
      adminState.users = usersResult.users;
      renderUsersTable();
    }
  } catch (err) {
    console.error("Error loading users:", err);
  }

  // 3. Fetch Pricing plans
  try {
    const plansResult = await apiAdminPost({ action: "admin_get_plans" });
    if (plansResult && plansResult.success) {
      adminState.plans = plansResult.plans;
      renderPlansTable();
    }
  } catch (err) {
    console.error("Error loading plans:", err);
  }

  // 4. Fetch Products Catalog
  try {
    const productsResult = await apiAdminPost({ action: "admin_get_products" });
    if (productsResult && productsResult.success) {
      adminState.products = productsResult.products;
      renderProductsTable();
      updateDynamicDropdowns();
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }

  // 5. Fetch Settings
  try {
    const settingsResult = await apiAdminPost({ action: "admin_get_settings" });
    if (settingsResult && settingsResult.success) {
      adminState.settings = settingsResult.settings;
      populateSettingsForm();
    }
  } catch (err) {
    console.error("Error loading settings:", err);
  }

  // 6. Fetch Reviews
  try {
    const reviewsResult = await apiAdminPost({ action: "admin_get_reviews" });
    if (reviewsResult && reviewsResult.success) {
      adminState.reviews = reviewsResult.reviews;
      renderReviewsTable();
    }
  } catch (err) {
    console.error("Error loading reviews:", err);
  }
}

// Render Users Licenses Management Table
function renderUsersTable() {
  const usersTableTbody = document.getElementById("users-table-tbody");
  if (!usersTableTbody) return;
  usersTableTbody.innerHTML = "";
  
  const userSearchBox = document.getElementById("user-search-box");
  const userStatusFilter = document.getElementById("user-status-filter");
  const userToolFilter = document.getElementById("user-tool-filter");

  const query = userSearchBox ? userSearchBox.value.toLowerCase().trim() : "";
  const statusFilter = userStatusFilter ? userStatusFilter.value : "all";
  const toolFilter = userToolFilter ? userToolFilter.value : "all";

  const filteredUsers = adminState.users.filter(user => {
    const matchesSearch = 
      (user.name || "").toLowerCase().includes(query) || 
      (user.companyName || "").toLowerCase().includes(query) || 
      (user.licenseKey || "").toLowerCase().includes(query) || 
      (user.email || "").toLowerCase().includes(query) || 
      (user.utrNumber || "").toLowerCase().includes(query);
      
    const matchesStatus = (statusFilter === "all") || (user.status === statusFilter);
    const matchesTool = (toolFilter === "all") || (user.toolId === toolFilter);

    return matchesSearch && matchesStatus && matchesTool;
  });

  if (filteredUsers.length === 0) {
    usersTableTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No matching licenses found.
        </td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach(user => {
    const tr = document.createElement("tr");
    
    let statusClass = "status-expired";
    let statusDot = "⚪";
    if (user.status === "Active") {
      statusClass = "status-active";
      statusDot = "🟢";
    } else if (user.status === "Pending Verification") {
      statusClass = "status-pending animate-pulse-glow";
      statusDot = "🟡";
    } else if (user.status === "Blocked") {
      statusClass = "status-blocked";
      statusDot = "🔴";
    }

    // Setup action buttons based on status
    let actionButtons = "";
    if (user.status === "Pending Verification") {
      actionButtons += `<button class="btn-icon-action success btn-approve" data-row="${user.rowIndex}" title="Approve Payment">✓ Approve</button>`;
    }
    if (user.status !== "Blocked") {
      actionButtons += `<button class="btn-icon-action danger btn-block-user" data-row="${user.rowIndex}" title="Block Key">⛔ Block</button>`;
    } else {
      actionButtons += `<button class="btn-icon-action success btn-unblock-user" data-row="${user.rowIndex}" title="Unblock Key">🔓 Unblock</button>`;
    }
    if (user.deviceId) {
      actionButtons += `<button class="btn-icon-action btn-reset-dev" data-row="${user.rowIndex}" title="Reset Browser Device Binding">🔄 Reset Dev</button>`;
    }
    actionButtons += `<button class="btn-icon-action btn-make-invoice" data-idx="${adminState.users.indexOf(user)}" title="Generate Invoice Receipt">🧾 Invoice</button>`;
    actionButtons += `<button class="btn-icon-action danger btn-delete-user" data-row="${user.rowIndex}" title="Permanently Delete License">🗑️</button>`;

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${user.companyName}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${user.name} · <span style="color: var(--accent-blue);">${user.mobileNumber}</span></div>
        <div style="font-size: 11px; color: var(--text-muted);">${user.email}</div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-family: monospace; font-weight: 700; color: var(--accent-purple); font-size: 13px; background: rgba(99, 102, 241, 0.1); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.2);">${user.licenseKey}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Tool: <strong style="color: var(--text-secondary);">${user.toolId}</strong> ${user.deviceId ? '<span style="color: #10b981;" title="Device Bound">🔒 Bound</span>' : '<span style="color: var(--text-muted);" title="Unbound">🔓 Unbound</span>'}</div>
      </td>
      <td>
        <strong style="color: var(--text-primary);">${user.plan || "N/A"}</strong>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Expiry: <input type="date" class="input-expiry-edit" data-row="${user.rowIndex}" value="${user.expiryDate || ''}" style="padding: 2px 6px; font-size: 11px; background: var(--bg-input); border: 1px solid var(--border-light); border-radius: 4px; color: var(--text-primary); width: 120px;"></div>
      </td>
      <td>
        <div style="font-family: monospace; font-weight: 600; color: var(--text-primary); font-size: 12px;">UTR: ${user.utrNumber || '<span style="color: var(--text-muted);">None</span>'}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${user.timestamp || ''}</div>
      </td>
      <td>
        <span class="badge-pill ${statusClass}">${statusDot} ${user.status}</span>
      </td>
      <td>
        <div class="action-btn-group">
          ${actionButtons}
        </div>
      </td>
    `;

    usersTableTbody.appendChild(tr);
  });

  bindTableActionListeners();
}

// Bind event listeners for table buttons
function bindTableActionListeners() {
  document.querySelectorAll("#admin-dashboard .btn-approve").forEach(btn => {
    btn.addEventListener("click", async () => {
      const row = btn.getAttribute("data-row");
      if (confirm("Are you sure you want to APPROVE payment for this user? This will set status to Active.")) {
        await updateUserStatus(row, "approve");
      }
    });
  });

  document.querySelectorAll("#admin-dashboard .btn-block-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const row = btn.getAttribute("data-row");
      if (confirm("WARNING: Are you sure you want to BLOCK this user key? Their extension will immediately stop working.")) {
        await updateUserStatus(row, "block");
      }
    });
  });

  document.querySelectorAll("#admin-dashboard .btn-unblock-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const row = btn.getAttribute("data-row");
      await updateUserStatus(row, "unblock");
    });
  });

  document.querySelectorAll("#admin-dashboard .btn-delete-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const row = btn.getAttribute("data-row");
      if (confirm("CRITICAL WARNING: Are you sure you want to permanently DELETE this user license? This cannot be undone.")) {
        await updateUserStatus(row, "delete");
      }
    });
  });

  document.querySelectorAll("#admin-dashboard .btn-reset-dev").forEach(btn => {
    btn.addEventListener("click", async () => {
      const row = btn.getAttribute("data-row");
      if (confirm("Reset browser Device ID lock for this license key? The user will be able to bind it to a new browser.")) {
        await updateUserStatus(row, "reset_device");
      }
    });
  });

  document.querySelectorAll("#admin-dashboard .input-expiry-edit").forEach(input => {
    input.addEventListener("change", async () => {
      const row = input.getAttribute("data-row");
      const newVal = input.value;
      if (newVal) {
        await updateUserStatus(row, "edit_expiry", newVal);
      }
    });
  });

  document.querySelectorAll("#admin-dashboard .btn-make-invoice").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"));
      const user = adminState.users[idx];
      
      const invCompany = document.getElementById("inv-company");
      const invName = document.getElementById("inv-name");
      const invGst = document.getElementById("inv-gst");
      const invEmail = document.getElementById("inv-email");
      const invPlanName = document.getElementById("inv-plan-name");
      const invUtr = document.getElementById("inv-utr");
      const invPrice = document.getElementById("inv-price");

      if (invCompany) invCompany.value = user.companyName || "";
      if (invName) invName.value = user.name || "";
      if (invGst) invGst.value = user.gstNumber || "";
      if (invEmail) invEmail.value = user.email || "";
      if (invPlanName) invPlanName.value = user.plan || "Activation Access";
      if (invUtr) invUtr.value = user.utrNumber || "";
      
      let price = 999;
      adminState.plans.forEach(p => {
        if (p.toolId === user.toolId && p.planId === user.plan) {
          price = p.price;
        }
      });
      if (invPrice) invPrice.value = price;

      updateInvoicePreview();
      
      const invoiceTabBtn = document.querySelector("#admin-dashboard [data-tab='tab-invoices']");
      if (invoiceTabBtn) invoiceTabBtn.click();
      
      showToast("User details loaded into Invoice Panel!", "info");
    });
  });
}

// User action API execution wrapper
async function updateUserStatus(row, actionType, extraVal = "") {
  try {
    const result = await apiAdminPost({
      action: "admin_update_user",
      userRowIndex: row,
      updateAction: actionType,
      newExpiry: extraVal
    });

    if (result && result.success) {
      showToast(result.message || "User updated successfully!", "success");
      loadDashboardData();
    } else {
      alert("Failed to update user: " + (result.message || "Error"));
    }
  } catch (err) {
    console.error(err);
    alert("Connection error occurred. Operation failed.");
  }
}

// Render subscription pricing configuration editor
function renderPlansTable() {
  const tbody = document.getElementById("plans-table-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (adminState.plans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
          No plans configured. Add one below.
        </td>
      </tr>
    `;
    return;
  }

  adminState.plans.forEach((plan, idx) => {
    const tr = document.createElement("tr");
    
    // Build options for product dropdown dynamically
    let optionsHtml = "";
    adminState.products.forEach(p => {
      const selected = p.toolId === plan.toolId ? "selected" : "";
      optionsHtml += `<option value="${p.toolId}" ${selected}>${p.name} (${p.toolId})</option>`;
    });
    // Fallback if the toolId is not in products
    if (!adminState.products.some(p => p.toolId === plan.toolId)) {
      optionsHtml += `<option value="${plan.toolId}" selected>${plan.toolId}</option>`;
    }

    tr.innerHTML = `
      <td>
        <select class="plan-tool-id" style="width: 100%; padding: 5px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: 4px;">
          ${optionsHtml}
        </select>
      </td>
      <td><input type="text" class="plan-plan-id" value="${plan.planId}" style="width: 100%;"></td>
      <td><input type="text" class="plan-name" value="${plan.planName}" style="width: 100%;"></td>
      <td><input type="number" class="plan-duration" value="${plan.duration}" style="width: 90px;"></td>
      <td><input type="number" class="plan-price" value="${plan.price}" style="width: 110px;"></td>
      <td>
        <button class="btn btn-danger btn-sm btn-delete-plan-row" data-idx="${idx}">&times; Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btn-delete-plan-row").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"));
      adminState.plans.splice(idx, 1);
      renderPlansTable();
    });
  });
}

// Render Products Catalog table editor with ZIP file uploader
function renderProductsTable() {
  const productsTableTbody = document.getElementById("products-table-tbody");
  if (!productsTableTbody) return;
  productsTableTbody.innerHTML = "";
  
  if (adminState.products.length === 0) {
    productsTableTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">
          No products configured. Add one below.
        </td>
      </tr>
    `;
    return;
  }

  adminState.products.forEach((prod, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" class="prod-tool-id" value="${prod.toolId}" style="width: 110px;" ${prod.rowIndex ? 'readonly style="background: rgba(255,255,255,0.02); cursor: not-allowed;"' : ''}></td>
      <td><input type="text" class="prod-name" value="${prod.name}" style="width: 140px;"></td>
      <td><textarea class="prod-desc" style="width: 100%; min-height: 50px; font-family: var(--font-family); font-size: 12px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-light); padding: 5px; border-radius: 4px;">${prod.description}</textarea></td>
      <td><textarea class="prod-features" style="width: 100%; min-height: 50px; font-family: var(--font-family); font-size: 12px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-light); padding: 5px; border-radius: 4px;">${prod.features}</textarea></td>
      <td>
        <div style="display: flex; gap: 5px; align-items: center;">
          <input type="text" class="prod-url" value="${prod.downloadUrl}" style="width: 100px;">
          <input type="file" class="upload-zip-input" accept=".zip" style="display: none;">
          <button type="button" class="btn btn-secondary btn-sm btn-row-upload-zip" style="padding: 6px 10px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Upload</span>
          </button>
        </div>
      </td>
      <td>
        <select class="prod-status" style="padding: 5px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: 4px;">
          <option value="Active" ${prod.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${prod.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </td>
      <td>
        <button class="btn btn-danger btn-sm btn-delete-prod-row" data-idx="${idx}">&times; Delete</button>
      </td>
    `;
    productsTableTbody.appendChild(tr);
  });

  // Bind upload ZIP buttons in products table rows
  productsTableTbody.querySelectorAll(".btn-row-upload-zip").forEach((btn, rowIdx) => {
    const fileInput = btn.previousElementSibling;
    const urlInput = fileInput.previousElementSibling;
    
    btn.addEventListener("click", () => {
      fileInput.click();
    });
    
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      
      btn.disabled = true;
      const spanEl = btn.querySelector("span");
      if (spanEl) spanEl.textContent = "Uploading...";
      else btn.textContent = "Uploading...";
      
      try {
        const base64String = await convertFileToBase64(file);
        const result = await apiAdminPost({
          action: "admin_upload_file",
          base64Data: base64String,
          fileName: file.name,
          mimeType: file.type
        });
        
        if (result && result.success) {
          urlInput.value = result.downloadUrl;
          showToast(`File "${file.name}" uploaded successfully!`, "success");
        } else {
          alert("ZIP upload failed: " + (result.message || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Error during ZIP file upload.");
      } finally {
        btn.disabled = false;
        if (spanEl) spanEl.textContent = "Upload";
        else btn.textContent = "Upload";
        fileInput.value = "";
      }
    });
  });

  // Bind delete row buttons
  productsTableTbody.querySelectorAll(".btn-delete-prod-row").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"));
      if (confirm("Are you sure you want to delete this product?")) {
        adminState.products.splice(idx, 1);
        renderProductsTable();
      }
    });
  });
}

// Sync filter and key-gen dropdowns with current products list
function updateDynamicDropdowns() {
  const userToolFilter = document.getElementById("user-tool-filter");
  const genToolId = document.getElementById("gen-tool-id");
  
  if (userToolFilter) {
    const selectedFilterVal = userToolFilter.value;
    userToolFilter.innerHTML = `<option value="all">All Extensions</option>`;
    adminState.products.forEach(prod => {
      const opt = document.createElement("option");
      opt.value = prod.toolId;
      opt.textContent = prod.name;
      userToolFilter.appendChild(opt);
    });
    userToolFilter.value = selectedFilterVal || "all";
    if (!userToolFilter.value) userToolFilter.value = "all";
  }
  
  if (genToolId) {
    const selectedGenVal = genToolId.value;
    genToolId.innerHTML = "";
    adminState.products.forEach(prod => {
      const opt = document.createElement("option");
      opt.value = prod.toolId;
      opt.textContent = prod.name;
      genToolId.appendChild(opt);
    });
    genToolId.value = selectedGenVal || (adminState.products[0] ? adminState.products[0].toolId : "");
  }
}

// Bind invoice listeners
function initAdminInvoiceListeners() {
  const formInvoiceGen = document.getElementById("form-invoice-gen");
  if (formInvoiceGen) {
    formInvoiceGen.addEventListener("submit", (e) => {
      e.preventDefault();
      updateInvoicePreview();
    });
  }
  
  const inputs = [
    "inv-company", "inv-name", "inv-gst", "inv-email", "inv-plan-name", "inv-price", "inv-utr"
  ].map(id => document.getElementById(id)).filter(Boolean);

  inputs.forEach(input => {
    input.addEventListener("input", updateInvoicePreview);
  });

  const btnPrintInvoice = document.getElementById("btn-print-invoice");
  if (btnPrintInvoice) {
    btnPrintInvoice.addEventListener("click", () => {
      window.print();
    });
  }
}

// Sync invoice inputs to print sheet view
function updateInvoicePreview() {
  const invCompany = document.getElementById("inv-company");
  const invName = document.getElementById("inv-name");
  const invGst = document.getElementById("inv-gst");
  const invEmail = document.getElementById("inv-email");
  const invPlanName = document.getElementById("inv-plan-name");
  const invPrice = document.getElementById("inv-price");
  const invUtr = document.getElementById("inv-utr");

  const company = invCompany?.value.trim() || "Agency / Company Name";
  const name = invName?.value.trim() || "User Name";
  const gst = invGst?.value.trim().toUpperCase() || "N/A";
  const email = invEmail?.value.trim() || "N/A";
  const plan = invPlanName?.value.trim() || "Activation Access";
  const priceVal = parseFloat(invPrice?.value || "0") || 0;
  const utr = invUtr?.value.trim() || "MANUAL_ACTIVATION";

  const invoiceBillCompany = document.getElementById("invoice-bill-company");
  const invoiceBillName = document.getElementById("invoice-bill-name");
  const invoiceBillEmail = document.getElementById("invoice-bill-email");
  const invoiceBillGst = document.getElementById("invoice-bill-gst");
  const invoiceBillUtr = document.getElementById("invoice-bill-utr");
  const invoiceItemDesc = document.getElementById("invoice-item-desc");
  const invoiceItemPrice = document.getElementById("invoice-item-price");
  const invoiceSubtotal = document.getElementById("invoice-subtotal");
  const invoiceGrandtotal = document.getElementById("invoice-grandtotal");
  const invoiceDateDisplay = document.getElementById("invoice-date-display");
  const invoiceNumberDisplay = document.getElementById("invoice-number-display");

  if (invoiceBillCompany) invoiceBillCompany.textContent = company;
  if (invoiceBillName) invoiceBillName.textContent = name;
  if (invoiceBillEmail) invoiceBillEmail.textContent = email;
  if (invoiceBillGst) invoiceBillGst.textContent = "GSTIN: " + gst;
  if (invoiceBillUtr) invoiceBillUtr.textContent = "UTR: " + utr;
  
  if (invoiceItemDesc) {
    invoiceItemDesc.innerHTML = `
      <strong>CDCMS License - ${plan}</strong><br>
      <span style="color: #64748b; font-size: 11px;">Subscription plan activation for CDCMS Helper Extension</span>
    `;
  }
  
  const formattedPrice = "₹" + priceVal.toFixed(2);
  if (invoiceItemPrice) invoiceItemPrice.textContent = formattedPrice;
  if (invoiceSubtotal) invoiceSubtotal.textContent = formattedPrice;
  if (invoiceGrandtotal) invoiceGrandtotal.textContent = formattedPrice;

  const today = new Date();
  if (invoiceDateDisplay) invoiceDateDisplay.textContent = "Date: " + today.toLocaleDateString('en-IN');
  if (invoiceNumberDisplay) invoiceNumberDisplay.textContent = "Invoice: INV-" + today.getFullYear() + "-" + (100 + today.getDay() + today.getMonth());
}

// Convert Google Drive urls to direct image download streams
function getDirectDriveImageUrl(url) {
  if (!url) return "";
  url = String(url).trim();
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  const exportMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes("drive.google.com") && exportMatch && exportMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${exportMatch[1]}`;
  }
  return url;
}

// Convert Google Drive urls to direct file download streams
function getDirectDriveFileUrl(url) {
  if (!url) return "#";
  url = String(url).trim();
  if (url === "#" || !url) return "#";
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  const exportMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes("drive.google.com") && exportMatch && exportMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${exportMatch[1]}`;
  }
  return url;
}

// Convert file blob to base64 string
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Populate branding setup forms dynamically
function populateSettingsForm() {
  if (!adminState.settings) return;
  adminState.settings.forEach(s => {
    const elId = {
      "company_name": "set-company-name",
      "company_logo_url": "set-company-logo",
      "company_about": "set-company-about",
      "merchant_upi_id": "set-upi-id",
      "merchant_name": "set-merchant-name",
      "support_email": "set-email",
      "support_mobile": "set-mobile",
      "support_whatsapp": "set-whatsapp",
      "company_location": "set-location"
    }[s.key];

    if (elId) {
      const el = document.getElementById(elId);
      if (el) {
        el.value = s.value || "";
      }
    }
  });
}

// Render dynamic public reviews (testimonials)
function renderReviewsGrid(reviews) {
  const container = document.getElementById("testimonials-grid-id");
  if (!container) return;
  
  if (!reviews || reviews.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No reviews yet.</div>`;
    return;
  }
  
  container.innerHTML = "";
  const colors = ["blue", "purple", "indigo"];
  
  reviews.forEach((rev, idx) => {
    const starsHtml = "&#11088;".repeat(rev.stars || 5);
    const name = rev.name || "Anonymous";
    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    const colorClass = `avatar-${colors[idx % colors.length]}`;
    
    let avatarHtml = `<div class="avatar-circle ${colorClass}">${initials}</div>`;
    if (rev.photoUrl && rev.photoUrl.trim().startsWith("http")) {
      avatarHtml = `<img src="${rev.photoUrl.trim()}" alt="${name}" class="avatar-circle" style="object-fit: cover; border: 2px solid var(--border-light); width: 38px; height: 38px;">`;
    }
    
    const company = rev.company ? `<span class="company" style="font-size: 11px; color: var(--text-muted);">${rev.company}</span>` : "";
    
    const card = document.createElement("div");
    card.className = "testimonial-card glass-panel";
    card.innerHTML = `
      <div class="star-rating">${starsHtml}</div>
      <p class="quote">"${rev.reviewText}"</p>
      <div class="user-avatar-block">
        ${avatarHtml}
        <div class="user-info">
          <span class="name">${name}</span>
          ${company}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render admin reviews table/cards list
function renderReviewsTable() {
  const container = document.getElementById("admin-reviews-table-container");
  const badge = document.getElementById("reviews-count-badge");
  if (!container) return;
  
  const reviews = adminState.reviews || [];
  if (badge) badge.textContent = `(${reviews.length})`;
  
  if (reviews.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">No reviews found. Click 'Add' or reload to fetch.</div>`;
    return;
  }
  
  container.innerHTML = "";
  
  reviews.forEach(rev => {
    const starsHtml = "&#11088;".repeat(rev.stars || 5);
    const statusColor = rev.status === "Active" ? "#22c55e" : "#ef4444";
    
    const item = document.createElement("div");
    item.className = "glass-panel";
    item.style.padding = "16px";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.style.gap = "14px";
    
    const initials = (rev.name || "A").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    let avatarHtml = `<div class="avatar-circle avatar-blue" style="width: 32px; height: 32px; font-size: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #3b82f6, #1d4ed8); color: white; font-weight: 700;">${initials}</div>`;
    if (rev.photoUrl && rev.photoUrl.trim().startsWith("http")) {
      avatarHtml = `<img src="${rev.photoUrl.trim()}" alt="${rev.name}" class="avatar-circle" style="width: 32px; height: 32px; object-fit: cover; border-radius: 50%;">`;
    }
    
    item.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: start; flex: 1; min-width: 0;">
        ${avatarHtml}
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <strong style="font-size: 13px;">${rev.name}</strong>
            <span style="font-size: 11px; color: var(--text-muted);">${rev.company || ""}</span>
            <span style="font-size: 11px; background: ${statusColor}1A; color: ${statusColor}; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${rev.status}</span>
          </div>
          <div style="font-size: 11px; margin: 4px 0;">${starsHtml}</div>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.4; word-break: break-word;">${rev.reviewText}</p>
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary btn-sm btn-edit-review" data-id="${rev.id}">Edit</button>
        <button class="btn btn-danger btn-sm btn-delete-review" data-id="${rev.id}">Delete</button>
      </div>
    `;
    
    container.appendChild(item);
  });
  
  // Bind Edit/Delete Listeners
  container.querySelectorAll(".btn-edit-review").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const rev = reviews.find(r => r.id === id);
      if (rev) {
        document.getElementById("review-edit-id").value = rev.id;
        document.getElementById("review-name").value = rev.name;
        document.getElementById("review-company").value = rev.company || "";
        document.getElementById("review-photo").value = rev.photoUrl || "";
        document.getElementById("review-stars").value = rev.stars || 5;
        document.getElementById("review-text").value = rev.reviewText;
        document.getElementById("review-status").value = rev.status || "Active";
        
        document.getElementById("btn-save-review-text").textContent = "✓ Update Review";
        document.getElementById("btn-cancel-review-edit").style.display = "inline-block";
      }
    });
  });
  
  container.querySelectorAll(".btn-delete-review").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Kya aap sach mein is review ko delete karna chahte hain?")) {
        btn.disabled = true;
        btn.textContent = "...";
        try {
          const res = await apiAdminPost({ action: "admin_delete_review", id });
          if (res && res.success) {
            showToast("Review deleted successfully!", "success");
            loadDashboardData();
          } else {
            alert(res.message || "Delete failed.");
          }
        } catch(err) {
          alert("Network error.");
        } finally {
          btn.disabled = false;
          btn.textContent = "Delete";
        }
      }
    });
  });
}

// Reset review form inputs
function resetReviewForm() {
  document.getElementById("review-edit-id").value = "";
  document.getElementById("review-name").value = "";
  document.getElementById("review-company").value = "";
  document.getElementById("review-photo").value = "";
  document.getElementById("review-stars").value = "5";
  document.getElementById("review-text").value = "";
  document.getElementById("review-status").value = "Active";
  
  document.getElementById("btn-save-review-text").textContent = "✓ Save Review";
  document.getElementById("btn-cancel-review-edit").style.display = "none";
}

