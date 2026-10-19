'use strict';

/* ======================================================
   API client
   ====================================================== */
const BASE_URL =
  window.location.protocol === 'file:' ? 'http://localhost:5000/api/showtimes' : '/api/showtimes';

const api = {
  async call(method, url = '', body) {
    const response = await fetch(BASE_URL + url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => ({ success: false, message: 'Bad response from server' }));
    if (!payload.success) {
      const error = new Error(payload.message || `Request failed (${response.status})`);
      error.fieldErrors = payload.fieldErrors || {};
      throw error;
    }
    return payload;
  },
  list: (search) => api.call('GET', search ? `?search=${encodeURIComponent(search)}` : ''),
  get: (id) => api.call('GET', `/${id}`),
  create: (data) => api.call('POST', '', data),
  update: (id, data) => api.call('PUT', `/${id}`, data),
  remove: (id) => api.call('DELETE', `/${id}`),
};

/* ======================================================
   DOM helpers
   ====================================================== */
const el = {
  grid: document.querySelector('#grid'),
  summary: document.querySelector('#summary'),
  search: document.querySelector('#search'),
  dialog: document.querySelector('#editor'),
  form: document.querySelector('#showtime-form'),
  title: document.querySelector('#editor-title'),
  errors: document.querySelector('#form-errors'),
  toast: document.querySelector('#toast'),
};

let editingId = null; // null = creating, number = editing

// Build elements with textContent (never innerHTML with data) so DB text can't inject HTML
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function toast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.className = `toast show${isError ? ' error' : ''}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.toast.className = 'toast'), 2600);
}

const formatWhen = (s) =>
  new Date(s.replace(' ', 'T')).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

/* ======================================================
   Rendering
   ====================================================== */
function renderSummary(items) {
  const screens = new Set(items.map((s) => s.screen)).size;
  const avg = items.length ? items.reduce((sum, s) => sum + s.price, 0) / items.length : 0;
  el.summary.replaceChildren(
    ...[
      [items.length, 'showtimes'],
      [screens, 'screens in use'],
      [`K${avg.toFixed(2)}`, 'average ticket'],
    ].map(([value, label]) => {
      const box = make('div', 'stat');
      box.append(make('b', '', value), make('small', '', label));
      return box;
    })
  );
}

function renderCard(s) {
  const card = make('article', 'card');

  const chips = make('div', 'chips');
  chips.append(
    make('span', 'chip', `Screen ${s.screen}`),
    make('span', `chip fmt-${s.format}`, s.format),
    make('span', 'chip', s.age_rating),
    make('span', 'chip', `${s.duration_min} min`)
  );

  const row = make('div', 'row');
  const actions = make('div', 'actions');
  const editBtn = make('button', 'btn btn-ghost', 'Edit');
  const delBtn = make('button', 'btn btn-danger', 'Delete');
  editBtn.addEventListener('click', () => openEditor(s.id));
  delBtn.addEventListener('click', () => deleteShowtime(s));
  actions.append(editBtn, delBtn);
  row.append(make('span', 'price', `K${s.price.toFixed(2)}`), actions);

  card.append(
    make('div', 'when', formatWhen(s.starts_at)),
    make('h3', '', s.movie_title),
    make('div', 'by', s.director ? `dir. ${s.director}` : 'Director not listed'),
    chips,
    row
  );
  return card;
}

async function refresh() {
  try {
    const { data } = await api.list(el.search.value.trim());
    renderSummary(data);
    el.grid.replaceChildren(
      ...(data.length ? data.map(renderCard) : [make('p', 'placeholder', 'No showtimes match. Add one with “+ New showtime”.')])
    );
  } catch (err) {
    el.grid.replaceChildren(make('p', 'placeholder', `Could not reach the API: ${err.message}`));
  }
}

/* ======================================================
   Create / edit dialog
   ====================================================== */
function clearErrors() {
  el.errors.replaceChildren();
  el.form.querySelectorAll('.invalid').forEach((n) => n.classList.remove('invalid'));
}

async function openEditor(id = null) {
  clearErrors();
  el.form.reset();
  editingId = id;
  el.title.textContent = id ? `Edit showtime #${id}` : 'New showtime';

  if (id) {
    try {
      const { data } = await api.get(id);
      for (const [key, value] of Object.entries(data)) {
        const input = el.form.elements[key];
        if (!input) continue;
        input.value = key === 'starts_at' ? value.replace(' ', 'T') : value ?? '';
      }
    } catch (err) {
      return toast(err.message, true);
    }
  }
  el.dialog.showModal();
  el.form.elements.movie_title.focus();
}

el.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();
  const data = Object.fromEntries(new FormData(el.form));

  try {
    if (editingId) {
      await api.update(editingId, data);
      toast(`Showtime #${editingId} updated`);
    } else {
      const { data: created } = await api.create(data);
      toast(`Showtime #${created.id} added`);
    }
    el.dialog.close();
    refresh();
  } catch (err) {
    // Show server-side validation errors next to the right fields
    const entries = Object.entries(err.fieldErrors);
    if (entries.length) {
      entries.forEach(([field, msg]) => {
        el.form.elements[field]?.classList.add('invalid');
        el.errors.append(make('li', '', `${field.replace('_', ' ')}: ${msg}`));
      });
    } else {
      el.errors.append(make('li', '', err.message));
    }
  }
});

async function deleteShowtime(s) {
  if (!confirm(`Delete "${s.movie_title}" on screen ${s.screen}?`)) return;
  try {
    await api.remove(s.id);
    toast(`Deleted "${s.movie_title}"`);
    refresh();
  } catch (err) {
    toast(err.message, true);
  }
}

/* ======================================================
   Wiring
   ====================================================== */
document.querySelector('#new-btn').addEventListener('click', () => openEditor());
document.querySelector('#close-btn').addEventListener('click', () => el.dialog.close());
document.querySelector('#cancel-btn').addEventListener('click', () => el.dialog.close());

let searchTimer;
el.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(refresh, 250); // debounce: one request after typing stops
});

refresh();
