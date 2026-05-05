// ==================== CART FUNCTIONALITY ====================

// Cart State
let cart = [];
let cartButton = null;
let cartCount = null;

// Initialize cart elements after DOM is loaded
function initializeCart() {
  cartButton = document.getElementById('cartButton');
  cartCount = document.getElementById('cartCount');

  const cartButtonResults = document.getElementById('cartButtonResults');
  const cartButtonDiq = document.getElementById('cartButtonDiq');

  if (cartButton) {
    cartButton.addEventListener('click', showCart);
  }

  if (cartButtonResults) {
    cartButtonResults.addEventListener('click', showCart);
  }

  if (cartButtonDiq) {
    cartButtonDiq.addEventListener('click', showCart);
  }

  loadCart();
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('dropiq_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartCount();
    } catch (error) {
      console.error('Error loading cart:', error);
      cart = [];
    }
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('dropiq_cart', JSON.stringify(cart));
  updateCartCount();
}

// Update cart count badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update all cart count badges
  const cartCountElements = [
    document.getElementById('cartCount'),
    document.getElementById('cartCountResults'),
    document.getElementById('cartCountDiq')
  ];

  cartCountElements.forEach(element => {
    if (element) {
      element.textContent = totalItems;
      element.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  });
}

// Add item to cart
function addToCart(product, event) {
  if (event) event.stopPropagation();

  console.log('Adding to cart:', product);

  // Check if product already exists in cart
  const existingItem = cart.find(item =>
    item.id === product.id && item.retailer_name === product.retailer_name
  );

  if (existingItem) {
    existingItem.quantity++;
    showNotification('✅ Quantity updated in cart!');
  } else {
    // Add new item with quantity 1
    cart.push({
      id: product.id,
      product_name: product.product_name || product.name,
      price_inr: product.price_inr || product.price,
      image_url: product.image_url || product.image,
      retailer_name: product.retailer_name || product.retailer,
      affiliate_url: product.affiliate_url || product.product_url || product.link,
      store_phone: product.store_phone || null,
      is_offline: product.is_offline_store || false,
      quantity: 1
    });
    showNotification('✅ Added to cart!');
  }

  saveCart();
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  showNotification('🗑️ Removed from cart');
}

// Update item quantity
function updateQuantity(index, change) {
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    saveCart();
    renderCart();
  }
}

// Calculate cart total
function getCartTotal() {
  return cart.reduce((total, item) => {
    const price = parseFloat(item.price_inr) || 0;
    return total + (price * item.quantity);
  }, 0);
}

// Show cart modal
function showCart() {
  console.log('Opening cart, items:', cart.length);

  // Create cart modal if it doesn't exist
  let cartModal = document.getElementById('cartModal');
  if (!cartModal) {
    cartModal = document.createElement('div');
    cartModal.id = 'cartModal';
    cartModal.className = 'cart-modal';
    cartModal.innerHTML = `
      <div class="cart-modal-content">
        <div class="cart-header">
          <h2>🛒 Your Cart</h2>
          <button class="cart-close" onclick="closeCart()">&times;</button>
        </div>
        <div id="cartItems" class="cart-items"></div>
        <div class="cart-footer">
          <div class="cart-total">
            <strong>Total:</strong> ₹<span id="cartTotal">0</span>
          </div>
          <button class="cart-clear-btn" onclick="clearCart()">Clear Cart</button>
          <!-- <button class="cart-checkout-btn" onclick="checkout()" disabled style="opacity: 0.5; cursor: not-allowed;">Proceed to Checkout (Coming Soon)</button> -->
        </div>
      </div>
    `;
    document.body.appendChild(cartModal);
  }

  renderCart();
  cartModal.classList.add('show');
}

// Close cart modal
function closeCart() {
  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    cartModal.classList.remove('show');
  }
}

// Render cart items
function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    if (cartTotalElement) cartTotalElement.textContent = '0';
    return;
  }

  const cartHTML = cart.map((item, index) => {
    const price = parseFloat(item.price_inr) || 0;
    const subtotal = price * item.quantity;

    return `
      <div class="cart-item">
        <div class="cart-item-image">
          ${item.image_url
        ? `<img src="${item.image_url}" alt="${item.product_name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>No Image</text></svg>';" />`
        : '<div class="no-image">No Image</div>'
      }
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.product_name}</h4>
          <p class="cart-item-store">Store: ${item.retailer_name}</p>
          <p class="cart-item-price">₹${price.toLocaleString('en-IN')}</p>
          ${item.store_phone ?
        `<a href="tel:${item.store_phone}" class="cart-item-link cart-call-btn">📞 Call Store: ${item.store_phone}</a>`
        : item.affiliate_url ?
          `<a href="${item.affiliate_url}" target="_blank" class="cart-item-link">🔗 View Product</a>`
          : ''}
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <div class="cart-item-subtotal">
          <p>₹${subtotal.toLocaleString('en-IN')}</p>
          <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  cartItemsContainer.innerHTML = cartHTML;

  if (cartTotalElement) {
    const total = getCartTotal();
    cartTotalElement.textContent = total.toLocaleString('en-IN');
  }
}

// Clear cart
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cart = [];
    saveCart();
    renderCart();
    showNotification('🗑️ Cart cleared');
  }
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // For now, just show a message with all product links
  const productLinks = cart.map(item => {
    return `• ${item.product_name} - ₹${item.price_inr} x ${item.quantity}\n  ${item.affiliate_url || 'No link available'}`;
  }).join('\n\n');

  alert(`Thank you for shopping with DropIQ!\n\nYour cart (${cart.length} items):\n\n${productLinks}\n\nTotal: ₹${getCartTotal().toLocaleString('en-IN')}\n\nYou can now visit each product link to complete your purchase.`);

  // Open all product links in new tabs
  if (confirm('Open all product links in new tabs?')) {
    cart.forEach(item => {
      if (item.affiliate_url) {
        window.open(item.affiliate_url, '_blank');
      }
    });
  }
}

// Show notification
function showNotification(message) {
  // Create notification if it doesn't exist
  let notification = document.getElementById('cartNotification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cartNotification';
    notification.className = 'cart-notification';
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}
