// API Base URL
const API_BASE = '/api';

// Authentication State
let currentUser = null;
let accessToken = null;
let refreshToken = null;

// State
let currentSearchTerm = '';

// DOM Elements - Auth
const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const logoutButton = document.getElementById('logoutButton');
const userGreeting = document.getElementById('userGreeting');

// DOM Elements
const dashboard = document.getElementById('dashboard');
const resultsPage = document.getElementById('resultsPage');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultsSearchInput = document.getElementById('resultsSearchInput');
const resultsSearchButton = document.getElementById('resultsSearchButton');
const backButton = document.getElementById('backButton');
const frequentSearches = document.getElementById('frequentSearches');
const frequentSearchesList = document.getElementById('frequentSearchesList');
const resultsContainer = document.getElementById('resultsContainer');

// Filters
const sortByFilter = document.getElementById('sortBy');
const minPriceFilter = document.getElementById('minPrice');
const maxPriceFilter = document.getElementById('maxPrice');
const retailerFilter = document.getElementById('retailer');

// D_IQ Elements
const diqModal = document.getElementById('diqModal');
const diqResultsPage = document.getElementById('diqResultsPage');
const diqButton = document.getElementById('diqButton');
const diqClose = document.getElementById('diqClose');
const diqQuestionsContainer = document.getElementById('diqQuestionsContainer');
const diqProgressFill = document.getElementById('diqProgressFill');
const diqCurrentQuestion = document.getElementById('diqCurrentQuestion');
const diqTotalQuestions = document.getElementById('diqTotalQuestions');
const diqPrevButton = document.getElementById('diqPrevButton');
const diqNextButton = document.getElementById('diqNextButton');
const diqSubmitButton = document.getElementById('diqSubmitButton');
const diqLoading = document.getElementById('diqLoading');
const diqBackButton = document.getElementById('diqBackButton');
const diqResultsContainer = document.getElementById('diqResultsContainer');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupAuthEventListeners();
  await checkAuthentication();
  initializeCart();
  loadFrequentSearches();
  loadRetailers();
  setupEventListeners();
});

// ==================== AUTHENTICATION ====================

function setupAuthEventListeners() {
  // Login form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });

  // Signup form
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSignup();
  });

  // Toggle between login and signup
  showSignupLink.addEventListener('click', () => {
    loginPage.classList.remove('show');
    signupPage.classList.add('show');
    clearErrors();
  });

  showLoginLink.addEventListener('click', () => {
    signupPage.classList.remove('show');
    loginPage.classList.add('show');
    clearErrors();
  });

  // Logout
  logoutButton.addEventListener('click', handleLogout);

  // Password visibility toggles
  setupPasswordToggle('loginPassword', 'toggleLoginPassword');
  setupPasswordToggle('signupPassword', 'toggleSignupPassword');
}

function setupPasswordToggle(passwordFieldId, toggleButtonId) {
  const passwordField = document.getElementById(passwordFieldId);
  const toggleButton = document.getElementById(toggleButtonId);

  if (passwordField && toggleButton) {
    toggleButton.addEventListener('click', () => {
      const type = passwordField.getAttribute('type');
      if (type === 'password') {
        passwordField.setAttribute('type', 'text');
        toggleButton.textContent = '🙈';
      } else {
        passwordField.setAttribute('type', 'password');
        toggleButton.textContent = '👁️';
      }
    });
  }
}

async function checkAuthentication() {
  // Check if user is already logged in
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');

  if (accessToken) {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        showDashboard();
      } else if (response.status === 401) {
        // Token expired, try refresh
        await attemptTokenRefresh();
      } else {
        showLoginPage();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      showLoginPage();
    }
  } else {
    showLoginPage();
  }
}

