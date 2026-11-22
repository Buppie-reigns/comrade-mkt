const sampleListings = [
  {id:1,title:'HP Laptop',price:18000,category:'Electronics',condition:'Second-hand',description:'Reliable laptop for assignments and everyday use.',emoji:'💻',seller:'Brian M.',initials:'BM'},
  {id:2,title:'Medical textbooks',price:1200,category:'Books',condition:'Second-hand',description:'Useful course books in good reading condition.',emoji:'📚',seller:'Faith A.',initials:'FA'},
  {id:3,title:'Study chair',price:2500,category:'Furniture',condition:'New',description:'Comfortable chair for your hostel study space.',emoji:'🪑',seller:'Kevin O.',initials:'KO'},
  {id:4,title:'Wireless headphones',price:1500,category:'Electronics',condition:'Second-hand',description:'Good sound and battery life. Lightly used.',emoji:'🎧',seller:'Lydia W.',initials:'LW'},
  {id:5,title:'Sneakers',price:2200,category:'Fashion',condition:'New',description:'Smart everyday sneakers. Available in several sizes.',emoji:'👟',seller:'Dennis K.',initials:'DK'},
  {id:6,title:'Scientific calculator',price:900,category:'Other',condition:'Second-hand',description:'Working calculator, ideal for class and exams.',emoji:'🧮',seller:'Mary N.',initials:'MN'}
];
let listings = [...sampleListings];
let activeCategory = 'All';
const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const conditionFilter = document.getElementById('conditionFilter');
const sellDialog = document.getElementById('sellDialog');
const infoDialog = document.getElementById('infoDialog');
const money = value => 'KES ' + Number(value).toLocaleString('en-KE');
function renderListings(){
  const query = searchInput.value.trim().toLowerCase();
  const condition = conditionFilter.value;
  const shown = listings.filter(item => (activeCategory === 'All' || item.category === activeCategory) && (condition === 'All' || item.condition === condition) && (item.title+' '+item.category+' '+item.description).toLowerCase().includes(query));
  grid.innerHTML = shown.map(item => `<article class="product-card"><div class="product-visual ${item.category.toLowerCase()}"><span>${item.emoji}</span><span class="condition-pill">${item.condition}</span></div><div class="product-info"><span class="product-category">${item.category}</span><h3>${escapeHtml(item.title)}</h3><div class="product-price">${money(item.price)}</div><p class="product-description">${escapeHtml(item.description || 'Message the seller for more details.')}</p><div class="seller-row"><span class="seller-name"><span class="seller-avatar">${escapeHtml(item.initials)}</span>${escapeHtml(item.seller)}</span><button class="contact-link" data-contact="${item.id}">Contact seller ↗</button></div></div></article>`).join('');
  document.getElementById('listingCount').textContent = `${shown.length} ${shown.length === 1 ? 'listing' : 'listings'}`;
  document.getElementById('emptyState').classList.toggle('hidden', shown.length !== 0);
  grid.classList.toggle('hidden', shown.length === 0);
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.getElementById('categoryFilters').addEventListener('click', event => {const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;document.querySelectorAll('.filter').forEach(el=>el.classList.toggle('active',el===button));renderListings();});
searchInput.addEventListener('input',renderListings);conditionFilter.addEventListener('change',renderListings);document.getElementById('searchButton').addEventListener('click',renderListings);
document.getElementById('clearFilters').addEventListener('click',()=>{searchInput.value='';conditionFilter.value='All';activeCategory='All';document.querySelectorAll('.filter').forEach(el=>el.classList.toggle('active',el.dataset.category==='All'));renderListings();});
function showInfo(title,text){document.getElementById('infoTitle').textContent=title;document.getElementById('infoText').textContent=text;infoDialog.showModal();}
['loginButton'].forEach(id=>document.getElementById(id).addEventListener('click',()=>showInfo('Student accounts are coming','In the next stage, we will add student registration, login and account verification.')));
['sellTopButton','sellHeroButton','sellBottomButton'].forEach(id=>document.getElementById(id).addEventListener('click',()=>sellDialog.showModal()));
document.getElementById('closeDialog').addEventListener('click',()=>sellDialog.close());document.getElementById('closeInfo').addEventListener('click',()=>infoDialog.close());document.getElementById('okInfo').addEventListener('click',()=>infoDialog.close());
document.getElementById('listingForm').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);const title=String(data.get('title')).trim();const price=Number(data.get('price'));if(!title||!Number.isFinite(price)||price<1)return;const category=String(data.get('category'));listings.unshift({id:Date.now(),title,price,category,condition:String(data.get('condition')),description:String(data.get('description')).trim(),emoji:({Electronics:'📱',Books:'📚',Fashion:'👕',Furniture:'🪑',Other:'📦'})[category],seller:'You',initials:'YOU'});event.currentTarget.reset();sellDialog.close();activeCategory='All';conditionFilter.value='All';searchInput.value='';document.querySelectorAll('.filter').forEach(el=>el.classList.toggle('active',el.dataset.category==='All'));renderListings();document.getElementById('browse').scrollIntoView({behavior:'smooth'});});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-contact]');if(button)showInfo('Seller contact is coming','In the next stage, buyers and sellers will be able to message each other securely. Never send money outside the platform once protected payments are introduced.');});
document.getElementById('year').textContent=new Date().getFullYear();renderListings();
