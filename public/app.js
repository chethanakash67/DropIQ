// API Base URL
const API_BASE = '/api';

// State
let currentSearchTerm = '';

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFrequentSearches();
  setupEventListeners();
});

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
  const imageUrl = product.image_url || 'https://via.placeholder.com/200x200?text=No+Image';

  // Parse JSONB fields
  const features = product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : (product.key_specs ? (typeof product.key_specs === 'string' ? JSON.parse(product.key_specs) : product.key_specs) : []);
  const reviews = product.reviews ? (typeof product.reviews === 'string' ? JSON.parse(product.reviews) : product.reviews) : [];

  return `
    <div class="product-card" data-product-id="${product.id}" data-retailer="${product.retailer_name}">
      <div class="store-tag">${product.retailer_name}</div>
      <img src="${imageUrl}" alt="${product.product_name}" class="product-image" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'" />
      
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
        ${product.affiliate_url || product.product_url ? `
          <a href="${product.affiliate_url || product.product_url}" target="_blank" class="product-link">View Product →</a>
        ` : ''}
        <button class="recommendations-btn" onclick="showRecommendations('${product.id}', '${product.retailer_name}', event)">
          Show Recommendations
        </button>
        <button class="price-comparison-btn" onclick="showPriceComparisons('${product.id}', '${product.retailer_name}', event)">
          Know How much you'll save
        </button>
      </div>
      
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
          <img src="${rec.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}" 
               alt="${rec.name}" 
               onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'" />
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
          <img src="${comp.image_url || 'https://via.placeholder.com/60x60?text=No+Image'}" 
               alt="${comp.name}" 
               onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'" />
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

function showDashboard() {
  dashboard.style.display = 'block';
  resultsPage.classList.remove('show');
  searchInput.value = '';
  resultsSearchInput.value = '';
  currentSearchTerm = '';
}

function showResults() {
  dashboard.style.display = 'none';
  resultsPage.classList.add('show');
  frequentSearches.classList.remove('show');
  // Sync search input to results page
  resultsSearchInput.value = currentSearchTerm;
}