async function attemptTokenRefresh() {
  if (!refreshToken) {
    showLoginPage();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      accessToken = data.accessToken;
      localStorage.setItem('accessToken', accessToken);

      // Retry getting user info
      await checkAuthentication();
    } else {
      showLoginPage();
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    showLoginPage();
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  console.log('=== LOGIN ATTEMPT ===');
  console.log('Email:', email);
  console.log('Password length:', password.length);

  if (!email || !password) {
    showError(loginError, 'Please enter email and password');
    return;
  }

  const loginButton = document.getElementById('loginButton');
  loginButton.disabled = true;
  loginButton.textContent = 'Logging in...';

  try {
    const url = `${API_BASE}/auth/login`;
    console.log('Sending login request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.success) {
      console.log('✅ Login successful');
      // Store tokens
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      currentUser = data.user;

      console.log('User:', currentUser);
      console.log('Access token length:', accessToken?.length);
      console.log('Refresh token length:', refreshToken?.length);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Clear form
      loginForm.reset();
      clearErrors();

      // Show dashboard
      showDashboard();
    } else {
      console.error('❌ Login failed:', data.error);
      showError(loginError, data.error || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login exception:', error);
    console.error('Error details:', error.message, error.stack);
    showError(loginError, 'Login failed. Please try again.');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
  }
}

async function handleSignup() {
  console.log('\n=== SIGNUP ATTEMPT ===');

  const fullName = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  console.log('Full Name:', fullName);
  console.log('Email:', email);
  console.log('Password length:', password.length);

  if (!fullName || !email || !password) {
    console.log('❌ Missing fields');
    showError(signupError, 'Please fill all fields');
    return;
  }

  // Validate password
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    console.log('❌ Invalid password format');
    showError(signupError, 'Password must be at least 8 characters with uppercase, lowercase, and number');
    return;
  }

  console.log('✅ Validation passed');

  const signupButton = document.getElementById('signupButton');
  signupButton.disabled = true;
  signupButton.textContent = 'Creating Account...';

  try {
    console.log('Sending signup request to:', `${API_BASE}/auth/signup`);

    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, fullName })
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok && data.success) {
      console.log('✅ Signup successful!');

      // Store tokens
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      currentUser = data.user;

      console.log('User:', currentUser);
      console.log('Tokens stored in memory');

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      console.log('Tokens stored in localStorage');

      // Clear form
      signupForm.reset();
      clearErrors();

      console.log('Redirecting to dashboard...');
      // Show dashboard
      showDashboard();
    } else {
      console.log('❌ Signup failed:', data.error);
      showError(signupError, data.error || 'Signup failed');
    }
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Error details:', error.message, error.stack);
    showError(signupError, 'Signup failed. Please try again.');
  } finally {
    signupButton.disabled = false;
    signupButton.textContent = 'Sign Up';
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken })
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear local storage and state
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  accessToken = null;
  refreshToken = null;
  currentUser = null;

  // Show login page
  showLoginPage();
}

function showLoginPage() {
  loginPage.classList.add('show');
  signupPage.classList.remove('show');
  dashboard.classList.remove('show');
  resultsPage.classList.remove('show');
  if (diqModal) diqModal.classList.remove('show');
  if (diqResultsPage) diqResultsPage.classList.remove('show');
}

function showDashboard() {
  // Hide auth pages
  loginPage.classList.remove('show');
  signupPage.classList.remove('show');

  // Show dashboard
  dashboard.classList.add('show');

  // Hide other pages
  resultsPage.classList.remove('show');
  diqResultsPage.classList.remove('show');
  diqModal.classList.remove('show');

  // Clear search
  searchInput.value = '';
  resultsSearchInput.value = '';
  currentSearchTerm = '';

  // Update user greeting
  if (currentUser) {
    const firstName = currentUser.fullName ? currentUser.fullName.split(' ')[0] : currentUser.email.split('@')[0];
    userGreeting.textContent = `Hello, ${firstName}!`;
  }
}

function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

function clearErrors() {
  loginError.textContent = '';
  loginError.classList.remove('show');
  signupError.textContent = '';
  signupError.classList.remove('show');
}

// API Helper with Auth
async function authenticatedFetch(url, options = {}) {
  if (accessToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    };
  }

  let response = await fetch(url, options);

  // If 401, try to refresh token
  if (response.status === 401 && refreshToken) {
    await attemptTokenRefresh();

    // Retry request with new token
    if (accessToken) {
      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    }
  }

  return response;
}

// ==================== END AUTHENTICATION ====================


function setupEventListeners() {
  // Search from dashboard
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Search from results page
  resultsSearchButton.addEventListener('click', handleResultsSearch);
  resultsSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleResultsSearch();
  });

  // Show frequent searches on focus
  searchInput.addEventListener('focus', async () => {
    await loadSearchHistory();
    frequentSearches.classList.add('show');
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !frequentSearches.contains(e.target)) {
      frequentSearches.classList.remove('show');
    }
  });

  // Back button
  backButton.addEventListener('click', () => {
    showDashboard();
  });

  // Filter changes
  [sortByFilter, minPriceFilter, maxPriceFilter, retailerFilter].forEach(filter => {
    filter.addEventListener('change', () => {
      // Mark sort filter as manually changed
      if (filter === sortByFilter) {
        sortByFilter.dataset.autoSet = 'false';
      }

      if (currentSearchTerm) {
        performSearch(currentSearchTerm);
      }
    });
  });

  // D_IQ Event Listeners
  if (diqButton) {
    console.log('✅ Attaching D_IQ button listener');
    diqButton.addEventListener('click', () => {
      console.log('🎯 D_IQ button clicked!');
      openDIQModal();
    });
  } else {
    console.error('❌ D_IQ button not found!');
  }
  if (diqClose) {
    diqClose.addEventListener('click', closeDIQModal);
  }
  if (diqPrevButton) {
    diqPrevButton.addEventListener('click', goToPreviousQuestion);
  }
  if (diqNextButton) {
    diqNextButton.addEventListener('click', goToNextQuestion);
  }
  if (diqSubmitButton) {
    diqSubmitButton.addEventListener('click', submitDIQAnswers);
  }
  if (diqBackButton) {
    diqBackButton.addEventListener('click', backToDashboard);
  }
}

