/* Main JS: smooth scroll, mobile menu, dark mode, FAQ, autosave, reveal animations,
   logo-change, services mobile accordion
*/

/* helpers */
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

/* DOM refs */
const navLinks = document.querySelectorAll('a.nav-link');
const sections = document.querySelectorAll('section[id]');
const mobileBtn = qs('#mobileBtn');
const mobileNav = qs('#mobileNav');
const logoImg = qs('#logoImg');
const yearEl = qs('#year');

/* --- Smooth scroll & nav highlight --- */
navLinks.forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if(target){
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
    // close mobile if open
    if(getComputedStyle(mobileNav).display === 'flex'){
      mobileNav.style.display = 'none';
      mobileBtn.classList.remove('fa-times');
    }
  });
});

window.addEventListener('scroll', ()=>{
  const cur = window.scrollY + 220;
  sections.forEach(sec=>{
    if(cur >= sec.offsetTop && cur < sec.offsetTop + sec.offsetHeight){
      navLinks.forEach(l=>l.classList.remove('active'));
      const a = document.querySelector('a[href="#'+sec.id+'"]');
      if(a) a.classList.add('active');
    }
  });
});

/* --- Mobile menu toggle --- */
mobileBtn.addEventListener('click', ()=>{
  const showing = mobileNav.style.display === 'flex';
  mobileNav.style.display = showing ? 'none' : 'flex';
  mobileBtn.classList.toggle('fa-times');
});
// close mobile on mobile nav link click
qsa('.mobile-nav a').forEach(a=>a.addEventListener('click', ()=>{
  mobileNav.style.display = 'none';
  mobileBtn.classList.remove('fa-times');
}));

/* --- FAQ accordion --- */
qsa('.faq-item button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const ans = btn.nextElementSibling;
    const open = ans.style.display === 'block';
    // close all
    qsa('.answer').forEach(a=>a.style.display = 'none');
    qsa('.faq-item button span').forEach(s=>s.textContent = '+');
    if(!open){ ans.style.display = 'block'; btn.querySelector('span').textContent = '−'; }
  });
});

/* --- Dark mode (saved) --- */

/* --- auto year --- */
if(yearEl) yearEl.textContent = new Date().getFullYear();


/* --- Autosave editable content to localStorage --- */
const editableSelector = '[contenteditable="true"]';
function saveEdits(){
  const nodes = document.querySelectorAll(editableSelector);
  const data = {};
  nodes.forEach((n,i)=>{
    if(!n.dataset.editId) n.dataset.editId = 'edit_'+i;
    data[n.dataset.editId] = n.innerHTML;
  });
  localStorage.setItem('zeik_edits_v1', JSON.stringify(data));
}
function loadEdits(){
  const raw = localStorage.getItem('zeik_edits_v1');
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    document.querySelectorAll(editableSelector).forEach((n,i)=>{
      const id = n.dataset.editId || ('edit_'+i);
      if(data[id]) n.innerHTML = data[id];
      n.dataset.editId = id;
    });
  }catch(e){ console.warn('loadEdits error', e); }
}
document.addEventListener('input', e=>{
  if(e.target && e.target.matches && e.target.matches(editableSelector)){
    saveEdits();
  }
});
setInterval(saveEdits, 4000);
window.addEventListener('load', loadEdits);

/* --- Reveal animations for services and other elements --- */
const revealTargets = document.querySelectorAll('.services-row, .card, .member, .testimonial, .project-thumb img');
function revealOnScroll(){
  const trigger = window.innerHeight * 0.85;
  revealTargets.forEach(t=>{
    const r = t.getBoundingClientRect();
    if(r.top < trigger) t.classList.add('reveal');
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* --- Services mobile accordion behavior --- */
const serviceBoxes = document.querySelectorAll('.services-text-box');
serviceBoxes.forEach((box)=>{
  box.addEventListener('click', ()=>{
    // only on small screens
    if(window.innerWidth > 768) return;
    const isOpen = box.classList.contains('open');
    serviceBoxes.forEach(b=>b.classList.remove('open'));
    if(!isOpen) box.classList.add('open');
  });
});

/* --- small helper: close mobile nav when resizing up to desktop --- */
window.addEventListener('resize', ()=>{
  if(window.innerWidth > 768){
    mobileNav.style.display = 'none';
    mobileBtn.classList.remove('fa-times');
  }
});



window.addEventListener("load", () => {
  const wrapper = document.querySelector(".projects-wrapper");
  const cards = wrapper.querySelectorAll(".project-card");

  if (cards.length > 4) {
    wrapper.classList.add("scroll");

    // Optional: auto-scroll to show last added project
    setTimeout(() => {
      wrapper.scrollTo({
        left: wrapper.scrollWidth,
        behavior: "smooth"
      });
    }, 600);
  }
});


/* --- Medium Blog Fetch (Text-Only) --- */

async function loadMediumPosts() {
  const container = document.querySelector('.blogs');
  if (!container) return;

  const feeds = [
    "https://medium.com/feed/@vinodpolinati",
    "https://vinodpolinati.medium.com/feed"
  ];

  let feedLoaded = false;

  for (let url of feeds) {
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (!response.ok) continue;

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      const items = [...xml.querySelectorAll("item")].slice(0, 4);

      container.innerHTML = items.map(item => {
        const title = item.querySelector("title")?.textContent || "Untitled Post";
        const link = item.querySelector("link")?.textContent;
        const category = item.querySelector("category")?.textContent || "Blog";
        return `
          <div class="blog-card">
            <small>${category}</small>
            <h4>${title}</h4>
            <a href="${link}" target="_blank">Read Blog →</a>
          </div>
        `;
      }).join("");

      feedLoaded = true;
      break;
    } catch (err) {
      console.log("Trying fallback feed...");
    }
  }

  if (!feedLoaded) {
    container.innerHTML = `<p style="color:red;">⚠️ Unable to load blogs right now.</p>`;
  }
}

loadMediumPosts();
