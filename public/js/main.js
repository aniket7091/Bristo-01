const navLinks = document.querySelectorAll('[data-nav]');
const currentPath = window.location.pathname;

navLinks.forEach((link) => {
  const href = link.getAttribute('href');
  const isHome = (href === '/' || href === '/index.html') && (currentPath === '/' || currentPath === '/index.html');
  const isMatch = href === currentPath;
  if (isHome || isMatch) {
    link.classList.add('active');
  }
});

const ownerNav = document.querySelector('[data-owner-link]');
if (ownerNav && window.BristoAPI?.getOwnerToken()) {
  ownerNav.textContent = 'Admin Panel';
  ownerNav.setAttribute('href', '/admin');
}

const header = document.querySelector('.site-header');
const updateHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

const revealTargets = document.querySelectorAll(
  '.page-hero-shell, .hero-stats, .card, .info-card, .contact-card, .order-panel, .menu-toolbar'
);

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' })
  : null;

revealTargets.forEach((element, index) => {
  element.classList.add('scroll-reveal');
  element.style.transitionDelay = `${Math.min(index * 35, 180)}ms`;

  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add('revealed');
  }
});

const canUseFinePointer = window.matchMedia('(pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canUseFinePointer && !prefersReducedMotion) {
  window.addEventListener('pointermove', (event) => {
    document.body.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.body.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('.hero-card, .card, .menu-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
      card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const homeMenuGrid = document.querySelector('[data-home-menu-grid]');
const homeCategoryGrid = document.querySelector('[data-home-category-grid]');

const fallbackCategoryImages = {
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=85',
  beverage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=85',
  dessert: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=700&q=85',
  breakfast: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=700&q=85',
  snacks: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=700&q=85',
  default: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85'
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatRupee = (value) => `₹${Number(value || 0).toFixed(0)}`;

const getCategoryImage = (category, firstItem) => {
  const key = String(category || '').toLowerCase();
  if (firstItem?.imageUrl) return firstItem.imageUrl;
  if (key.includes('coffee')) return fallbackCategoryImages.coffee;
  if (key.includes('drink') || key.includes('beverage') || key.includes('cold')) return fallbackCategoryImages.beverage;
  if (key.includes('dessert') || key.includes('sweet')) return fallbackCategoryImages.dessert;
  if (key.includes('breakfast')) return fallbackCategoryImages.breakfast;
  if (key.includes('snack')) return fallbackCategoryImages.snacks;
  return fallbackCategoryImages.default;
};

const renderHomeCategories = (items) => {
  if (!homeCategoryGrid || !items.length) return;

  const categoryMap = new Map();
  items.forEach((item) => {
    const category = item.category || 'Chef Specials';
    if (!categoryMap.has(category)) categoryMap.set(category, item);
  });

  homeCategoryGrid.innerHTML = Array.from(categoryMap.entries()).slice(0, 3)
    .map(([category, firstItem]) => `
      <a href="/menu?category=${encodeURIComponent(category)}" class="category-card">
        <img src="${escapeHtml(getCategoryImage(category, firstItem))}" alt="${escapeHtml(category)}" loading="lazy" />
        <h3>${escapeHtml(category)}</h3>
      </a>
    `)
    .join('');
};

const renderHomeMenu = (items) => {
  if (!homeMenuGrid || !items.length) return;

  homeMenuGrid.innerHTML = items.slice(0, 6)
    .map((item) => `
      <article class="preview-menu-card">
        <img src="${escapeHtml(item.imageUrl || fallbackCategoryImages.default)}" alt="${escapeHtml(item.name)}" loading="lazy" />
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description || 'Freshly prepared with Bristo signature ingredients.')}</p>
        <span>${formatRupee(item.price)}</span>
      </article>
    `)
    .join('');
};

const loadHomeMenuFromBackend = async () => {
  if (!homeMenuGrid && !homeCategoryGrid) return;
  if (!window.BristoAPI?.request) return;

  try {
    const data = await BristoAPI.request(BristoAPI.API.menu);
    const availableItems = (data.menuItems || []).filter((item) => item.isAvailable !== false);
    renderHomeCategories(availableItems);
    renderHomeMenu(availableItems);
  } catch (error) {
    console.warn('Home menu preview is using static fallback:', error.message);
  }
};

loadHomeMenuFromBackend();