async function loadFrequentSearches() {
  try {
    const response = await fetch(`${API_BASE}/products/frequent-searches`);
    const data = await response.json();

    if (data.success) {
      frequentSearchesList.innerHTML = data.searches
        .map(search => `<div class="frequent-search-item" onclick="selectFrequentSearch('${search}')">${search}</div>`)
        .join('');
    }
  } catch (error) {
    console.error('Error loading frequent searches:', error);
  }
}

async function loadRetailers() {
  try {
    const response = await fetch(`${API_BASE}/products/retailers`);
    const data = await response.json();

    if (data.success) {
      const retailerDropdown = document.getElementById('retailer');

      // Clear existing options except "All Stores"
      retailerDropdown.innerHTML = '<option value="">All Stores</option>';

      // Add retailers
      data.retailers.forEach(retailer => {
        const option = document.createElement('option');
        option.value = retailer.id;
        option.textContent = retailer.name;
        retailerDropdown.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading retailers:', error);
  }
}

async function loadSearchHistory() {
  try {
    const response = await fetch(`${API_BASE}/products/search-history?limit=6`);
    const data = await response.json();

    if (data.success && data.history.length > 0) {
      let html = '<div class="search-history-section">';

      // Recent searches only (top 6)
      html += '<div class="search-history-header">Recent Searches</div>';
      html += data.history
        .slice(0, 6)
        .map(item => `<div class="frequent-search-item" onclick="selectFrequentSearch('${item.search_query}')">
          <span>${item.search_query}</span>
        </div>`)
        .join('');

      html += '</div>';
      frequentSearchesList.innerHTML = html;
    } else {
      // Fallback to frequent searches
      await loadFrequentSearches();
    }
  } catch (error) {
    console.error('Error loading search history:', error);
    // Fallback to frequent searches
    await loadFrequentSearches();
  }
}

function selectFrequentSearch(search) {
  searchInput.value = search;
  handleSearch();
}

function handleSearch() {
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }

  currentSearchTerm = searchTerm;
  showResults();
  performSearch(searchTerm);
}

function handleResultsSearch() {
  const searchTerm = resultsSearchInput.value.trim();
  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }

  currentSearchTerm = searchTerm;
  performSearch(searchTerm);
}

async function performSearch(searchTerm) {
  resultsContainer.innerHTML = '<div class="loading">Loading products...</div>';

  try {
    // Set default sort based on search term
    let defaultSort = 'rating';
    const searchLower = searchTerm.toLowerCase().trim();

    // For earphones, default to price low to high
    if (searchLower.includes('earphone') || searchLower.includes('ear phone')) {
      defaultSort = 'price_asc';
    }

    // If user hasn't manually selected a sort, use the default
    if (!sortByFilter.value || sortByFilter.dataset.autoSet === 'true') {
      sortByFilter.value = defaultSort;
      sortByFilter.dataset.autoSet = 'true';
    }

    const params = new URLSearchParams({
      q: searchTerm,
      sortBy: sortByFilter.value || defaultSort,
    });

    if (minPriceFilter.value) params.append('minPrice', minPriceFilter.value);
    if (maxPriceFilter.value) params.append('maxPrice', maxPriceFilter.value);
    if (retailerFilter.value) params.append('retailer', retailerFilter.value);

    const response = await fetch(`${API_BASE}/products/search?${params}`);
    const data = await response.json();

    if (data.success) {
      displayProducts(data.products);
    } else {
      resultsContainer.innerHTML = `<div class="no-results">Error: ${data.error}</div>`;
    }
  } catch (error) {
    console.error('Error searching products:', error);
    resultsContainer.innerHTML = '<div class="no-results">Failed to load products. Please try again.</div>';
  }
}

function displayProducts(products) {
  if (products.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">No products found. Try adjusting your filters.</div>';
    return;
  }

  resultsContainer.innerHTML = `
    <div class="products-grid">
      ${products.map(product => createProductCard(product)).join('')}
    </div>
  `;
}

function createProductCard(product) {
  const isOfflineStore = product.store_id !== undefined;
  const hasImage = product.image_url && product.image_url.trim() !== '';

  // Parse JSONB fields
  const features = product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : (product.key_specs ? (typeof product.key_specs === 'string' ? JSON.parse(product.key_specs) : product.key_specs) : []);
  const reviews = product.reviews ? (typeof product.reviews === 'string' ? JSON.parse(product.reviews) : product.reviews) : [];

  return `
    <div class="product-card ${isOfflineStore ? 'offline-store-product' : ''}" data-product-id="${product.id}" data-retailer="${product.retailer_name}">
      <div class="store-tag ${isOfflineStore ? 'offline-tag' : ''}">${isOfflineStore ? '🏪 ' : ''}${product.retailer_name}</div>
      ${isOfflineStore && product.store_owner ? `
        <div class="store-owner-tag">👤 ${product.store_owner}${product.store_phone ? ' • 📞 ' + product.store_phone : ''}</div>
      ` : ''}
      ${hasImage
      ? `<img src="${product.image_url}" alt="${product.product_name}" class="product-image" onerror="this.style.display='none'; this.parentElement.querySelector('.no-image-placeholder').style.display='flex';" />
           <div class="no-image-placeholder" style="display:none;">No Image</div>`
      : `<div class="no-image-placeholder">No Image</div>`
    }
      
      <div class="product-name">${product.product_name}</div>
      
      <div class="product-price">${product.price_inr && !isNaN(product.price_inr) ? '₹' + parseFloat(product.price_inr).toLocaleString('en-IN') : 'Visit website for price'}</div>
      
      ${product.rating ? `
        <div class="product-rating">
          <span class="rating-value">★ ${product.rating}</span> / 5.0
        </div>
      ` : ''}
      
      ${features && features.length > 0 ? `
        <div class="product-features">
          <h4>Key Features:</h4>
          <ul>
            ${features.slice(0, 3).map(f => `<li>• ${f}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${reviews && reviews.length > 0 ? `
        <div class="product-reviews">
          <h4>Top Reviews:</h4>
          ${reviews.slice(0, 3).map(r => `<div class="review-item">"${typeof r === 'string' ? r : r.text || r.review || ''}"</div>`).join('')}
        </div>
      ` : ''}
      
      <div class="product-actions">
        <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, event)">
          🛒 Add to Cart
        </button>
        ${!isOfflineStore && (product.affiliate_url || product.product_url) ? `
          <a href="${product.affiliate_url || product.product_url}" target="_blank" class="product-link">View Product →</a>
        ` : ''}
        ${isOfflineStore ? `
          <div class="offline-store-info">
            <span class="badge">Available In-Store</span>
            ${product.store_phone ? `<a href="tel:${product.store_phone}" class="call-store-btn">📞 Call Store</a>` : ''}
          </div>
        ` : ''}
        ${!isOfflineStore ? `
          <button class="recommendations-btn" onclick="showRecommendations('${product.id}', '${product.retailer_name}', event)">
            Show Recommendations
          </button>
          <button class="price-comparison-btn" onclick="showPriceComparisons('${product.id}', '${product.retailer_name}', event)">
            Know How much you'll save
          </button>
        ` : ''}
      </div>
      
      ${!isOfflineStore ? `
      <!-- Recommendations container (hidden by default) -->
      <div class="recommendations-container" id="recommendations-${product.id}" style="display: none;">
        <div class="recommendations-header">
          <h4>Recommended Products</h4>
          <button class="close-recommendations" onclick="hideRecommendations('${product.id}', event)">✕</button>
        </div>
        <div class="recommendations-loading">Loading recommendations...</div>
        <div class="recommendations-list"></div>
      </div>
      
      <!-- Price Comparisons container (hidden by default) -->
      <div class="price-comparisons-container" id="price-comparisons-${product.id}" style="display: none;">
        <div class="price-comparisons-header">
          <h4>Price Comparisons - Find the Best Deal</h4>
          <button class="close-price-comparisons" onclick="hidePriceComparisons('${product.id}', event)">✕</button>
        </div>
        <div class="price-comparisons-loading">Searching for best prices...</div>
        <div class="price-comparisons-list"></div>
      </div>
      ` : ''}
    </div>
  `;
}

async function showRecommendations(productId, retailerName, event) {
  event.stopPropagation();

  const container = document.getElementById(`recommendations-${productId}`);
  const loadingEl = container.querySelector('.recommendations-loading');
  const listEl = container.querySelector('.recommendations-list');
  const btn = event.target;

  // Show container
  container.style.display = 'block';
  btn.textContent = 'Hide Recommendations';
  btn.onclick = (e) => hideRecommendations(productId, e);

  // If already loaded, just show
  if (listEl.innerHTML.trim() !== '') {
    loadingEl.style.display = 'none';
    return;
  }

  // Fetch recommendations
  try {
    loadingEl.style.display = 'block';
    const retailer = retailerName.toLowerCase();
    const response = await fetch(`${API_BASE}/products/${retailer}/${productId}/recommendations`);
    const data = await response.json();

    if (data.success && data.recommendations && data.recommendations.length > 0) {
      listEl.innerHTML = data.recommendations.map(rec => `
        <div class="recommendation-item">
          ${rec.image_url && rec.image_url.trim()
          ? `<img src="${rec.image_url}" alt="${rec.name}" class="recommendation-image" onerror="this.style.display='none'; this.parentElement.querySelector('.no-image-placeholder-small').style.display='flex';" />
               <div class="no-image-placeholder-small" style="display:none;">No Image</div>`
          : `<div class="no-image-placeholder-small">No Image</div>`
        }
          <div class="recommendation-details">
            <div class="recommendation-name">${rec.name}</div>
            <div class="recommendation-price">${rec.price_inr && !isNaN(rec.price_inr) ? '₹' + rec.price_inr.toLocaleString('en-IN') : 'Price not disclosed'}</div>
            <div class="recommendation-merchant">${rec.merchant}</div>
          </div>
          <a href="${rec.affiliate_url || rec.product_url}" 
             target="_blank" 
             class="recommendation-link">View →</a>
        </div>
      `).join('');
      loadingEl.style.display = 'none';
    } else {
      listEl.innerHTML = '<div class="no-recommendations">No recommendations available</div>';
      loadingEl.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    listEl.innerHTML = '<div class="no-recommendations">Failed to load recommendations</div>';
    loadingEl.style.display = 'none';
  }
}

function hideRecommendations(productId, event) {
  event.stopPropagation();

  const container = document.getElementById(`recommendations-${productId}`);
  const card = container.closest('.product-card');
  const btn = card.querySelector('.recommendations-btn');

  container.style.display = 'none';
  btn.textContent = 'Show Recommendations';
  btn.onclick = (e) => showRecommendations(productId, card.dataset.retailer, e);
}

async function showPriceComparisons(productId, retailerName, event) {
  event.stopPropagation();

  const container = document.getElementById(`price-comparisons-${productId}`);
  const loadingEl = container.querySelector('.price-comparisons-loading');
  const listEl = container.querySelector('.price-comparisons-list');
  const btn = event.target;

  // Show container
  container.style.display = 'block';
  btn.textContent = 'Hide other stores';
  btn.onclick = (e) => hidePriceComparisons(productId, e);

  // If already loaded, just show
  if (listEl.innerHTML.trim() !== '') {
    loadingEl.style.display = 'none';
    return;
  }

  // Fetch price comparisons
  try {
    loadingEl.style.display = 'block';
    const retailer = retailerName.toLowerCase();
    const response = await fetch(`${API_BASE}/products/${retailer}/${productId}/price-comparisons`);
    const data = await response.json();

    if (data.success && data.comparisons && data.comparisons.length > 0) {
      // Get the main product's price for savings calculation
      const mainProductCard = document.querySelector(`[data-product-id="${productId}"]`);
      const mainPriceText = mainProductCard?.querySelector('.product-price')?.textContent || '';
      const mainPrice = parseInt(mainPriceText.replace(/[^0-9]/g, '')) || 0;

      listEl.innerHTML = data.comparisons.map((comp, index) => {
        const savings = mainPrice - (comp.price_inr || 0);
        const savingsText = savings > 0 ? `saved: ₹${Math.abs(savings).toLocaleString('en-IN')}` :
          savings < 0 ? `costs ₹${Math.abs(savings).toLocaleString('en-IN')} more` : '';

        return `
        <div class="comparison-item">
          ${comp.image_url && comp.image_url.trim()
            ? `<img src="${comp.image_url}" alt="${comp.name}" class="comparison-image" onerror="this.style.display='none'; this.parentElement.querySelector('.no-image-placeholder-tiny').style.display='flex';" />
               <div class="no-image-placeholder-tiny" style="display:none;">No Image</div>`
            : `<div class="no-image-placeholder-tiny">No Image</div>`
          }
          <div class="comparison-details">
            <div class="comparison-merchant">${comp.merchant}</div>
            <div class="comparison-price">₹${comp.price_inr && !isNaN(comp.price_inr) ? comp.price_inr.toLocaleString('en-IN') : 'Price not available'}</div>
            ${savingsText ? `<div class="comparison-savings">${savingsText}</div>` : ''}
          </div>
          <a href="${comp.affiliate_url || comp.product_url}" 
             target="_blank" 
             class="comparison-visit-btn">Link</a>
        </div>
      `}).join('');
      loadingEl.style.display = 'none';
    } else {
      listEl.innerHTML = '<div class="no-comparisons">No price comparisons available for this product</div>';
      loadingEl.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching price comparisons:', error);
    listEl.innerHTML = '<div class="no-comparisons">Failed to load price comparisons</div>';
    loadingEl.style.display = 'none';
  }
}

function hidePriceComparisons(productId, event) {
  event.stopPropagation();

  const container = document.getElementById(`price-comparisons-${productId}`);
  const card = container.closest('.product-card');
  const btn = card.querySelector('.price-comparison-btn');

  container.style.display = 'none';
  btn.textContent = 'Know How much you\'ll save';
  btn.onclick = (e) => showPriceComparisons(productId, card.dataset.retailer, e);
}

function showResults() {
  dashboard.classList.remove('show');
  resultsPage.classList.add('show');
  frequentSearches.classList.remove('show');
  // Sync search input to results page
  resultsSearchInput.value = currentSearchTerm;
}

// ==================== D_IQ QUESTIONNAIRE ====================

// D_IQ State
let diqQuestions = [];
let diqCurrentIndex = 0;
let diqAnswers = {};

// Open D_IQ Modal
async function openDIQModal() {
  console.log('\n=== OPENING D_IQ MODAL ===');
  try {
    // Load questions if not already loaded
    if (diqQuestions.length === 0) {
      console.log('Loading D_IQ questions...');
      const response = await fetch(`${API_BASE}/diq/questions`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        diqQuestions = data.questions;
        diqTotalQuestions.textContent = diqQuestions.length;
        console.log('\u2705 Questions loaded:', diqQuestions.length);
      } else {
        console.error('\u274c Failed to load questions:', data.error);
        alert('Failed to load questions. Please try again.');
        return;
      }
    } else {
      console.log('\u2705 Questions already loaded:', diqQuestions.length);
    }

    // Reset state
    diqCurrentIndex = 0;
    diqAnswers = {};

    console.log('Showing modal and rendering first question...');
    // Show modal and render first question
    // Remove any inline styles that might conflict with CSS classes
    diqModal.style.display = '';
    diqModal.classList.add('show');
    renderDIQQuestion();
    console.log('\u2705 Modal opened successfully');
  } catch (error) {
    console.error('\u274c Error opening D_IQ modal:', error);
    console.error('Error details:', error.message, error.stack);
    alert('Failed to load questionnaire. Please try again.');
  }
}

// Close D_IQ Modal
function closeDIQModal() {
  diqModal.classList.remove('show');
}

// Render Current Question
function renderDIQQuestion() {
  const question = diqQuestions[diqCurrentIndex];
  diqCurrentQuestion.textContent = diqCurrentIndex + 1;

  // Update progress bar
  const progress = ((diqCurrentIndex + 1) / diqQuestions.length) * 100;
  diqProgressFill.style.width = `${progress}%`;

  // Get current answer data
  const answerData = diqAnswers[question.id] || {};
  const selectedValue = answerData.id; // Get the option ID from the stored option object
  const importanceValue = answerData.importance || 50;

  // Render question card
  const optionsHTML = question.options.map(option => {
    const isDisabled = option.disabled ? 'disabled' : '';
    const selectedClass = selectedValue === option.id ? 'selected' : '';

    return `
      <button class="diq-option ${selectedClass} ${isDisabled}" 
              data-value="${option.id}"
              ${isDisabled ? 'disabled' : ''}>
        <div class="diq-option-title">${option.text}</div>
        ${option.spec ? `<div class="diq-option-spec">${option.spec}</div>` : ''}
        ${option.description ? `<div class="diq-option-description">${option.description}</div>` : ''}
      </button>
    `;
  }).join('');

  // Add importance slider if question has it
  const importanceSliderHTML = question.hasImportance ? `
    <div class="diq-importance-container">
      <label class="diq-importance-label">
        How important is this to you?
        <span class="diq-importance-value">${importanceValue}%</span>
      </label>
      <input type="range" 
             class="diq-importance-slider" 
             min="0" 
             max="100" 
             value="${importanceValue}"
             data-question="${question.id}">
      <div class="diq-importance-labels">
        <span>Not Important</span>
        <span>Very Important</span>
      </div>
    </div>
  ` : '';

  diqQuestionsContainer.innerHTML = `
    <div class="diq-question-card active">
      <h3 class="diq-question-title">${question.question}</h3>
      ${question.helpText ? `<p class="diq-help-text">💡 ${question.helpText}</p>` : ''}
      <div class="diq-options">
        ${optionsHTML}
      </div>
      ${importanceSliderHTML}
    </div>
  `;

  // Add click handlers to options
  document.querySelectorAll('.diq-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectDIQOption(question.id, btn.dataset.value);
    });
  });

  // Add slider handler if present
  const slider = document.querySelector('.diq-importance-slider');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const value = e.target.value;
      document.querySelector('.diq-importance-value').textContent = `${value}%`;
      // Update answer with importance
      if (diqAnswers[question.id]) {
        diqAnswers[question.id].importance = parseInt(value);
      }
    });
  }

  // Update navigation buttons
  diqPrevButton.style.display = diqCurrentIndex === 0 ? 'none' : 'inline-block';

  if (diqCurrentIndex === diqQuestions.length - 1) {
    diqNextButton.style.display = 'none';
    diqSubmitButton.style.display = 'inline-block';
  } else {
    diqNextButton.style.display = 'inline-block';
    diqSubmitButton.style.display = 'none';
  }
}

