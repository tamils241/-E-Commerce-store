/**
 * Stackly E-Commerce Store - Main JavaScript
 * Single self-executing module handling all store functionality.
 */
(function () {
  "use strict";

  /* Safe localStorage wrapper — avoids file:// protocol errors */
  var safeStorage = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ─────────────────────────────────────────────
     1. PAGE LOADER
  ───────────────────────────────────────────── */
  function initLoader() {
    var loader = document.querySelector(".page-loader");
    if (!loader) return;
    setTimeout(function () {
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
      setTimeout(function () {
        loader.style.display = "none";
      }, 500);
    }, 1500);
  }

  /* ─────────────────────────────────────────────
     2. STICKY HEADER
  ───────────────────────────────────────────── */
  function initStickyHeader() {
    var header = document.querySelector(".header");
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────────────────
     3. MOBILE MENU
  ───────────────────────────────────────────── */
  function initMobileMenu() {
    var hamburger = document.querySelector(".hamburger");
    var mobileNav = document.getElementById("mobileNav");
    var overlay = document.getElementById("mobileNavOverlay");
    var closeBtn = document.getElementById("mobileNavClose");
    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.classList.add("active");
      mobileNav.classList.add("active");
      if (overlay) overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      hamburger.classList.remove("active");
      mobileNav.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (mobileNav.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    var navLinks = mobileNav.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("active")) closeMenu();
    });
  }

  /* ─────────────────────────────────────────────
     4. MEGA MENU
  ───────────────────────────────────────────── */
  function initMegaMenu() {
    var shopLink = document.querySelector('.main-nav a[href="#shop"], .main-nav a[href="shop.html"], .main-nav li:has(.mega-menu) > a');
    var megaMenu = document.querySelector(".mega-menu");
    if (!shopLink || !megaMenu) return;

    var hideTimeout = null;

    function showMega() {
      clearTimeout(hideTimeout);
      megaMenu.classList.add("show");
    }
    function scheduleHide() {
      hideTimeout = setTimeout(function () {
        megaMenu.classList.remove("show");
      }, 300);
    }

    // Hover
    shopLink.addEventListener("mouseenter", showMega);
    shopLink.addEventListener("mouseleave", scheduleHide);
    megaMenu.addEventListener("mouseenter", showMega);
    megaMenu.addEventListener("mouseleave", scheduleHide);

    // Click toggle (mobile)
    shopLink.addEventListener("click", function (e) {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        megaMenu.classList.toggle("show");
      }
    });
  }

  /* ─────────────────────────────────────────────
     5. SEARCH OVERLAY
  ───────────────────────────────────────────── */
  function initSearchOverlay() {
    var overlay = document.querySelector(".search-overlay");
    if (!overlay) return;
    var searchIcons = document.querySelectorAll(".search-icon, [data-action='search']");
    var closeBtn = overlay.querySelector(".search-close");
    var searchInput = overlay.querySelector("input");

    function show() {
      overlay.classList.add("active");
      overlay.style.display = "flex";
      requestAnimationFrame(function () {
        overlay.style.opacity = "1";
        if (searchInput) searchInput.focus();
      });
    }
    function hide() {
      overlay.style.opacity = "0";
      setTimeout(function () {
        overlay.classList.remove("active");
        overlay.style.display = "none";
      }, 300);
    }

    searchIcons.forEach(function (icon) {
      icon.addEventListener("click", function (e) {
        e.preventDefault();
        show();
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", hide);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hide();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("active")) hide();
    });

    // Initial state
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.3s ease";
    overlay.style.display = "none";
  }

  /* ─────────────────────────────────────────────
     6. DARK MODE
  ───────────────────────────────────────────── */
  function initDarkMode() {
    var toggle = document.querySelector(".dark-mode-toggle, [data-action='dark-mode']");
    if (!toggle) return;

    var body = document.body;
    var moonIcon = "fa-moon";
    var sunIcon = "fa-sun";

    function setIcon() {
      var icon = toggle.querySelector("i");
      if (!icon) return;
      icon.classList.remove(moonIcon, sunIcon);
      icon.classList.add(body.classList.contains("dark-mode") ? sunIcon : moonIcon);
    }

    // Load saved preference
    if (safeStorage.get("stackly-dark-mode") === "true") {
      body.classList.add("dark-mode");
    }
    setIcon();

    toggle.addEventListener("click", function () {
      body.classList.toggle("dark-mode");
      safeStorage.set("stackly-dark-mode", body.classList.contains("dark-mode"));
      setIcon();
    });
  }

  /* ─────────────────────────────────────────────
     7. HERO SLIDER
  ───────────────────────────────────────────── */
  function initHeroSlider() {
    var slider = document.querySelector(".hero");
    if (!slider) return;
    var slides = slider.querySelectorAll(".hero-slide");
    var dots = slider.querySelectorAll(".dot");
    var prevBtn = slider.querySelector(".hero-prev");
    var nextBtn = slider.querySelector(".hero-next");
    if (slides.length === 0) return;

    var current = 0;
    var autoTimer = null;
    var interval = 5000;

    function goTo(index) {
      slides[current].classList.remove("active");
      if (dots[current]) dots[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      if (dots[current]) dots[current].classList.add("active");
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, interval);
    }
    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        startAuto();
      });
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); startAuto(); });

    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);

    // Touch swipe
    var touchStartX = 0;
    var touchEndX = 0;
    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });

    // Ensure first slide is active
    if (!slider.querySelector(".hero-slide.active")) {
      slides[0].classList.add("active");
      if (dots[0]) dots[0].classList.add("active");
    }
    startAuto();
  }

  /* ─────────────────────────────────────────────
     8. COUNTDOWN TIMER
  ───────────────────────────────────────────── */
  function initCountdown(element) {
    if (!element) return;
    var endStr = element.getAttribute("data-end");
    var endTime = endStr ? new Date(endStr).getTime() : Date.now() + 2 * 24 * 60 * 60 * 1000;

    var daysEl = element.querySelector(".days, [data-unit='days']");
    var hoursEl = element.querySelector(".hours, [data-unit='hours']");
    var minutesEl = element.querySelector(".minutes, [data-unit='minutes']");
    var secondsEl = element.querySelector(".seconds, [data-unit='seconds']");

    function update() {
      var now = Date.now();
      var diff = endTime - now;
      if (diff <= 0) {
        diff = 0;
      }
      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);
      if (daysEl) daysEl.textContent = String(d).padStart(2, "0");
      if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
      if (minutesEl) minutesEl.textContent = String(m).padStart(2, "0");
      if (secondsEl) secondsEl.textContent = String(s).padStart(2, "0");
    }

    update();
    setInterval(update, 1000);
  }

  function initAllCountdowns() {
    document.querySelectorAll(".countdown").forEach(initCountdown);
  }

  /* ─────────────────────────────────────────────
     9. PRODUCT FILTERING
  ───────────────────────────────────────────── */
  function initProductFiltering() {
    var filterBtns = document.querySelectorAll("[data-filter]");
    var productCards = document.querySelectorAll(".product-card");
    if (filterBtns.length === 0 || productCards.length === 0) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");

        // Active state
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        productCards.forEach(function (card) {
          var category = card.getAttribute("data-category");
          var show = filter === "all" || category === filter;

          if (show) {
            card.style.opacity = "0";
            card.style.display = "";
            requestAnimationFrame(function () {
              card.style.transition = "opacity 0.4s ease";
              card.style.opacity = "1";
            });
          } else {
            card.style.transition = "opacity 0.4s ease";
            card.style.opacity = "0";
            setTimeout(function () {
              card.style.display = "none";
            }, 400);
          }
        });
      });
    });
  }

  /* ─────────────────────────────────────────────
     9a. MOBILE SIDEBAR TOGGLE
  ───────────────────────────────────────────── */
  function initMobileFilterSidebar() {
    var filterBtn = document.querySelector(".filter-btn");
    var sidebar = document.querySelector(".shop-sidebar");
    if (!filterBtn || !sidebar) return;

    filterBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (sidebar.classList.contains("active") && !sidebar.contains(e.target) && e.target !== filterBtn && !filterBtn.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });
  }

  /* ─────────────────────────────────────────────
     9b. SIDEBAR FILTERS (category, brand, price, rating, color)
  ───────────────────────────────────────────── */
  function initSidebarFilters() {
    var grid = document.querySelector(".products-grid");
    if (!grid) return;
    var cards = Array.from(grid.querySelectorAll(".product-card"));
    if (cards.length === 0) return;

    var filterState = { categories: [], brands: [], colors: [], minRating: 0, minPrice: 0, maxPrice: Infinity };

    function applyFilters() {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var cat = (card.getAttribute("data-category") || "").toLowerCase();
        var brand = (card.getAttribute("data-brand") || "").toLowerCase();
        var color = (card.getAttribute("data-color") || "").toLowerCase();
        var rating = parseFloat(card.getAttribute("data-rating")) || 0;
        var price = parseFloat(card.getAttribute("data-price")) || 0;

        var matchCat = filterState.categories.length === 0 || filterState.categories.indexOf(cat) !== -1;
        var matchBrand = filterState.brands.length === 0 || filterState.brands.indexOf(brand) !== -1;
        var matchColor = filterState.colors.length === 0 || filterState.colors.indexOf(color) !== -1;
        var matchRating = rating >= filterState.minRating;
        var matchPrice = price >= filterState.minPrice && price <= filterState.maxPrice;

        if (matchCat && matchBrand && matchColor && matchRating && matchPrice) {
          card.style.display = "";
          card.style.opacity = "1";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });
      var result = document.querySelector(".shop-results");
      if (result) result.textContent = "Showing " + visibleCount + " product" + (visibleCount !== 1 ? "s" : "");
    }

    document.querySelectorAll(".filter-options input[type='checkbox']").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var group = cb.closest(".filter-group");
        if (!group) return;
        var title = (group.querySelector(".filter-title") || {}).textContent || "";
        var label = cb.parentElement.textContent.trim().toLowerCase();

        if (title === "Categories") {
          filterState.categories = getCheckedValues(group);
        } else if (title === "Brands") {
          filterState.brands = getCheckedValues(group);
        }
        applyFilters();
      });
    });

    document.querySelectorAll(".filter-options input[type='radio']").forEach(function (rb) {
      rb.addEventListener("change", function () {
        var group = rb.closest(".filter-group");
        if (!group) return;
        var title = (group.querySelector(".filter-title") || {}).textContent || "";
        if (title === "Rating") {
          var checked = group.querySelector("input[type='radio']:checked");
          if (checked) {
            var stars = checked.parentElement.querySelectorAll("i.fas.fa-star").length;
            filterState.minRating = stars;
          }
          applyFilters();
        }
      });
    });

    var priceInputs = document.querySelectorAll(".price-range input");
    priceInputs.forEach(function (inp) {
      inp.addEventListener("input", function () {
        var minVal = parseFloat(priceInputs[0].value) || 0;
        var maxVal = priceInputs[1] ? parseFloat(priceInputs[1].value) || Infinity : Infinity;
        filterState.minPrice = minVal;
        filterState.maxPrice = maxVal;
        applyFilters();
      });
    });

    document.querySelectorAll(".color-swatch").forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        swatch.classList.toggle("active");
        var selected = [];
        document.querySelectorAll(".color-swatch.active").forEach(function (s) {
          var c = (s.getAttribute("title") || "").toLowerCase();
          if (c) selected.push(c);
        });
        filterState.colors = selected;
        applyFilters();
      });
    });

    document.querySelectorAll(".size-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.classList.toggle("active");
      });
    });

    function getCheckedValues(group) {
      var vals = [];
      group.querySelectorAll("input[type='checkbox']:checked").forEach(function (cb) {
        var t = (cb.parentElement.textContent || "").trim().split("(")[0].trim().toLowerCase();
        if (t) vals.push(t);
      });
      return vals;
    }
  }

  /* ─────────────────────────────────────────────
     10. PRODUCT SORTING
  ───────────────────────────────────────────── */
  function initProductSorting() {
    var sortSelect = document.querySelector(".sort-select");
    var grid = document.querySelector(".products-grid");
    if (!sortSelect || !grid) return;

    sortSelect.addEventListener("change", function () {
      var value = sortSelect.value;
      var items = Array.from(grid.children);

      items.forEach(function (item) {
        item.style.transition = "opacity 0.3s ease";
        item.style.opacity = "0";
      });

      setTimeout(function () {
        items.sort(function (a, b) {
          var priceA = parseFloat(a.getAttribute("data-price")) || 0;
          var priceB = parseFloat(b.getAttribute("data-price")) || 0;
          var ratingA = parseFloat(a.getAttribute("data-rating")) || 0;
          var ratingB = parseFloat(b.getAttribute("data-rating")) || 0;
          var dateA = parseInt(a.getAttribute("data-date")) || 0;
          var dateB = parseInt(b.getAttribute("data-date")) || 0;

          switch (value) {
            case "price-low": return priceA - priceB;
            case "price-high": return priceB - priceA;
            case "rating": return ratingB - ratingA;
            case "newest": return dateB - dateA;
            default: return 0;
          }
        });

        items.forEach(function (item) {
          grid.appendChild(item);
          requestAnimationFrame(function () {
            item.style.opacity = "1";
          });
        });
      }, 300);
    });
  }

  /* ─────────────────────────────────────────────
     11. GRID / LIST VIEW TOGGLE
  ───────────────────────────────────────────── */
  function initViewToggle() {
    var viewBtns = document.querySelectorAll(".view-btn");
    var grid = document.querySelector(".products-grid");
    if (viewBtns.length === 0 || !grid) return;

    viewBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var view = btn.getAttribute("data-view");
        viewBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        grid.classList.remove("grid-view", "list-view");
        grid.classList.add(view + "-view");
      });
    });
  }

  /* ─────────────────────────────────────────────
     12. QUANTITY CONTROLS
  ───────────────────────────────────────────── */
  function initQuantityControls() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".qty-plus, .qty-minus, .qty-btn");
      if (!btn) return;

      var wrapper = btn.closest(".quantity-control, .qty-wrapper, .cart-qty, .quantity");
      if (!wrapper) return;
      var display = wrapper.querySelector(".qty-value, input[type='number'], .quantity-value");
      if (!display) return;

      var current = parseInt(display.value || display.textContent) || 1;
      var min = parseInt(wrapper.getAttribute("data-min")) || 1;
      var max = parseInt(wrapper.getAttribute("data-max")) || 99;

      var icon = btn.querySelector("i");
      var isPlus = btn.classList.contains("qty-plus") || (icon && icon.classList.contains("fa-plus"));
      var isMinus = btn.classList.contains("qty-minus") || (icon && icon.classList.contains("fa-minus"));

      if (isPlus) {
        current = Math.min(current + 1, max);
      } else if (isMinus) {
        current = Math.max(current - 1, min);
      } else {
        return;
      }

      if (display.tagName === "INPUT") {
        display.value = current;
      } else {
        display.textContent = current;
      }

      wrapper.dispatchEvent(new CustomEvent("qtyChange", {
        detail: { quantity: current },
        bubbles: true
      }));
    });
  }

  /* ─────────────────────────────────────────────
     13. ADD TO CART (UI handler)
  ───────────────────────────────────────────── */
  function initAddToCartButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".product-add-btn, .btn-add-cart");
      if (!btn) return;

      var card = btn.closest(".product-card, .product-detail, .product-info, .pdp-grid");
      if (!card) return;

      var item = {
        id: btn.getAttribute("data-id") || card.getAttribute("data-id") || "prod-" + Date.now(),
        name: card.getAttribute("data-name") || (card.querySelector(".product-title, .product-name, .pdp-title, h3, h2") || {}).textContent || "Product",
        price: parseFloat(btn.getAttribute("data-price") || card.getAttribute("data-price")) || parseFloat(((card.querySelector(".current, .product-price, .pdp-price .current") || {}).textContent || "").replace(/[^0-9.]/g, "")) || 0,
        image: card.getAttribute("data-image") || (card.querySelector("img") || {}).src || "",
        qty: 1
      };

      // Check if qty control exists nearby
      var qtyDisplay = card.querySelector(".qty-value, .quantity-value");
      if (qtyDisplay) {
        item.qty = parseInt(qtyDisplay.textContent || qtyDisplay.value) || 1;
      }

      Stackly.addToCart(item);
      Stackly.showToast(item.name + " added to cart!", "success");
      animateBadge();
    });
  }

  function animateBadge() {
    var badge = document.querySelector("#cartBadge");
    if (!badge) return;
    badge.classList.remove("pop");
    void badge.offsetWidth; // reflow
    badge.classList.add("pop");
  }

  /* ─────────────────────────────────────────────
     14. CART MANAGEMENT (core)
  ───────────────────────────────────────────── */
  function getCart() {
    try {
      return JSON.parse(safeStorage.get("stackly-cart")) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    safeStorage.set("stackly-cart", JSON.stringify(cart));
    updateCartBadge();
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = cart.find(function (c) { return c.id === item.id; });
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: item.qty || 1
      });
    }
    saveCart(cart);
  }

  function removeFromCart(id) {
    var cart = getCart().filter(function (c) { return c.id !== id; });
    saveCart(cart);
  }

  function updateQty(id, qty) {
    var cart = getCart();
    var item = cart.find(function (c) { return c.id === id; });
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(cart);
    }
  }

  function getCartTotal() {
    return getCart().reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function updateCartBadge() {
    var badges = document.querySelectorAll("#cartBadge");
    var count = getCartCount();
    badges.forEach(function (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "" : "none";
    });
  }

  /* ─────────────────────────────────────────────
     15. CART PAGE RENDERING
  ───────────────────────────────────────────── */
  function initCartPage() {
    var cartBody = document.getElementById("cart-items");
    if (!cartBody) return;

    var subtotalEl = document.getElementById("cart-subtotal");
    var shippingEl = document.getElementById("cart-shipping");
    var totalEl = document.getElementById("cart-total");

    function render() {
      var cart = getCart();
      updateCartBadge();

      if (cart.length === 0) {
        cartBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:3rem;"><i class="fas fa-shopping-cart" style="font-size:3rem;color:#ccc;display:block;margin-bottom:12px;"></i>Your cart is empty. <a href="shop.html">Start shopping</a></td></tr>';
        updateCartTotals();
        return;
      }

      var html = "";
      cart.forEach(function (item) {
        html += '<tr class="cart-row" data-id="' + item.id + '">';
        html += '  <td>';
        html += '    <div class="cart-product">';
        html += '      <img src="' + (item.image || "images/placeholder.jpg") + '" alt="' + item.name + '">';
        html += '      <div>';
        html += '        <a href="product.html" class="cart-product-name">' + item.name + '</a>';
        html += '      </div>';
        html += '    </div>';
        html += '  </td>';
        html += '  <td>$' + item.price.toFixed(2) + '</td>';
        html += '  <td>';
        html += '    <div class="cart-qty">';
        html += '      <button class="qty-btn qty-minus" data-id="' + item.id + '" aria-label="Decrease quantity"><i class="fas fa-minus"></i></button>';
        html += '      <span>' + item.qty + '</span>';
        html += '      <button class="qty-btn qty-plus" data-id="' + item.id + '" aria-label="Increase quantity"><i class="fas fa-plus"></i></button>';
        html += '    </div>';
        html += '  </td>';
        html += '  <td>$' + (item.price * item.qty).toFixed(2) + '</td>';
        html += '  <td><button class="cart-remove remove-item" data-id="' + item.id + '" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button></td>';
        html += '</tr>';
      });
      cartBody.innerHTML = html;
      updateCartTotals();
    }

    function updateCartTotals() {
      var subtotal = getCartTotal();
      var shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
      var discount = window._stacklyDiscount || 0;
      var discountAmount = subtotal * discount;
      var total = subtotal - discountAmount + shipping;

      if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
      if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? "Free" : "$" + shipping.toFixed(2);
        shippingEl.style.color = shipping === 0 ? "#2ecc71" : "";
      }
      if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
    }

    cartBody.addEventListener("click", function (e) {
      var minus = e.target.closest(".qty-minus");
      var plus = e.target.closest(".qty-plus");
      var remove = e.target.closest(".remove-item");

      if (minus || plus) {
        var id = (minus || plus).getAttribute("data-id");
        var row = (minus || plus).closest(".cart-row");
        if (!row) return;
        var display = row.querySelector(".cart-qty span");
        if (!display) return;
        var current = parseInt(display.textContent) || 1;
        var newQty = minus ? Math.max(1, current - 1) : Math.min(99, current + 1);
        updateQty(id, newQty);
        display.textContent = newQty;
        var item = getCart().find(function (c) { return c.id === id; });
        if (item) {
          var priceCell = row.querySelector("td:nth-child(4)");
          if (priceCell) priceCell.textContent = "$" + (item.price * newQty).toFixed(2);
        }
        updateCartTotals();
      }

      if (remove) {
        var removeId = remove.getAttribute("data-id");
        removeFromCart(removeId);
        render();
        Stackly.showToast("Item removed from cart", "warning");
      }
    });

    render();
  }

  /* ─────────────────────────────────────────────
     16. WISHLIST
  ───────────────────────────────────────────── */
  function getWishlist() {
    try {
      return JSON.parse(safeStorage.get("stackly-wishlist")) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(list) {
    safeStorage.set("stackly-wishlist", JSON.stringify(list));
    updateWishlistBadge();
  }

  function updateWishlistBadge() {
    var badges = document.querySelectorAll("#wishlistBadge");
    var count = getWishlist().length;
    badges.forEach(function (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "" : "none";
    });
  }

  function initWishlist() {
    document.addEventListener("click", function (e) {
      var heart = e.target.closest(".wishlist-btn, .wishlist-icon, .btn-wishlist, [data-action='wishlist']");
      if (!heart) return;
      e.preventDefault();

      var card = heart.closest(".product-card, .product-detail, .product-info, .pdp-grid");
      var id = heart.getAttribute("data-id") || (card && card.getAttribute("data-id")) || "item-" + Date.now();
      var name = (card && (card.getAttribute("data-name") || (card.querySelector(".product-title, .product-name, .pdp-title, h3, h2") || {}).textContent)) || "Product";
      var price = parseFloat(heart.getAttribute("data-price") || (card && card.getAttribute("data-price")) || ((card && (card.querySelector(".current, .product-price, .pdp-price .current") || {}).textContent || "").replace(/[^0-9.]/g, ""))) || 0;
      var image = (card && (card.getAttribute("data-image") || (card.querySelector("img") || {}).src)) || "";

      var list = getWishlist();
      var idx = list.findIndex(function (w) { return w.id === id; });
      var icon = heart.querySelector("i");

      if (idx > -1) {
        list.splice(idx, 1);
        if (icon) { icon.classList.remove("fas"); icon.classList.add("far"); }
        heart.classList.remove("active");
        Stackly.showToast(name + " removed from wishlist", "warning");
      } else {
        list.push({ id: id, name: name, price: price, image: image });
        if (icon) { icon.classList.remove("far"); icon.classList.add("fas"); }
        heart.classList.add("active");
        Stackly.showToast(name + " added to wishlist!", "success");
      }
      saveWishlist(list);
    });

    var list = getWishlist();
    list.forEach(function (item) {
      var btn = document.querySelector('.wishlist-btn[data-id="' + item.id + '"], .wishlist-icon[data-id="' + item.id + '"]');
      if (btn) {
        btn.classList.add("active");
        var i = btn.querySelector("i");
        if (i) { i.classList.remove("far"); i.classList.add("fas"); }
      }
    });
  }

  /* ─────────────────────────────────────────────
     16b. WISHLIST PAGE RENDERING
  ───────────────────────────────────────────── */
  function initWishlistPage() {
    var grid = document.getElementById("wishlistGrid");
    if (!grid) return;

    var emptyEl = document.getElementById("wishlistEmpty");
    var countEl = document.getElementById("wishlistCount");

    function render() {
      var list = getWishlist();
      if (countEl) countEl.textContent = "Saved Items (" + list.length + ")";

      if (list.length === 0) {
        grid.style.display = "none";
        if (emptyEl) emptyEl.style.display = "block";
        return;
      }

      grid.style.display = "";
      if (emptyEl) emptyEl.style.display = "none";

      var html = "";
      list.forEach(function (item) {
        html += '<div class="wishlist-card" data-id="' + item.id + '">';
        html += '  <button class="wishlist-remove" data-id="' + item.id + '" aria-label="Remove from wishlist"><i class="fas fa-times"></i></button>';
        html += '  <div class="wishlist-img">';
        html += '    <img src="' + (item.image || "images/placeholder.jpg") + '" alt="' + item.name + '">';
        html += '  </div>';
        html += '  <div class="wishlist-info">';
        html += '    <span class="product-category">Wishlist</span>';
        html += '    <h4 class="product-name">' + item.name + '</h4>';
        html += '    <div class="product-price"><span class="current">$' + item.price.toFixed(2) + '</span></div>';
        html += '    <button class="wishlist-add-btn product-add-btn" data-id="' + item.id + '" data-price="' + item.price + '" data-name="' + item.name + '" data-image="' + item.image + '"><i class="fas fa-shopping-bag"></i> Add to Cart</button>';
        html += '  </div>';
        html += '</div>';
      });
      grid.innerHTML = html;
    }

    grid.addEventListener("click", function (e) {
      var removeBtn = e.target.closest(".wishlist-remove");
      if (removeBtn) {
        var id = removeBtn.getAttribute("data-id");
        var list = getWishlist();
        var item = list.find(function (w) { return w.id === id; });
        list = list.filter(function (w) { return w.id !== id; });
        saveWishlist(list);
        render();
        if (item) Stackly.showToast(item.name + " removed from wishlist", "warning");
        return;
      }

      var addBtn = e.target.closest(".wishlist-add-btn");
      if (addBtn) {
        var card = addBtn.closest(".wishlist-card");
        var addId = addBtn.getAttribute("data-id");
        var addItem = {
          id: addId,
          name: addBtn.getAttribute("data-name") || (card && card.querySelector(".product-name") || {}).textContent || "Product",
          price: parseFloat(addBtn.getAttribute("data-price")) || 0,
          image: addBtn.getAttribute("data-image") || (card && (card.querySelector("img") || {}).src) || "",
          qty: 1
        };
        Stackly.addToCart(addItem);

        var wishList = getWishlist();
        wishList = wishList.filter(function (w) { return w.id !== addId; });
        saveWishlist(wishList);
        render();
        Stackly.showToast(addItem.name + " added to cart!", "success");
      }
    });

    render();
  }

  /* ─────────────────────────────────────────────
     17. PRODUCT QUICK VIEW MODAL
  ───────────────────────────────────────────── */
  function initQuickView() {
    var modal = document.getElementById("quickviewModal");
    if (!modal) return;
    var closeBtn = document.getElementById("quickviewClose");
    var overlay = document.getElementById("quickviewOverlay");

    document.addEventListener("click", function (e) {
      var eyeBtn = e.target.closest(".quick-view-btn, [data-action='quick-view']");
      if (!eyeBtn) return;
      e.preventDefault();

      var card = eyeBtn.closest(".product-card");
      if (!card) return;

      var qvImg = document.getElementById("qvImg");
      var qvName = document.getElementById("qvName");
      var qvPrice = document.getElementById("qvPrice");
      var qvOldPrice = document.getElementById("qvOldPrice");
      var qvCat = document.getElementById("qvCat");
      var qvAddCart = document.getElementById("qvAddCart");

      if (qvImg) qvImg.src = card.getAttribute("data-image") || (card.querySelector("img") || {}).src || "";
      if (qvName) qvName.textContent = card.getAttribute("data-name") || "";
      if (qvPrice) qvPrice.textContent = "$" + (parseFloat(card.getAttribute("data-price")) || 0).toFixed(2);
      if (qvCat) qvCat.textContent = (card.querySelector(".product-category") || {}).textContent || "";
      if (qvAddCart) {
        qvAddCart.setAttribute("data-id", card.getAttribute("data-id") || "");
        qvAddCart.setAttribute("data-price", card.getAttribute("data-price") || "0");
        qvAddCart.setAttribute("data-name", card.getAttribute("data-name") || "");
        qvAddCart.setAttribute("data-image", card.getAttribute("data-image") || "");
      }

      modal.classList.add("active");
      modal.style.display = "flex";
      requestAnimationFrame(function () { modal.style.opacity = "1"; });
    });

    function closeModal() {
      modal.style.opacity = "0";
      setTimeout(function () {
        modal.classList.remove("active");
        modal.style.display = "none";
      }, 300);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
      var addBtn = e.target.closest("#qvAddCart");
      if (addBtn) {
        var item = {
          id: addBtn.getAttribute("data-id") || "prod-" + Date.now(),
          name: addBtn.getAttribute("data-name") || "Product",
          price: parseFloat(addBtn.getAttribute("data-price")) || 0,
          image: addBtn.getAttribute("data-image") || "",
          qty: 1
        };
        Stackly.addToCart(item);
        Stackly.showToast(item.name + " added to cart!", "success");
        closeModal();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });

    modal.style.opacity = "0";
    modal.style.transition = "opacity 0.3s ease";
    modal.style.display = "none";
  }

  /* ─────────────────────────────────────────────
     18. COMPARE TOGGLE
  ───────────────────────────────────────────── */
  function initCompare() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".compare-btn, [data-action='compare']");
      if (!btn) return;
      e.preventDefault();

      var card = btn.closest(".product-card");
      if (!card) return;
      var name = card.getAttribute("data-name") || "Product";

      var icon = btn.querySelector("i");
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        if (icon) { icon.style.color = ""; }
        Stackly.showToast(name + " removed from compare", "warning");
      } else {
        btn.classList.add("active");
        if (icon) { icon.style.color = "#4F46E5"; }
        Stackly.showToast(name + " added to compare!", "success");
      }
    });
  }

  /* ─────────────────────────────────────────────
     18. PRODUCT DETAIL IMAGE GALLERY
  ───────────────────────────────────────────── */
  function initProductGallery() {
    // Handle standard gallery
    var gallery = document.querySelector(".product-gallery, .gallery");
    if (gallery) {
      var mainImage = gallery.querySelector(".main-image img, .gallery-main img");
      var thumbnails = gallery.querySelectorAll(".thumbnail, .gallery-thumb");
      if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(function (thumb) {
          thumb.addEventListener("click", function () {
            var src = thumb.getAttribute("src") || thumb.getAttribute("data-src") || thumb.querySelector("img");
            if (src && typeof src === "string") {
              mainImage.src = src;
            } else if (src && src.src) {
              mainImage.src = src.src;
            }
            thumbnails.forEach(function (t) { t.classList.remove("active"); });
            thumb.classList.add("active");
          });
        });
      }
    }

    // Handle PDP gallery
    var pdpGallery = document.querySelector(".pdp-gallery");
    if (pdpGallery) {
      var pdpMain = pdpGallery.querySelector("#mainProductImage");
      var pdpThumbs = pdpGallery.querySelectorAll(".pdp-thumb");
      if (pdpMain && pdpThumbs.length > 0) {
        pdpThumbs.forEach(function (thumb) {
          thumb.addEventListener("click", function () {
            var img = thumb.querySelector("img");
            if (img && img.src) {
              pdpMain.src = img.src;
            }
            pdpThumbs.forEach(function (t) { t.classList.remove("active"); });
            thumb.classList.add("active");
          });
        });
      }
    }
  }

  /* ─────────────────────────────────────────────
     19. PRODUCT DETAIL TABS
  ───────────────────────────────────────────── */
  function initProductTabs() {
    var tabBtns = document.querySelectorAll(".tab-btn");
    var tabContents = document.querySelectorAll(".tab-content");
    if (tabBtns.length === 0) return;

    function activateTab(index) {
      tabBtns.forEach(function (b) { b.classList.remove("active"); });
      tabContents.forEach(function (c) { c.classList.remove("active"); });
      if (tabBtns[index]) tabBtns[index].classList.add("active");
      if (tabContents[index]) tabContents[index].classList.add("active");
    }

    tabBtns.forEach(function (btn, i) {
      btn.addEventListener("click", function () { activateTab(i); });
    });

    // Default first tab
    if (tabBtns.length > 0) activateTab(0);
  }

  /* ─────────────────────────────────────────────
     19b. PDP VARIANT PICKERS (color / size)
  ───────────────────────────────────────────── */
  function initPdpVariantPickers() {
    document.addEventListener("click", function (e) {
      var colorOpt = e.target.closest(".color-option");
      if (colorOpt) {
        var picker = colorOpt.closest(".color-picker");
        if (picker) {
          picker.querySelectorAll(".color-option").forEach(function (c) { c.classList.remove("active"); });
        }
        colorOpt.classList.add("active");
        return;
      }

      var sizeOpt = e.target.closest(".size-option");
      if (sizeOpt) {
        var sizeWrap = sizeOpt.closest(".size-options, .size-options-detail");
        if (sizeWrap) {
          sizeWrap.querySelectorAll(".size-option").forEach(function (s) { s.classList.remove("active"); });
        }
        sizeOpt.classList.add("active");
      }
    });
  }

  /* ─────────────────────────────────────────────
     20. FAQ ACCORDION
  ───────────────────────────────────────────── */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll(".faq-item");
    if (faqItems.length === 0) return;

    faqItems.forEach(function (item) {
      var question = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer, .faq-body");
      if (!question) return;

      question.addEventListener("click", function () {
        var isOpen = item.classList.contains("active");

        // Close all
        faqItems.forEach(function (other) {
          other.classList.remove("active");
          var otherAnswer = other.querySelector(".faq-answer, .faq-body");
          if (otherAnswer) {
            otherAnswer.style.maxHeight = null;
            otherAnswer.style.overflow = "hidden";
          }
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add("active");
          if (answer) {
            answer.style.overflow = "hidden";
            answer.style.maxHeight = answer.scrollHeight + "px";
          }
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     21. BACK TO TOP
  ───────────────────────────────────────────── */
  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;

    function toggleVisibility() {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
      } else {
        btn.classList.remove("visible");
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
      }
    }

    btn.style.opacity = "0";
    btn.style.pointerEvents = "none";
    btn.style.transition = "opacity 0.3s ease";
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ─────────────────────────────────────────────
     22. TOAST NOTIFICATIONS
  ───────────────────────────────────────────── */
  function showToast(message, type) {
    type = type || "success";
    var container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    var colors = { success: "#27ae60", error: "#e74c3c", warning: "#f39c12" };
    var icons = { success: "fa-check-circle", error: "fa-exclamation-circle", warning: "fa-exclamation-triangle" };

    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.style.cssText = "background:" + (colors[type] || colors.success) + ";color:#fff;padding:12px 24px;border-radius:8px;margin-top:10px;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:translateX(100%);transition:all 0.3s ease;opacity:0;";
    toast.innerHTML = '<i class="fas ' + (icons[type] || icons.success) + '"></i><span>' + message + '</span>';

    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    });

    setTimeout(function () {
      toast.style.transform = "translateX(100%)";
      toast.style.opacity = "0";
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /* ─────────────────────────────────────────────
     23. NEWSLETTER FORM
  ───────────────────────────────────────────── */
  function initNewsletter() {
    var form = document.querySelector(".newsletter-form, #newsletter-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailInput = form.querySelector("input[type='email'], input[name='email']");
      var email = emailInput ? emailInput.value.trim() : "";

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }

      showToast("Thanks for subscribing!", "success");
      form.reset();
    });
  }

  /* ─────────────────────────────────────────────
     24. CONTACT FORM
  ───────────────────────────────────────────── */
  function initContactForm() {
    var form = document.querySelector(".contact-form, #contact-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[name='name'], #contactName") || {}).value || "";
      var email = (form.querySelector("[name='email'], #contactEmail") || {}).value || "";
      var message = (form.querySelector("[name='message'], #contactMessage") || {}).value || "";

      if (!name.trim()) { showToast("Please enter your name.", "error"); return; }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast("Please enter a valid email.", "error"); return; }
      if (!message.trim()) { showToast("Please enter a message.", "error"); return; }

      showToast("Message sent successfully!", "success");
      form.reset();
    });
  }

  /* ─────────────────────────────────────────────
     25. AUTH FORM VALIDATION
  ───────────────────────────────────────────── */
  function initAuthForms() {
    // Login form
    var loginForm = document.querySelector(".login-form, #loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (loginForm.querySelector("[type='email'], [name='email']") || {}).value || "";
        var password = (loginForm.querySelector("[type='password'], [name='password']") || {}).value || "";
        var roleEl = loginForm.querySelector("[name='role']:checked");
        var role = roleEl ? roleEl.value : "customer";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast("Enter a valid email.", "error"); return;
        }
        if (!password || password.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
        if (!/[A-Z]/.test(password)) { showToast("Password needs an uppercase letter.", "error"); return; }
        if (!/[a-z]/.test(password)) { showToast("Password needs a lowercase letter.", "error"); return; }
        if (!/[0-9]/.test(password)) { showToast("Password needs a number.", "error"); return; }
        if (!/[^A-Za-z0-9]/.test(password)) { showToast("Password needs a special character.", "error"); return; }

        var rememberMe = loginForm.querySelector("#rememberMe");
        if (rememberMe && !rememberMe.checked) {
          showToast("Please check 'Remember me' to continue.", "error"); return;
        }

        var users = JSON.parse(safeStorage.get("stacklyUsers") || "[]");
        var user = users.find(function(u) { return u.email === email && u.role === role; });

        if (!user) {
          user = { name: email.split("@")[0], email: email, password: password, role: role };
          users.push(user);
          safeStorage.set("stacklyUsers", JSON.stringify(users));
        }

        safeStorage.set("stacklyCurrentUser", JSON.stringify(user));
        showToast("Logged in successfully! Redirecting...", "success");

        setTimeout(function() {
          if (role === "admin") {
            window.location.href = "admin-dashboard.html";
          } else {
            window.location.href = "customer-dashboard.html";
          }
        }, 1000);
      });
    }

    // Register form
    var registerForm = document.querySelector(".register-form, #registerForm");
    if (registerForm) {
      var regPassword = registerForm.querySelector("[name='password']");
      var regConfirm = registerForm.querySelector("[name='confirm-password']");
      var strengthBar = document.getElementById("strengthBar");
      var strengthText = document.getElementById("strengthText");

      function checkPasswordStrength(pw) {
        var score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
      }

      function updateStrengthBar(pw) {
        if (!strengthBar || !strengthText) return;
        var score = checkPasswordStrength(pw);
        var percent = 0;
        var label = "";
        var color = "";

        if (pw.length === 0) {
          percent = 0; label = ""; color = "";
        } else if (score <= 2) {
          percent = 25; label = "Weak"; color = "#ef4444";
        } else if (score <= 3) {
          percent = 50; label = "Fair"; color = "#f59e0b";
        } else if (score <= 4) {
          percent = 75; label = "Good"; color = "#3b82f6";
        } else {
          percent = 100; label = "Strong"; color = "#10b981";
        }

        strengthBar.style.width = percent + "%";
        strengthBar.style.background = color;
        strengthText.textContent = label;
        strengthText.style.color = color;
      }

      if (regPassword) {
        regPassword.addEventListener("input", function () {
          updateStrengthBar(regPassword.value);
        });
      }

      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstName = (registerForm.querySelector("[name='first-name']") || {}).value || "";
        var email = (registerForm.querySelector("[type='email'], [name='email']") || {}).value || "";
        var password = (regPassword || {}).value || "";
        var confirm = (regConfirm || {}).value || "";
        var roleEl = registerForm.querySelector("[name='role']:checked");
        var role = roleEl ? roleEl.value : "customer";

        if (!firstName) { showToast("Enter your first name.", "error"); return; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast("Enter a valid email.", "error"); return;
        }
        if (password.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
        if (!/[A-Z]/.test(password)) { showToast("Password needs an uppercase letter.", "error"); return; }
        if (!/[a-z]/.test(password)) { showToast("Password needs a lowercase letter.", "error"); return; }
        if (!/[0-9]/.test(password)) { showToast("Password needs a number.", "error"); return; }
        if (!/[^A-Za-z0-9]/.test(password)) { showToast("Password needs a special character.", "error"); return; }
        if (password !== confirm) {
          showToast("Passwords do not match!", "error");
          if (regConfirm) regConfirm.style.borderColor = "#ef4444";
          return;
        }

        var users = JSON.parse(safeStorage.get("stacklyUsers") || "[]");
        if (users.find(function(u) { return u.email === email && u.role === role; })) {
          showToast("An account with this email already exists.", "error"); return;
        }

        var newUser = { firstName: firstName, email: email, password: password, role: role };
        users.push(newUser);
        safeStorage.set("stacklyUsers", JSON.stringify(users));

        showToast("Account created! Redirecting to login...", "success");
        registerForm.reset();
        if (strengthBar) { strengthBar.style.width = "0"; }
        if (strengthText) { strengthText.textContent = ""; }

        setTimeout(function() { window.location.href = "login.html"; }, 1200);
      });

      if (regConfirm) {
        regConfirm.addEventListener("input", function () {
          if (regPassword && regConfirm.value && regPassword.value !== regConfirm.value) {
            regConfirm.style.borderColor = "#ef4444";
          } else {
            regConfirm.style.borderColor = "";
          }
        });
      }
    }

    // Password visibility toggles
    document.addEventListener("click", function (e) {
      var toggle = e.target.closest(".toggle-pass, .toggle-password, [data-action='toggle-password']");
      if (!toggle) return;
      var wrapper = toggle.closest(".input-group, .form-group");
      if (!wrapper) return;
      var input = wrapper.querySelector("input[type='password'], input[type='text']");
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        toggle.classList.add("visible");
      } else {
        input.type = "password";
        toggle.classList.remove("visible");
      }
    });
  }

  /* ─────────────────────────────────────────────
     26. SCROLL ANIMATIONS
  ───────────────────────────────────────────── */
  function initScrollAnimations() {
    if (!("IntersectionObserver" in window)) return;

    // Reveal elements
    var revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length > 0) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      revealElements.forEach(function (el) { revealObserver.observe(el); });
    }

    // Stagger children
    var staggerContainers = document.querySelectorAll(".stagger-children");
    if (staggerContainers.length > 0) {
      var staggerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var children = entry.target.children;
            Array.from(children).forEach(function (child, i) {
              child.style.transition = "opacity 0.5s ease " + (i * 0.1) + "s, transform 0.5s ease " + (i * 0.1) + "s";
              child.classList.add("revealed");
            });
            staggerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      staggerContainers.forEach(function (el) { staggerObserver.observe(el); });
    }
  }

  /* ─────────────────────────────────────────────
     27. SMOOTH SCROLL
  ───────────────────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var href = anchor.getAttribute("href");
      if (!href || href === "#" || href === "#0") return;

      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ─────────────────────────────────────────────
     28. LAZY IMAGE LOADING
  ───────────────────────────────────────────── */
  function initLazyImages() {
    var images = document.querySelectorAll("img[data-src]");
    if (images.length === 0) return;

    if ("IntersectionObserver" in window) {
      var imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.getAttribute("data-src");
            img.removeAttribute("data-src");
            img.classList.add("loaded");
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: "200px" });

      images.forEach(function (img) { imgObserver.observe(img); });
    } else {
      // Fallback
      images.forEach(function (img) {
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      });
    }
  }

  /* ─────────────────────────────────────────────
     29. COUPON SYSTEM
  ───────────────────────────────────────────── */
  function initCouponSystem() {
    var couponInput = document.querySelector(".coupon-input, #coupon-code, [name='coupon']");
    var couponBtn = document.querySelector(".coupon-btn, .apply-coupon, #apply-coupon");
    if (!couponInput || !couponBtn) return;

    var coupons = {
      "STACKLY10": 0.10,
      "WELCOME20": 0.20
    };

    couponBtn.addEventListener("click", function () {
      var code = couponInput.value.trim().toUpperCase();
      if (coupons[code] !== undefined) {
        window._stacklyDiscount = coupons[code];
        showToast("Coupon applied! " + (coupons[code] * 100) + "% discount.", "success");

        // Re-render cart totals if on cart page
        var cartBody = document.querySelector(".cart-body, .cart-items, #cart-items");
        if (cartBody && cartBody.children.length > 0) {
          // Trigger re-render by dispatching event
          document.dispatchEvent(new Event("couponApplied"));
        }
      } else {
        window._stacklyDiscount = 0;
        showToast("Invalid coupon code.", "error");
      }
    });

    // Listen for couponApplied to re-calculate totals
    document.addEventListener("couponApplied", function () {
      var subtotal = getCartTotal();
      var shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
      var discount = window._stacklyDiscount || 0;
      var total = subtotal * (1 - discount) + shipping;

      var subtotalEl = document.querySelector(".cart-subtotal, #cart-subtotal");
      var totalEl = document.querySelector(".cart-total, #cart-total");
      var discountEl = document.querySelector(".cart-discount, #cart-discount");

      if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
      if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
      if (discountEl) {
        discountEl.textContent = "-$" + (subtotal * discount).toFixed(2);
        discountEl.closest(".discount-row") && (discountEl.closest(".discount-row").style.display = discount > 0 ? "" : "none");
      }
    });
  }

  /* ─────────────────────────────────────────────
     29b. DYNAMIC PRODUCT PAGE
  ───────────────────────────────────────────── */
  function initDynamicProductPage() {
    var mainImage = document.getElementById("mainProductImage");
    if (!mainImage) return;

    var params = new URLSearchParams(window.location.search);
    var name = params.get("name");
    if (!name) return;

    var price = params.get("price") || "";
    var oldPrice = params.get("oldPrice") || "";
    var image = params.get("image") || "";
    var category = params.get("category") || "";
    var rating = parseFloat(params.get("rating")) || 5;
    var reviews = params.get("reviews") || "0";
    var brand = params.get("brand") || "";

    document.title = "Stackly - " + name.replace(/\+/g, " ");

    var pageTitle = document.querySelector(".page-title");
    if (pageTitle) pageTitle.textContent = name.replace(/\+/g, " ");

    var breadcrumbCurrent = document.querySelector(".breadcrumb .current");
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = name.replace(/\+/g, " ");

    if (image) mainImage.src = image;

    var pdpGrid = document.getElementById("pdpGrid");
    if (pdpGrid) {
      if (params.get("id")) pdpGrid.setAttribute("data-id", params.get("id"));
      pdpGrid.setAttribute("data-name", name.replace(/\+/g, " "));
      if (price) pdpGrid.setAttribute("data-price", price);
      if (image) pdpGrid.setAttribute("data-image", image);
    }

    var thumbs = document.querySelectorAll(".pdp-thumb img");
    if (image && thumbs.length > 0) {
      thumbs.forEach(function (t) { t.src = image; });
    }

    var brandEl = document.querySelector(".pdp-brand");
    if (brandEl && brand) brandEl.textContent = brand;

    var titleEl = document.querySelector(".pdp-title");
    if (titleEl) titleEl.textContent = name.replace(/\+/g, " ");

    if (price) {
      var priceCurrent = document.querySelector(".pdp-price .current");
      if (priceCurrent) priceCurrent.textContent = "$" + parseFloat(price).toFixed(2);
    }

    var priceOld = document.querySelector(".pdp-price .old");
    var priceDiscount = document.querySelector(".pdp-price .discount");
    if (oldPrice) {
      if (priceOld) {
        priceOld.textContent = "$" + parseFloat(oldPrice).toFixed(2);
        priceOld.style.display = "";
      }
      if (priceDiscount && price) {
        var pct = Math.round((1 - parseFloat(price) / parseFloat(oldPrice)) * 100);
        priceDiscount.textContent = "Save " + pct + "%";
        priceDiscount.style.display = "";
      }
    } else {
      if (priceOld) priceOld.style.display = "none";
      if (priceDiscount) priceDiscount.style.display = "none";
    }

    var starsEl = document.querySelector(".pdp-rating .stars");
    if (starsEl) {
      var fullStars = Math.floor(rating);
      var halfStar = rating % 1 >= 0.5;
      var html = "";
      for (var i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
      if (halfStar) html += '<i class="fas fa-star-half-alt"></i>';
      var empty = 5 - fullStars - (halfStar ? 1 : 0);
      for (var j = 0; j < empty; j++) html += '<i class="far fa-star"></i>';
      starsEl.innerHTML = html;
    }

    var countEl = document.querySelector(".pdp-rating .count");
    if (countEl) countEl.textContent = "(" + reviews + " reviews)";
  }

  /* ─────────────────────────────────────────────
     30. INITIALIZE EVERYTHING
  ───────────────────────────────────────────── */
  function init() {
    initLoader();
    initStickyHeader();
    initMobileMenu();
    initMegaMenu();
    initSearchOverlay();
    initDarkMode();
    initHeroSlider();
    initAllCountdowns();
    initProductFiltering();
    initMobileFilterSidebar();
    initSidebarFilters();
    initProductSorting();
    initViewToggle();
    initQuantityControls();
    initAddToCartButtons();
    initWishlist();
    initWishlistPage();
    initQuickView();
    initCompare();
    initProductGallery();
    initProductTabs();
    initPdpVariantPickers();
    initDynamicProductPage();
    initFaqAccordion();
    initBackToTop();
    initNewsletter();
    initContactForm();
    initAuthForms();
    initScrollAnimations();
    initSmoothScroll();
    initLazyImages();
    initCouponSystem();
    initCartPage();
    initFormGuard();
    initDashSidebar();

    updateCartBadge();
    updateWishlistBadge();
  }

  /* ─────────────────────────────────────────────
     PUBLIC API  –  window.Stackly
  ───────────────────────────────────────────── */
  window.Stackly = {
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    getCartTotal: getCartTotal,
    getCartCount: getCartCount,
    updateCartBadge: updateCartBadge,
    showToast: showToast,
    getWishlist: getWishlist,
    initCountdown: initCountdown
  };

  /* ─────────────────────────────────────────────
     GLOBAL FORM SUBMIT GUARD
  ───────────────────────────────────────────── */
  function initFormGuard() {
    document.addEventListener("submit", function (e) {
      e.preventDefault();
    }, true);
  }

  /* ─────────────────────────────────────────────
     DASHBOARD SIDEBAR TOGGLE
  ───────────────────────────────────────────── */
  function initDashSidebar() {
    var sidebar = document.getElementById("dashSidebar");
    if (!sidebar) return;
    var toggle = document.getElementById("dashMenuToggle");
    var close = document.getElementById("dashSidebarClose");
    if (toggle) toggle.addEventListener("click", function () { sidebar.classList.toggle("open"); });
    if (close) close.addEventListener("click", function () { sidebar.classList.remove("open"); });
  }

  /* ─────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
