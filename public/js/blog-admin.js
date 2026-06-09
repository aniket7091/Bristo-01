/* blog-admin.js — Blog management logic for the admin panel */

(function () {
  'use strict';

  const escHtml = (s = '') => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const CATEGORY_LABELS = {
    brewing:        '☕ Brewing Guides',
    culture:        '🌍 Café Culture',
    recipes:        '🍰 Recipes',
    sustainability: '🌱 Sustainability',
    news:           '📣 News'
  };

  /* ── DOM refs ──────────────────────────────────────────── */
  const getEl = (id) => document.getElementById(id);

  let editingId = null;

  /* ── Image URL live preview ────────────────────────────── */
  function initImagePreview() {
    const urlInput = getEl('blog-cover-url');
    const preview  = getEl('blog-img-preview');
    const img      = getEl('blog-preview-img');
    if (!urlInput) return;

    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      if (val) {
        img.src = val;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    });
  }

  /* ── Show feedback ─────────────────────────────────────── */
  function showFeedback(msg, type = 'success') {
    const el = getEl('blog-form-feedback');
    if (!el) return;
    el.textContent = msg;
    el.className = `feedback ${type}`;
    setTimeout(() => { el.className = 'feedback hidden'; }, 4000);
  }

  /* ── Reset form to "new post" state ────────────────────── */
  function resetForm() {
    editingId = null;
    const form = getEl('blog-post-form');
    if (form) form.reset();
    const preview = getEl('blog-img-preview');
    if (preview) preview.style.display = 'none';
    const title = getEl('blog-form-title');
    if (title) title.textContent = 'New Blog Post';
    const saveBtn = getEl('blog-save-btn');
    if (saveBtn) saveBtn.textContent = 'Publish Post';
    const cancelBtn = getEl('blog-cancel-btn');
    if (cancelBtn) cancelBtn.classList.add('hidden');
  }

  /* ── Populate form for editing ─────────────────────────── */
  function populateForm(post) {
    editingId = post._id;
    const set = (id, val) => { const el = getEl(id); if (el) el.value = val || ''; };
    set('blog-edit-id', post._id);
    set('blog-cover-url', post.imageUrl);
    set('blog-title', post.title);
    set('blog-excerpt', post.excerpt);
    set('blog-category', post.category);
    set('blog-author', post.author);
    set('blog-readtime', post.readTime);

    const featuredCb  = getEl('blog-featured');
    const publishedCb = getEl('blog-published');
    if (featuredCb)  featuredCb.checked  = !!post.isFeatured;
    if (publishedCb) publishedCb.checked = post.isPublished !== false;

    // Show image preview
    const preview = getEl('blog-img-preview');
    const img     = getEl('blog-preview-img');
    if (preview && img && post.imageUrl) {
      img.src = post.imageUrl;
      preview.style.display = 'block';
    }

    const title = getEl('blog-form-title');
    if (title) title.textContent = 'Edit Blog Post';
    const saveBtn = getEl('blog-save-btn');
    if (saveBtn) saveBtn.textContent = 'Save Changes';
    const cancelBtn = getEl('blog-cancel-btn');
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    // Scroll form into view
    getEl('blog-form-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Render the blog list ──────────────────────────────── */
  function renderBlogList(posts) {
    const list = getEl('admin-blog-list');
    if (!list) return;

    if (!posts.length) {
      list.innerHTML = '<div class="empty-state">No blog posts yet. Create your first post!</div>';
      return;
    }

    list.innerHTML = posts.map(post => `
      <div class="admin-list-item" data-blog-id="${escHtml(post._id)}">
        <div class="admin-card-head">
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(post.title)}</div>
            <div class="small" style="margin-top:0.25rem;display:flex;gap:0.5rem;flex-wrap:wrap">
              <span class="badge">${escHtml(CATEGORY_LABELS[post.category] || post.category)}</span>
              ${post.isFeatured ? '<span class="badge" style="background:rgba(246,201,120,0.2)">✦ Featured</span>' : ''}
              ${!post.isPublished ? '<span class="badge" style="background:rgba(255,123,114,0.15);color:var(--danger)">Draft</span>' : ''}
            </div>
            <div class="small" style="margin-top:0.3rem;color:var(--muted)">${escHtml(post.author || 'Bristo Team')} · ${escHtml(post.readTime || '')}</div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-shrink:0">
            <button class="btn btn-ghost" style="padding:0.45rem 0.85rem;font-size:0.82rem"
              onclick="window.__editBlogPost('${escHtml(post._id)}')">Edit</button>
            <button class="btn btn-danger" style="padding:0.45rem 0.85rem;font-size:0.82rem"
              onclick="window.__deleteBlogPost('${escHtml(post._id)}')">Delete</button>
          </div>
        </div>
      </div>`).join('');
  }

  /* ── Load all posts (admin sees all, including drafts) ─── */
  async function loadBlogAdmin() {
    const list = getEl('admin-blog-list');
    if (!list) return;
    list.innerHTML = '<div class="empty-state" id="blog-list-loading">Loading posts…</div>';

    try {
      // Owner-level fetch — no auth filter needed on GET, but let's use the standard endpoint
      const data = await BristoAPI.request(BristoAPI.API.blog);
      const posts = data.posts || [];
      renderBlogList(posts);
    } catch (err) {
      list.innerHTML = `<div class="empty-state" style="color:var(--danger)">Failed to load posts: ${escHtml(err.message)}</div>`;
    }
  }

  /* ── Submit (create / update) ──────────────────────────── */
  async function handleBlogFormSubmit(e) {
    e.preventDefault();

    const body = {
      title:       getEl('blog-title')?.value.trim(),
      excerpt:     getEl('blog-excerpt')?.value.trim(),
      category:    getEl('blog-category')?.value,
      imageUrl:    getEl('blog-cover-url')?.value.trim(),
      author:      getEl('blog-author')?.value.trim(),
      readTime:    getEl('blog-readtime')?.value.trim(),
      isFeatured:  getEl('blog-featured')?.checked,
      isPublished: getEl('blog-published')?.checked
    };

    if (!body.title || !body.excerpt || !body.imageUrl) {
      showFeedback('Title, excerpt, and cover image URL are required.', 'error');
      return;
    }

    const saveBtn = getEl('blog-save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

    try {
      const isEdit = !!editingId;
      const url    = isEdit ? `${BristoAPI.API.blog}/${editingId}` : BristoAPI.API.blog;
      const method = isEdit ? 'PUT' : 'POST';

      await BristoAPI.request(url, BristoAPI.authorizedJsonOptions(method, body));
      showFeedback(isEdit ? '✅ Post updated!' : '🎉 Post published!', 'success');
      resetForm();
      loadBlogAdmin();
    } catch (err) {
      showFeedback(`Error: ${err.message}`, 'error');
    } finally {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = editingId ? 'Save Changes' : 'Publish Post'; }
    }
  }

  /* ── Edit helper (called from inline onclick) ──────────── */
  window.__editBlogPost = async (id) => {
    try {
      const data = await BristoAPI.request(`${BristoAPI.API.blog}/${id}`);
      populateForm(data.post);
    } catch (err) {
      alert('Could not load post: ' + err.message);
    }
  };

  /* ── Delete helper ─────────────────────────────────────── */
  window.__deleteBlogPost = async (id) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    try {
      await BristoAPI.request(
        `${BristoAPI.API.blog}/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${BristoAPI.getOwnerToken()}` } }
      );
      loadBlogAdmin();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    const form      = getEl('blog-post-form');
    const cancelBtn = getEl('blog-cancel-btn');

    if (form)      form.addEventListener('submit', handleBlogFormSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', resetForm);

    initImagePreview();
  }

  // Expose loadBlogAdmin globally so the tab-switch handler can call it
  window.loadBlogAdmin = loadBlogAdmin;

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