// Select Option
async function selectDIQOption(questionId, value) {
  // Get the full option object from the current question
  const currentQuestion = diqQuestions[diqCurrentIndex];
  const selectedOption = currentQuestion.options.find(opt => opt.id === value);

  if (!selectedOption) {
    console.error('Option not found:', value);
    return;
  }

  // Store the complete option object (not just the ID) with importance
  if (!diqAnswers[questionId]) {
    diqAnswers[questionId] = {};
  }

  // Store the complete option with all its properties (scoring, filters, priceRange, etc.)
  diqAnswers[questionId] = {
    ...selectedOption, // This includes id, text, scoring, filters, priceRange, etc.
    importance: diqAnswers[questionId].importance || 50
  };

  // If this is category selection, reload questions for that category
  if (questionId === 'q0_category') {
    try {
      const response = await fetch(`${API_BASE}/diq/questions/${value}`);
      const data = await response.json();

      if (data.success) {
        diqQuestions = data.questions;
        diqTotalQuestions.textContent = diqQuestions.length;
      }
    } catch (error) {
      console.error('Error loading category questions:', error);
    }
  }

  // Update UI
  document.querySelectorAll('.diq-option').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.dataset.value === value) {
      btn.classList.add('selected');
    }
  });
}

// Navigate to Previous Question
function goToPreviousQuestion() {
  if (diqCurrentIndex > 0) {
    diqCurrentIndex--;
    renderDIQQuestion();
  }
}

