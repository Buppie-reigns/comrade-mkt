// COMRADE MKT — Supabase-connected frontend.
// The publishable key is designed for browser use. Never put a service_role/secret key here.
const SUPABASE_URL = 'https://kmkfexumqgutclcsqlja.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9-v-BWV98TFsUxXT7zSVPg_NoxTGTjL';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
let activeCategory = 'All';
let authMode = 'login';
const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const conditionFilter = document.getElementById('conditionFilter');
const sellDialog = document.getElementById('sellDialog');
const authDialog = document.getElementById('authDialog');
const money = value => 'KES ' + Number(value).toLocaleString('en-KE');
const categoryEmoji = { Electronics:'📱', Books:'📚', Fashion:'👕', Furniture:'🪑', Other:'📦' };

function setStatus(message) { document.getElementById('marketStatus').textContent = message; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function normalizePhone(value) { return String(value).replace(/[^\d+]/g, '').replace(/^0/, '254'); }
function openAuth(mode='login') {
  authMode = mode; updateAuthForm();
  if (!authDialog.open) authDialog.showModal();
}
function updateAuthForm() {
  const register = authMode === 'register';
  document.getElementById('authTitle').textContent = register ? 'Create your account' : 'Log in';
  document.getElementById('authIntro').textContent = register ? 'Register with your email to start using the marketplace.' : 'Log in to publish and manage your listings.';
  document.getElementById('nameField').classList.toggle('hidden', !register);
  document.querySelector('#authForm [name="display_name"]').required = register;
  document.getElementById('authSubmit').textContent = register ? 'Create account' : 'Log in';
  document.getElementById('authSwitch').textContent = register ? 'Already have an account? Log in' : 'Create an account instead';
  document.getElementById('authMessage').textContent = '';
}
function renderListings(items) {
  const query = searchInput.value.trim().toLowerCase();
  const condition = conditionFilter.value;
  const shown = items.filter(item => {
    const itemCondition = item.condition === 'second_hand' ? 'Second-hand' : 'New';
    return (activeCategory === 'All' || item.category === activeCategory) &&
      (condition === 'All' || itemCondition === condition) &&
      `${item.title} ${item.category} ${item.description || ''}`.toLowerCase().includes(query);
  });
  grid.innerHTML = shown.map(item => {
    const itemCondition = item.condition === 'second_hand' ? 'Second-hand' : 'New';
    const seller = item.seller_id === currentUser?.id ? 'You' : 'Student seller';
    const initials = item.seller_id === currentUser?.id ? 'YOU' : 'CM';
    const phone = item.seller_whatsapp ? normalizePhone(item.seller_whatsapp) : '';
    const contact = phone ? `<a class="contact-link" href="https://wa.me/${escapeHtml(phone)}" target="_blank" rel="noopener">WhatsApp seller ↗</a>` : '<span class="contact-link">Contact unavailable</span>';
    return `<article class="product-card"><div class="product-visual ${String(item.category).toLowerCase()}"><span>${categoryEmoji[item.category] || '📦'}</span><span class="condition-pill">${itemCondition}</span></div><div class="product-info"><span class="product-category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3><div class="product-price">${money(item.price)}</div><p class="product-description">${escapeHtml(item.description || 'Message the seller for more details.')}</p><div class="seller-row"><span class="seller-name"><span class="seller-avatar">${initials}</span>${seller}</span>${contact}</div></div></article>`;
  }).join('');
  document.getElementById('listingCount').textContent = `${shown.length} ${shown.length === 1 ? 'listing' : 'listings'}`;
  document.getElementById('emptyState').classList.toggle('hidden', shown.length !== 0);
  grid.classList.toggle('hidden', shown.length === 0);
}
let allListings = [];
async function loadListings() {
  setStatus('Loading live marketplace listings…');
  const { data, error } = await db.from('products').select('id,seller_id,title,description,price,category,condition,seller_whatsapp,status,created_at').eq('status','active').order('created_at',{ascending:false});
  if (error) { setStatus('Could not load listings. Check your Supabase table policies and connection.'); console.error(error); return; }
  allListings = data || [];
  renderListings(allListings);
  setStatus(allListings.length ? 'Live listings from the COMRADE MKT database.' : 'No listings yet. Sign in and publish the first item.');
}
async function refreshSession() {
  const { data } = await db.auth.getSession();
  currentUser = data.session?.user || null;
  const loginButton = document.getElementById('loginButton');
  loginButton.textContent = currentUser ? 'Log out' : 'Log in';
  document.getElementById('sellTopButton').textContent = currentUser ? '＋ Sell an item' : '＋ Sell an item';
  renderListings(allListings);
}

document.getElementById('loginButton').addEventListener('click', async () => {
  if (currentUser) {
    const { error } = await db.auth.signOut();
    if (error) alert(error.message); else { currentUser = null; await refreshSession(); }
  } else openAuth('login');
});
document.getElementById('authSwitch').addEventListener('click', () => { authMode = authMode === 'login' ? 'register' : 'login'; updateAuthForm(); });
document.getElementById('closeAuth').addEventListener('click', () => authDialog.close());
document.getElementById('authForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email')).trim();
  const password = String(form.get('password'));
  const button = document.getElementById('authSubmit');
  const message = document.getElementById('authMessage');
  button.disabled = true; message.textContent = 'Please wait…';
  try {
    if (authMode === 'register') {
      const display_name = String(form.get('display_name')).trim();
      const { data, error } = await db.auth.signUp({ email, password, options: { data: { display_name } } });
      if (error) throw error;
      if (!data.session) { message.textContent = 'Account created. Check your email for the verification link, then log in.'; }
      else { message.textContent = 'Account created successfully.'; authDialog.close(); }
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      authDialog.close(); event.currentTarget.reset();
    }
  } catch (error) { message.textContent = error.message || 'Something went wrong. Please try again.'; }
  finally { button.disabled = false; await refreshSession(); }
});