// Navigate to Next Question
function goToNextQuestion() {
  const currentQuestion = diqQuestions[diqCurrentIndex];

  // Validate answer selected (check for id property since we store the complete option object)
  if (!diqAnswers[currentQuestion.id] || !diqAnswers[currentQuestion.id].id) {
    alert('Please select an option before proceeding.');
    return;
  }

  if (diqCurrentIndex < diqQuestions.length - 1) {
    diqCurrentIndex++;
    renderDIQQuestion();
  }
}

// Submit Answers
async function submitDIQAnswers() {
  const lastQuestion = diqQuestions[diqQuestions.length - 1];

  // Validate last answer selected (check for id property since we store the complete option object)
  if (!diqAnswers[lastQuestion.id] || !diqAnswers[lastQuestion.id].id) {
    alert('Please select an option before submitting.');
    return;
  }

  try {
    // Show loading
    diqQuestionsContainer.style.display = 'none';
    document.querySelector('.diq-navigation').style.display = 'none';
    diqLoading.style.display = 'block';

    // Submit to API
    const response = await fetch(`${API_BASE}/diq/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: diqAnswers,
        limit: 20
      })
    });

    const data = await response.json();

    if (data.success) {
      // Close modal and show results
      closeDIQModal();
      renderDIQResults(data.products);
    } else {
      alert('Failed to get recommendations. Please try again.');
      // Reset UI
      diqQuestionsContainer.style.display = 'block';
      document.querySelector('.diq-navigation').style.display = 'flex';
      diqLoading.style.display = 'none';
    }
  } catch (error) {
    console.error('Error submitting D_IQ answers:', error);
    alert('Failed to get recommendations. Please try again.');
    // Reset UI
    diqQuestionsContainer.style.display = 'block';
    document.querySelector('.diq-navigation').style.display = 'flex';
    diqLoading.style.display = 'none';
  }
}

// Render User Preferences Summary
function renderUserPreferences() {
  const preferencesList = document.getElementById('preferencesList');
  if (!preferencesList) return;

  // Get question texts from diqQuestions array
  const preferencesHTML = diqQuestions.map((question, index) => {
    const questionId = question.id;
    const answer = diqAnswers[questionId];

    if (!answer) return ''; // Skip unanswered questions

    // Build the preference item
    let html = `
      <div class="preference-item">
        <div class="preference-question">${question.question}</div>
        <div class="preference-answer">${answer.text || answer.id}</div>
    `;

    // Add description if available
    if (answer.description) {
      html += `<div class="preference-description">${answer.description}</div>`;
    }

    // Add importance badge if it was a question with importance slider
    if (question.hasImportance && answer.importance !== undefined) {
      html += `<span class="preference-importance">Priority: ${answer.importance}%</span>`;
    }

    html += `</div>`;
    return html;
  }).filter(html => html !== '').join('');

  preferencesList.innerHTML = preferencesHTML || '<p style="color:white; text-align:center;">No preferences recorded</p>';
}

// Render D_IQ Results
function renderDIQResults(products) {
  // Hide dashboard and results page
  dashboard.classList.remove('show');
  resultsPage.classList.remove('show');

  // Show D_IQ results page
  diqResultsPage.classList.add('show');

  // Populate user preferences summary
  renderUserPreferences();

  if (!products || products.length === 0) {
    diqResultsContainer.innerHTML = '<p class="no-results">No products found matching your preferences.</p>';
    return;
  }

  const resultsHTML = products.map((product, index) => {
    const rank = index + 1;
    const rankBadge = rank <= 3 ? `<span class="diq-rank-badge rank-${rank}">🏆 #${rank}</span>` : `<span class="diq-rank-badge">#${rank}</span>`;

    const scoreClass = product.diq_rating === 'Excellent' ? 'excellent' :
      product.diq_rating === 'Good' ? 'good' :
        product.diq_rating === 'Fair' ? 'fair' : 'poor';

    const features = [];
    if (product.has_anc) features.push('ANC');
    if (product.battery_hours && product.battery_hours > 0) features.push(`${product.battery_hours}h Battery`);
    if (product.has_fast_charge) features.push('Fast Charge');
    if (parseFloat(product.mic_quality_score) >= 4) features.push('Good Mic');

    const featuresHTML = features.length > 0
      ? features.map(f => `<span class="diq-feature-badge">${f}</span>`).join('')
      : '';

    // Check if this is an offline product and add disclaimer
    const isOffline = product.source_type === 'offline' || product.is_offline_product;
    const disclaimerHTML = isOffline && product.disclaimer
      ? `<div class="diq-offline-disclaimer">
           <span class="disclaimer-icon">ℹ️</span>
           <span class="disclaimer-text">${product.disclaimer}</span>
         </div>`
      : '';

    // Add store contact info for offline products
    const storeInfoHTML = isOffline && product.store_name
      ? `<div class="diq-store-info">
           <strong>📍 Available at: ${product.store_name}</strong>
           ${product.owner_phone ? `<br><span>📞 Contact: ${product.owner_phone}</span>` : ''}
         </div>`
      : '';

    return `
      <div class="product-card ${isOffline ? 'offline-product' : ''}">
        ${rankBadge}
        ${isOffline ? '<span class="offline-badge">🏪 Offline Store</span>' : ''}
        ${(product.image_url || product.image) && (!isOffline || (product.image_url && product.image_url.trim()))
        ? `<img src="${product.image_url || product.image}" alt="${product.product_name || product.name}" class="diq-product-image" onerror="this.style.display='none'; this.parentElement.querySelector('.no-image-placeholder').style.display='flex';" />
             <div class="no-image-placeholder" style="display:none;">No Image</div>`
        : `<div class="no-image-placeholder">No Image</div>`
      }
        <h3 class="product-name">${product.product_name || product.name}</h3>
        <p class="product-price">₹${product.price_inr || product.price}</p>
        
        <div class="diq-score-container">
          <div class="diq-score-label">D_IQ Score</div>
          <div class="diq-score-value ${scoreClass}">${product.diq_score}</div>
          <div class="diq-rating">${product.diq_rating}</div>
        </div>

        ${featuresHTML ? `<div class="diq-features-list">${featuresHTML}</div>` : ''}
        ${disclaimerHTML}
        ${storeInfoHTML}

        <div class="diq-product-actions">
          <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, event)">
            🛒 Add to Cart
          </button>
          <button class="diq-buy-button" onclick="window.open('${product.affiliate_url || product.product_url || product.link || '#'}', '_blank')">
            ${isOffline ? 'Visit Store' : `View on ${product.retailer}`}
          </button>
        </div>
      </div>
    `;
  }).join('');

  diqResultsContainer.innerHTML = resultsHTML;
}

// Back to Dashboard from D_IQ Results
function backToDashboard() {
  diqResultsPage.classList.remove('show');
  showDashboard();
}