document.getElementById('categoryFilters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]'); if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll('.filter').forEach(el => el.classList.toggle('active', el === button));
  renderListings(allListings);
});
searchInput.addEventListener('input', () => renderListings(allListings));
conditionFilter.addEventListener('change', () => renderListings(allListings));
document.getElementById('searchButton').addEventListener('click', () => renderListings(allListings));
document.getElementById('clearFilters').addEventListener('click', () => {
  searchInput.value = ''; conditionFilter.value = 'All'; activeCategory = 'All';
  document.querySelectorAll('.filter').forEach(el => el.classList.toggle('active', el.dataset.category === 'All'));
  renderListings(allListings);
});

function openSellDialog() {
  if (!currentUser) { openAuth('login'); document.getElementById('authMessage').textContent = 'Log in or create an account before publishing an item.'; return; }
  sellDialog.showModal();
}
['sellTopButton','sellHeroButton','sellBottomButton'].forEach(id => document.getElementById(id).addEventListener('click', openSellDialog));
document.getElementById('closeDialog').addEventListener('click', () => sellDialog.close());
document.getElementById('listingForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) { sellDialog.close(); openAuth('login'); return; }
  const form = new FormData(event.currentTarget);
  const title = String(form.get('title')).trim();
  const price = Number(form.get('price'));
  const phone = String(form.get('seller_whatsapp')).trim();
  if (!title || !Number.isFinite(price) || price < 1 || !phone) return;
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled = true; submit.textContent = 'Publishing…';
  const payload = {
    seller_id: currentUser.id, title, description: String(form.get('description')).trim(), price,
    category: String(form.get('category')), condition: String(form.get('condition')),
    seller_whatsapp: phone, status: 'active'
  };
  const { error } = await db.from('products').insert(payload);
  submit.disabled = false; submit.textContent = 'Publish listing';
  if (error) { alert(`Could not publish listing: ${error.message}`); return; }
  event.currentTarget.reset(); sellDialog.close();
  searchInput.value = ''; conditionFilter.value = 'All'; activeCategory = 'All';
  document.querySelectorAll('.filter').forEach(el => el.classList.toggle('active', el.dataset.category === 'All'));
  await loadListings(); document.getElementById('browse').scrollIntoView({behavior:'smooth'});
});

document.getElementById('closeInfo')?.addEventListener('click', () => document.getElementById('infoDialog').close());
document.getElementById('okInfo')?.addEventListener('click', () => document.getElementById('infoDialog').close());
document.getElementById('year').textContent = new Date().getFullYear();
db.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  document.getElementById('loginButton').textContent = currentUser ? 'Log out' : 'Log in';
  renderListings(allListings);
});
(async () => { await refreshSession(); await loadListings(); })();
