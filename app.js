/* عالم زين التعليمي — Zain's Learning World
   Plain JavaScript, no build step. Works on GitHub Pages. */
(() => {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const store = {
  get(k, d) { try { const v = localStorage.getItem('zain.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('zain.' + k, JSON.stringify(v)); } catch (e) {} }
};
let token = 0;                       // changes on every navigation; cancels old timers
const later = (fn, ms) => { const t = token; return setTimeout(() => { if (t === token) fn(); }, ms); };

let stars = store.get('stars', 0);
let soundOn = store.get('sound', true);

/* ---------- data ---------- */
const AR = [
  ['أ', 'ألف', 'أرنب', '🐰'], ['ب', 'باء', 'بطة', '🦆'], ['ت', 'تاء', 'تفاحة', '🍎'], ['ث', 'ثاء', 'ثعلب', '🦊'],
  ['ج', 'جيم', 'جمل', '🐪'], ['ح', 'حاء', 'حصان', '🐴'], ['خ', 'خاء', 'خروف', '🐑'], ['د', 'دال', 'دجاجة', '🐔'],
  ['ذ', 'ذال', 'ذرة', '🌽'], ['ر', 'راء', 'روبوت', '🤖'], ['ز', 'زاي', 'زرافة', '🦒'], ['س', 'سين', 'سمكة', '🐟'],
  ['ش', 'شين', 'شمس', '☀️'], ['ص', 'صاد', 'صاروخ', '🚀'], ['ض', 'ضاد', 'ضفدع', '🐸'], ['ط', 'طاء', 'طائرة', '✈️'],
  ['ظ', 'ظاء', 'ظرف', '✉️'], ['ع', 'عين', 'عنب', '🍇'], ['غ', 'غين', 'غيمة', '☁️'], ['ف', 'فاء', 'فيل', '🐘'],
  ['ق', 'قاف', 'قمر', '🌙'], ['ك', 'كاف', 'كرة', '⚽'], ['ل', 'لام', 'ليمونة', '🍋'], ['م', 'ميم', 'موزة', '🍌'],
  ['ن', 'نون', 'نجمة', '⭐'], ['ه', 'هاء', 'هدية', '🎁'], ['و', 'واو', 'وردة', '🌹'], ['ي', 'ياء', 'يد', '✋']
].map(([ch, name, word, e]) => ({ ch, name, word, e }));

const EN = [
  ['Apple', '🍎'], ['Ball', '⚽'], ['Cat', '🐱'], ['Dog', '🐶'], ['Egg', '🥚'], ['Fish', '🐟'], ['Grapes', '🍇'],
  ['Hat', '🎩'], ['Ice cream', '🍦'], ['Juice', '🧃'], ['Kite', '🪁'], ['Lion', '🦁'], ['Moon', '🌙'], ['Nut', '🥜'],
  ['Orange', '🍊'], ['Pizza', '🍕'], ['Queen', '👑'], ['Rabbit', '🐰'], ['Sun', '☀️'], ['Tree', '🌳'],
  ['Umbrella', '☂️'], ['Violin', '🎻'], ['Whale', '🐳'], ['Xylophone', '🎹'], ['Yo-yo', '🪀'], ['Zebra', '🦓']
].map(([word, e], i) => ({ ch: String.fromCharCode(65 + i), word, e }));

const ARD = '٠١٢٣٤٥٦٧٨٩';
const arDigits = n => String(n).split('').map(d => d === '1' && false ? d : ARD[+d]).join('');
const ARN = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
const ENN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const OBJ = ['🍽️', '⭐', '🐥', '🚗', '🎈', '🍎', '🐸', '🌸', '🍓', '🐠', '🦋'];

const COLORS = [
  { k: 'red', ar: 'أحمر', en: 'Red', hex: '#E03131', e: '🍎' },
  { k: 'blue', ar: 'أزرق', en: 'Blue', hex: '#1C7ED6', e: '🐳' },
  { k: 'yellow', ar: 'أصفر', en: 'Yellow', hex: '#FAB005', e: '🍌' },
  { k: 'green', ar: 'أخضر', en: 'Green', hex: '#2F9E44', e: '🐸' },
  { k: 'orange', ar: 'برتقالي', en: 'Orange', hex: '#F76707', e: '🍊' },
  { k: 'purple', ar: 'بنفسجي', en: 'Purple', hex: '#7048E8', e: '🍇' },
  { k: 'pink', ar: 'وردي', en: 'Pink', hex: '#F783AC', e: '🌸' },
  { k: 'brown', ar: 'بني', en: 'Brown', hex: '#8B5A2B', e: '🐻' },
  { k: 'black', ar: 'أسود', en: 'Black', hex: '#212529', e: '🎱' },
  { k: 'white', ar: 'أبيض', en: 'White', hex: '#FFFFFF', e: '☁️' }
];
const COL = k => COLORS.find(c => c.k === k);
const MIX = {
  'red+yellow': ['برتقالي', 'Orange', '#F76707'], 'blue+yellow': ['أخضر', 'Green', '#2F9E44'],
  'blue+red': ['بنفسجي', 'Purple', '#7048E8'], 'red+white': ['وردي', 'Pink', '#F783AC'],
  'blue+white': ['أزرق فاتح', 'Light blue', '#74C0FC'], 'white+yellow': ['أصفر فاتح', 'Light yellow', '#FFF3BF']
};

const SCI = {
  fruits: { t: '🍎 فواكه', items: [
    ['مانجو', 'Mango', '🥭', 'المانجو فاكهة حلوة ولذيذة، لونها أصفر وبرتقالي.'],
    ['موز', 'Banana', '🍌', 'الموز أصفر، ونُقشّره قبل أن نأكله.'],
    ['تفاح', 'Apple', '🍎', 'التفاح أحمر أو أخضر، وهو يقوّينا.'],
    ['عنب', 'Grapes', '🍇', 'العنب ينمو في عناقيد صغيرة.'],
    ['برتقال', 'Orange', '🍊', 'البرتقال مستدير وعصيره لذيذ ومفيد.'],
    ['فراولة', 'Strawberry', '🍓', 'الفراولة حمراء وحلوة وصغيرة.'],
    ['بطيخ', 'Watermelon', '🍉', 'البطيخ كبير، أخضر من الخارج وأحمر من الداخل.']
  ] },
  veg: { t: '🥕 خضروات', items: [
    ['جزر', 'Carrot', '🥕', 'الجزر برتقالي، ينمو تحت الأرض، ويفيد عيوننا.'],
    ['طماطم', 'Tomato', '🍅', 'الطماطم حمراء وعصيرية.'],
    ['خيار', 'Cucumber', '🥒', 'الخيار أخضر ومنعش ومقرمش.'],
    ['بطاطس', 'Potato', '🥔', 'البطاطس تنمو تحت الأرض.'],
    ['ذرة', 'Corn', '🌽', 'الذرة صفراء وحباتها كثيرة.'],
    ['بروكلي', 'Broccoli', '🥦', 'البروكلي أخضر ويشبه شجرة صغيرة.']
  ] },
  animals: { t: '🦁 حيوانات', items: [
    ['أسد', 'Lion', '🦁', 'الأسد ملك الغابة وصوته زئير.'],
    ['قطة', 'Cat', '🐱', 'القطة تقول: مياو.'],
    ['كلب', 'Dog', '🐶', 'الكلب صديق وفيّ ويقول: هاو هاو.'],
    ['بقرة', 'Cow', '🐮', 'البقرة تعطينا الحليب.'],
    ['سمكة', 'Fish', '🐟', 'السمكة تعيش في الماء وتسبح.'],
    ['طائر', 'Bird', '🐦', 'الطائر يطير بجناحيه.'],
    ['فيل', 'Elephant', '🐘', 'الفيل كبير وله خرطوم طويل.'],
    ['أرنب', 'Rabbit', '🐰', 'الأرنب يقفز ويحب الجزر.']
  ] },
  nature: { t: '🌳 الطبيعة', items: [
    ['شمس', 'Sun', '☀️', 'الشمس تعطينا الضوء والدفء.'],
    ['قمر', 'Moon', '🌙', 'القمر يظهر في الليل.'],
    ['نجمة', 'Star', '⭐', 'النجوم تلمع في السماء ليلاً.'],
    ['مطر', 'Rain', '🌧️', 'المطر يسقي الأشجار والنباتات.'],
    ['شجرة', 'Tree', '🌳', 'الشجرة تعطينا الظل والهواء النقي.'],
    ['زهرة', 'Flower', '🌸', 'الزهرة جميلة ولها رائحة طيبة.']
  ] }
};
const FRUITS = SCI.fruits.items, VEGS = SCI.veg.items;
const FRUIT_COLOR = [
  ['🍌', 'موز', 'yellow'], ['🍎', 'تفاحة', 'red'], ['🍊', 'برتقالة', 'orange'], ['🍇', 'عنب', 'purple'],
  ['🥕', 'جزرة', 'orange'], ['🥒', 'خيارة', 'green'], ['🍓', 'فراولة', 'red'], ['🍋', 'ليمونة', 'yellow'],
  ['🥦', 'بروكلي', 'green'], ['🍆', 'باذنجانة', 'purple']
];

/* themes [main, light, lighter] */
const TH = {
  home: ['#5B9BE6', '#E8F1FC', '#BCD6F6'], ar: ['#5B9BE6', '#E8F1FC', '#BCD6F6'], hisab: ['#54B87A', '#E4F6EA', '#B5E3C6'],
  en: ['#9B7BE0', '#EFE9FB', '#CDBDF2'], math: ['#F2B53C', '#FFF4D6', '#F8DB98'], colors: ['#F08CA8', '#FDE9EF', '#F7C0CF'],
  science: ['#66B3E8', '#E5F3FC', '#B7DDF4'], games: ['#FB923C', '#FFEBDB', '#FBCBA3'], draw: ['#20C997', '#DDF7EF', '#A9E8D4'],
  stars: ['#F2B53C', '#FFF4D6', '#F8DB98']
};
const thStyle = t => `--c:${TH[t][0]};--c2:${TH[t][1]};--c3:${TH[t][2]}`;
function setTheme(t) { const r = document.documentElement.style; const v = TH[t] || TH.home; r.setProperty('--c', v[0]); r.setProperty('--c2', v[1]); r.setProperty('--c3', v[2]); }
const KC = ['#5B9BE6', '#54B87A', '#9B7BE0', '#E8A317', '#F08CA8', '#F4722B'];

/* ---------- sound ---------- */
let AC;
function ac() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} return AC; }
function tone(f, d = .15, type = 'sine', at = 0, v = .15) {
  if (!soundOn) return; const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(v, c.currentTime + at); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + at + d);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime + at); o.stop(c.currentTime + at + d + .02);
}
const sfx = {
  tap() { tone(660, .08); },
  ok() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', i * .1)); },
  bad() { tone(220, .25, 'sawtooth', 0, .07); tone(180, .3, 'sawtooth', .12, .07); },
  win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', i * .11)); }
};

/* ---------- speech ---------- */
let voices = [];
const hasTTS = 'speechSynthesis' in window;
function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch (e) {} }
if (hasTTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function speakParts(parts) {            // parts: [[text, lang], ...]
  if (!soundOn || !hasTTS) return;
  try {
    speechSynthesis.cancel();
    parts.forEach(([text, lang]) => {
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = .85; u.pitch = 1.1;
      const l = lang.toLowerCase();
      const v = voices.find(x => x.lang.replace('_', '-').toLowerCase() === l) || voices.find(x => x.lang.toLowerCase().startsWith(l.slice(0, 2)));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    });
  } catch (e) {}
}
const say = (text, lang = 'ar-SA') => speakParts([[text, lang]]);

/* ---------- stars / confetti / toast ---------- */
function paintStars() { const el = $('#stars'); el.textContent = '⭐ ' + stars; }
function addStars(n) {
  stars += n; store.set('stars', stars); paintStars();
  const el = $('#stars'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}
function confetti(n = 40) {
  const set = ['🎉', '⭐', '🎈', '✨', '🌟', '💛'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'confetti'; s.textContent = pick(set);
    s.style.left = rnd(100) + 'vw'; s.style.fontSize = (18 + rnd(26)) + 'px';
    s.style.animationDuration = (2 + Math.random() * 2.2) + 's'; s.style.animationDelay = (Math.random() * .8) + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 5200);
  }
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 1800); }

/* ---------- modal ---------- */
function closeModal() { document.querySelectorAll('.modal').forEach(m => m.remove()); }
function modal(html) {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="mc" role="dialog" aria-modal="true"><button class="x" aria-label="إغلاق">✕</button>${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('.x')) closeModal(); });
  document.body.appendChild(m);
  return m.querySelector('.mc');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- drawing pad (trace + free draw) ---------- */
const PEN = ['#E03131', '#F76707', '#FAB005', '#2F9E44', '#1C7ED6', '#7048E8', '#F06595', '#8B5A2B', '#1F2A44'];
function toolsHTML() {
  return `<div class="tools">${PEN.map((c, i) => `<button class="dotb${i ? '' : ' on'}" data-col="${c}" style="background:${c}" aria-label="لون"></button>`).join('')}
  <span class="sep"></span>
  <button class="sz on" data-sz="8" aria-label="قلم رفيع"><i style="width:8px;height:8px"></i></button>
  <button class="sz" data-sz="18" aria-label="قلم عريض"><i style="width:18px;height:18px"></i></button>
  <button class="sz" data-er="1" aria-label="ممحاة">🧽</button>
  <button class="btn alt" data-clear style="font-size:1rem;padding:4px 14px">🗑️ مسح</button></div>`;
}
function bindPad(root, cv) {
  const ctx = cv.getContext('2d'); const st = { col: PEN[0], sz: 8, er: false };
  const fit = () => { const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; };
  fit();
  let down = false, lx = 0, ly = 0;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const style = () => { ctx.globalCompositeOperation = st.er ? 'destination-out' : 'source-over'; ctx.strokeStyle = st.col; ctx.lineWidth = st.er ? 44 : st.sz; };
  cv.addEventListener('pointerdown', e => { down = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} [lx, ly] = pos(e); style(); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + .01, ly); ctx.stroke(); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { if (!down) return; const [x, y] = pos(e); style(); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke(); lx = x; ly = y; e.preventDefault(); });
  const up = () => { down = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.col) { st.col = b.dataset.col; st.er = false; root.querySelectorAll('.dotb,.sz').forEach(x => x.classList.remove('on')); b.classList.add('on'); root.querySelector(`.sz[data-sz="${st.sz}"]`)?.classList.add('on'); sfx.tap(); }
    else if (b.dataset.sz) { st.sz = +b.dataset.sz; st.er = false; root.querySelectorAll('.sz').forEach(x => x.classList.remove('on')); b.classList.add('on'); sfx.tap(); }
    else if (b.dataset.er) { st.er = true; root.querySelectorAll('.sz').forEach(x => x.classList.remove('on')); b.classList.add('on'); sfx.tap(); }
    else if ('clear' in b.dataset) { const r = cv.getBoundingClientRect(); ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, r.width, r.height); ctx.restore(); sfx.tap(); }
  });
  return { cv, ctx };
}

/* ---------- navigation chrome ---------- */
const backBtn = $('#back');
function chrome(title, back, theme) {
  $('#title').textContent = title; document.title = title === 'عالم زين' ? 'عالم زين التعليمي | Zain\'s Learning World' : title + ' — عالم زين';
  backBtn.style.visibility = back ? 'visible' : 'hidden'; backBtn.dataset.to = back || ''; setTheme(theme);
}
backBtn.addEventListener('click', () => { if (backBtn.dataset.to) location.hash = backBtn.dataset.to; });
$('#snd').addEventListener('click', () => {
  soundOn = !soundOn; store.set('sound', soundOn); $('#snd').textContent = soundOn ? '🔊' : '🔇';
  if (!soundOn && hasTTS) try { speechSynthesis.cancel(); } catch (e) {}
  toast(soundOn ? 'الصوت يعمل 🔊' : 'الصوت متوقف 🔇'); if (soundOn) sfx.tap();
});

/* ---------- pages ---------- */
const HOME_TILES = [
  ['#/ar', 'ar', 'أ', 'الحروف العربية', 'Arabic Letters', ''],
  ['#/en', 'en', 'A', 'الحروف الإنجليزية', 'English Letters', 'en'],
  ['#/hisab', 'hisab', '٣', 'الأرقام العربية', 'Arabic Numbers', ''],
  ['#/math', 'math', '3', 'الأرقام الإنجليزية', 'English Numbers', 'en'],
  ['#/colors', 'colors', '🎨', 'الألوان', 'Colors', 'emo'],
  ['#/science', 'science', '🔬', 'العلوم', 'Science', 'emo'],
  ['#/games', 'games', '🎮', 'ألعاب وأنشطة', 'Games', 'emo'],
  ['#/draw', 'draw', '🖍️', 'ارسم وتلوّن', 'Draw', 'emo'],
  ['#/stars', 'stars', '🏆', 'نجوم زين', 'Super Star', 'emo']
];
function pageHome() {
  chrome('عالم زين', '', 'home');
  app.innerHTML = `
  <div class="hello">
    <svg class="mascot" viewBox="0 0 100 100" role="img" aria-label="نجمة"><use href="#starface"/></svg>
    <button class="bubble" data-act="greet" style="text-align:start;cursor:pointer">أهلاً يا زين! 👋 ماذا تحب أن نتعلم اليوم؟ اختر واحدة من البطاقات.<small>Hi Zain! Pick something to learn today.</small></button>
  </div>
  <div class="tiles">${HOME_TILES.map(([h, t, g, n, s, c]) => `<a class="tile" href="${h}" style="${thStyle(t)}"><span class="tglyph ${c}">${g}</span><span class="tname">${n}</span><span class="tsub">${s}</span></a>`).join('')}</div>`;
}

const KINDS = {
  ar: { data: AR, theme: 'ar', title: 'الحروف العربية', dir: 'rtl', game: 'ar-easy' },
  en: { data: EN, theme: 'en', title: 'English Letters', dir: 'ltr', game: 'en-easy' },
  hisab: { data: ARN, theme: 'hisab', title: 'الأرقام العربية', dir: 'rtl', game: 'count-ar' },
  math: { data: ENN, theme: 'math', title: 'English Numbers', dir: 'ltr', game: 'count-en' }
};
const isNum = k => k === 'hisab' || k === 'math';

function pageList(kind) {
  const K = KINDS[kind]; chrome(K.title, '#/', K.theme);
  let cells;
  if (!isNum(kind)) cells = K.data.map((d, i) => `<a class="lcard" style="--k:${KC[i % 6]}" href="#/${kind}/${i}" aria-label="${d.ch}"><span>${d.ch}</span></a>`).join('');
  else cells = K.data.map((nm, i) => `<a class="ncard${kind === 'math' ? ' en' : ''}" style="--k:${KC[i % 6]}" href="#/${kind}/${i}"><b>${kind === 'hisab' ? arDigits(i) : i}</b><small>${nm}</small></a>`).join('');
  const hint = kind === 'en' ? 'Tap a letter!' : kind === 'math' ? 'Tap a number!' : kind === 'ar' ? 'اضغط على حرف لتتعلمه 👆' : 'اضغط على رقم لتتعلمه 👆';
  app.innerHTML = `<p class="hint" dir="${K.dir}">${hint}</p>
  <div class="grid ${isNum(kind) ? 'nums' : 'letters'} ${K.dir === 'ltr' ? 'en' : ''}" dir="${K.dir}">${cells}</div>
  <div class="row" style="margin-top:26px"><a class="btn" href="#/game/${K.game}" style="text-decoration:none">🎮 ${K.dir === 'ltr' ? 'Let\'s play!' : 'لنلعب!'}</a></div>`;
}

function itemSpeech(kind, i) {
  if (kind === 'ar') { const d = AR[i]; return [[`${d.name}. ${d.word}`, 'ar-SA']]; }
  if (kind === 'en') { const d = EN[i]; return [[`${d.ch}. ${d.ch} for ${d.word}`, 'en-US']]; }
  if (kind === 'hisab') return [[ARN[i], 'ar-SA']];
  return [[ENN[i], 'en-US']];
}
function pager(kind, i, n) {
  const ltr = KINDS[kind].dir === 'ltr';
  const fmt = x => kind === 'hisab' ? arDigits(x) : x;
  const pos = isNum(kind) ? `${fmt(i)}` : `${i + 1} / ${n}`;
  const prev = i > 0 ? `<a href="#/${kind}/${i - 1}">${ltr ? '← Back' : '→ السابق'}</a>` : `<span class="off">${ltr ? '← Back' : '→ السابق'}</span>`;
  const next = i < n - 1 ? `<a href="#/${kind}/${i + 1}">${ltr ? 'Next →' : 'التالي ←'}</a>` : `<span class="off">${ltr ? 'Next →' : 'التالي ←'}</span>`;
  return `<div class="pager" dir="${KINDS[kind].dir}">${prev}<span class="pos" dir="ltr">${pos}</span>${next}</div>`;
}

function pageDetail(kind, i) {
  const K = KINDS[kind]; const n = K.data.length;
  if (!(i >= 0 && i < n)) return pageList(kind);
  chrome(K.title, '#/' + kind, K.theme);
  let body;
  if (kind === 'ar') {
    const d = AR[i];
    body = `<div class="bigl">${d.ch}</div><div class="lname">${d.name}</div>
    <div class="wordbox"><span class="wemoji">${d.e}</span><span class="word"><span style="color:var(--c)">${d.word[0]}</span>${d.word.slice(1)}</span></div>`;
  } else if (kind === 'en') {
    const d = EN[i];
    body = `<div class="bigl en">${d.ch}<small>${d.ch.toLowerCase()}</small></div>
    <div class="wordbox" dir="ltr"><span class="wemoji">${d.e}</span><span class="word" dir="ltr"><span style="color:var(--c)">${d.word[0]}</span>${d.word.slice(1)}</span></div>`;
  } else {
    const ar = kind === 'hisab';
    const big = ar ? arDigits(i) : String(i), other = ar ? String(i) : arDigits(i);
    const emoji = OBJ[i] || '⭐';
    const items = i === 0 ? `<div class="empty">🍽️<small>${ar ? 'لا يوجد شيء — صفر' : 'Nothing here — zero'}</small></div>`
      : `<div class="items" dir="ltr">${Array.from({ length: i }, (_, k) => `<button class="item" data-act="item" data-k="${k}" aria-label="${k + 1}">${emoji}</button>`).join('')}</div>`;
    body = `<div class="bigl ${ar ? '' : 'en'}">${big}<small>${other}</small></div>
    <div class="lname ${ar ? '' : 'en'}" style="${ar ? '' : 'font-family:var(--f-en)'}">${K.data[i]}</div>
    ${items}<div class="counter" id="counter" aria-live="polite"></div>`;
  }
  const L = K.dir === 'ltr';
  const countBtn = isNum(kind) && i > 0 ? `<button class="btn ok" data-act="count">👆 ${L ? 'Count with me' : 'عُدّ معي'}</button>` : '';
  app.innerHTML = `<div class="detail" dir="${K.dir}"><div class="dcard">${body}
    <div class="row" style="margin-top:8px">
      <button class="btn" data-act="hear">🔊 ${L ? 'Listen' : 'استمع'}</button>
      <button class="btn alt" data-act="trace">✏️ ${L ? 'Write it' : 'اكتب'}</button>${countBtn}
    </div></div>${pager(kind, i, n)}</div>`;
  app.dataset.kind = kind; app.dataset.i = i;
  later(() => speakParts(itemSpeech(kind, i)), 350);
}

function countAlong(kind, i) {
  const items = [...app.querySelectorAll('.item')]; const ar = kind === 'hisab';
  items.forEach(x => x.classList.remove('on'));
  items.forEach((el, k) => later(() => {
    items.forEach((x, j) => x.classList.toggle('on', j === k));
    $('#counter').textContent = ar ? arDigits(k + 1) + ' — ' + ARN[k + 1] : (k + 1) + ' — ' + ENN[k + 1];
    sfx.tap(); say(ar ? ARN[k + 1] : ENN[k + 1], ar ? 'ar-SA' : 'en-US');
    if (k === items.length - 1) later(() => { items.forEach(x => x.classList.add('on')); confetti(18); }, 900);
  }, 1000 * k));
}

function traceModal(kind, i) {
  const L = !(kind === 'ar' || kind === 'hisab');
  const ch = kind === 'ar' ? AR[i].ch : kind === 'en' ? EN[i].ch : kind === 'hisab' ? arDigits(i) : String(i);
  const m = modal(`<div class="mn" style="font-size:1.6rem">${L ? 'Trace it with your finger!' : 'اكتب فوق الشكل بإصبعك!'}</div>
    <div class="stage"><div class="ghost ${L ? 'en' : ''}">${ch}</div><canvas class="pad" aria-label="مساحة الكتابة"></canvas></div>${toolsHTML()}`);
  bindPad(m, m.querySelector('canvas'));
}

/* colors */
function pageColors() {
  chrome('الألوان', '#/', 'colors');
  app.innerHTML = `<div class="banner" id="cb"><span class="be">🎨</span><span>اضغط على لون لتتعلمه!<br><small dir="ltr" style="font-family:var(--f-en);display:block">Tap a color!</small></span></div>
  <div class="grid colors">${COLORS.map((c, i) => `<button class="ccard" data-act="color" data-i="${i}"><span class="sw" style="background:${c.hex}"></span><b>${c.ar}</b><small>${c.en}</small></button>`).join('')}</div>
  <h2 class="sub">🧪 مختبر الألوان — امزج لونين!</h2>
  <div class="lab">
    <div class="prims">${['red', 'yellow', 'blue', 'white'].map(k => `<button class="prim" data-act="prim" data-k="${k}" style="background:${COL(k).hex}" aria-label="${COL(k).ar}"></button>`).join('')}</div>
    <div class="eq"><span class="slot" id="s1"></span><span>+</span><span class="slot" id="s2"></span><span>=</span><span class="res" id="res"></span></div>
    <div class="resname" id="resname">اختر لونين</div>
    <button class="btn alt" data-act="mixreset" style="font-size:1rem;padding:4px 16px">🔄 من جديد</button>
  </div>`;
  app.dataset.mix = '';
}
function mixPick(k) {
  let sel = app.dataset.mix ? app.dataset.mix.split(',') : [];
  if (sel.length >= 2) sel = [];
  sel.push(k); app.dataset.mix = sel.join(',');
  const s1 = $('#s1'), s2 = $('#s2'), res = $('#res'), nm = $('#resname');
  [s1, s2].forEach((s, j) => { s.style.background = sel[j] ? COL(sel[j]).hex : '#fff'; s.classList.toggle('full', !!sel[j]); });
  sfx.tap();
  if (sel.length < 2) { res.style.background = '#fff'; nm.textContent = 'اختر لونًا آخر'; return; }
  let r;
  if (sel[0] === sel[1]) { const c = COL(sel[0]); r = [c.ar, c.en, c.hex]; }
  else r = MIX[[...sel].sort().join('+')];
  res.style.background = r[2]; nm.innerHTML = `${r[0]}<br><small style="font-family:var(--f-en)">${r[1]}</small>`;
  sfx.ok(); speakParts([[r[0], 'ar-SA'], [r[1], 'en-US']]);
}

/* science */
function pageScience(tab = 'fruits') {
  chrome('العلوم', '#/', 'science');
  const S = SCI[tab];
  app.innerHTML = `<div class="tabs">${Object.entries(SCI).map(([k, v]) => `<button class="tab${k === tab ? ' on' : ''}" data-act="tab" data-k="${k}">${v.t}</button>`).join('')}</div>
  <p class="hint">اضغط على الصورة لتعرف المزيد 👆</p>
  <div class="grid sci">${S.items.map((it, i) => `<button class="scard" data-act="sci" data-t="${tab}" data-i="${i}"><span class="se">${it[2]}</span><b>${it[0]}</b><small>${it[1]}</small></button>`).join('')}</div>
  <div class="row" style="margin-top:24px"><a class="btn" href="#/game/fruit-veg" style="text-decoration:none">🎮 فاكهة أم خضار؟</a></div>`;
  app.dataset.tab = tab;
}
function sciModal(tab, i) {
  const it = SCI[tab].items[i];
  const m = modal(`<div class="me">${it[2]}</div><div class="mn">${it[0]}<small>${it[1]}</small></div><p class="fact">${it[3]}</p>
    <button class="btn" data-hear>🔊 استمع</button>`);
  const hear = () => speakParts([[it[0], 'ar-SA'], [it[1], 'en-US'], [it[3], 'ar-SA']]);
  m.querySelector('[data-hear]').addEventListener('click', hear); hear();
}

/* draw */
function pageDraw() {
  chrome('ارسم وتلوّن', '#/', 'draw');
  app.innerHTML = `<div class="drawwrap"><p class="hint">ارسم ما تشاء بإصبعك! 🖍️</p>
    <div class="paper"><canvas class="pad" aria-label="لوحة الرسم"></canvas></div>${toolsHTML()}
    <div class="row" style="margin-top:14px"><button class="btn ok" data-save>💾 احفظ الرسمة</button></div></div>`;
  const root = $('.drawwrap'); const cv = $('canvas', root); bindPad(root, cv);
  $('[data-save]', root).addEventListener('click', () => {
    const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height;
    const c = t.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, t.width, t.height); c.drawImage(cv, 0, 0);
    const a = document.createElement('a'); a.href = t.toDataURL('image/png'); a.download = 'zain-drawing.png'; document.body.appendChild(a); a.click(); a.remove();
    toast('تم حفظ الرسمة 🎉');
  });
}

/* stars / certificate */
const LEVELS = [[0, '🌱', 'برعم صغير'], [10, '⭐', 'نجم صاعد'], [30, '🌟', 'نجم لامع'], [60, '🏆', 'سوبر ستار'], [100, '👑', 'ملك النجوم']];
function pageStars() {
  chrome('نجوم زين', '#/', 'stars');
  let cur = 0; LEVELS.forEach((l, i) => { if (stars >= l[0]) cur = i; });
  const nxt = LEVELS[cur + 1]; const pct = nxt ? Math.round(100 * (stars - LEVELS[cur][0]) / (nxt[0] - LEVELS[cur][0])) : 100;
  app.innerHTML = `<div class="cert"><span class="tag">شهادة تقدير</span><div style="font-size:4rem;line-height:1.2">${LEVELS[cur][1]}</div>
    <div class="ss">Super Star</div><div class="zz">Zain</div>
    <div class="cnt">⭐ ${stars} نجمة</div><div class="msg">${LEVELS[cur][2]} — أنت ذكي ولطيف ومذهل يا زين!</div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="msg" style="font-size:1rem">${nxt ? `باقي ${nxt[0] - stars} نجمة لتصل إلى «${nxt[2]}» ${nxt[1]}` : 'وصلت إلى أعلى مستوى! 🎉'}</div>
    <div class="badges">${LEVELS.map((l, i) => `<div class="badge${i > cur ? ' lock' : ''}"><b>${l[1]}</b>${l[2]}</div>`).join('')}</div>
    <div class="row noprint"><a class="btn" href="#/games" style="text-decoration:none">🎮 اجمع المزيد</a><button class="btn alt" data-act="print">🖨️ اطبع</button></div>
  </div>
  <button class="link noprint" data-act="resetstars">تصفير النجوم</button>`;
  if (stars >= 10) later(() => confetti(24), 300);
}

/* ---------- games ---------- */
const GAMES = [
  { id: 'ar-easy', t: 'أي حرف؟ (أ ب ت)', g: 'أ', gen: () => letterGen('ar', AR.slice(0, 3)) },
  { id: 'ar-all', t: 'أي حرف؟ (كل الحروف)', g: 'ب', gen: () => letterGen('ar', AR) },
  { id: 'en-easy', t: 'Which letter? A B C', g: 'A', en: 1, gen: () => letterGen('en', EN.slice(0, 3)) },
  { id: 'en-all', t: 'Which letter? A to Z', g: 'Z', en: 1, gen: () => letterGen('en', EN) },
  { id: 'count-ar', t: 'كم العدد؟ (١ إلى ٥)', g: '٣', gen: () => countGen('ar') },
  { id: 'count-en', t: 'How many? 0 to 10', g: '7', en: 1, gen: () => countGen('en') },
  { id: 'balloons', t: 'فرقع البالونة 🎈', g: '🎈', emo: 1, gen: balloonGen },
  { id: 'pattern', t: 'أكمل النمط', g: '🧩', emo: 1, gen: patternGen },
  { id: 'color-pick', t: 'اختر اللون', g: '🎨', emo: 1, gen: colorPickGen },
  { id: 'color-fruit', t: 'ما لون هذا؟', g: '🍌', emo: 1, gen: colorFruitGen },
  { id: 'fruit-veg', t: 'فاكهة أم خضار؟', g: '🥕', emo: 1, gen: fruitVegGen },
  { id: 'memory', t: 'لعبة الذاكرة', g: '🧠', emo: 1, memory: true }
];
const PRAISE_AR = ['أحسنت!', 'ممتاز!', 'برافو يا زين!', 'رائع!', 'عمل جميل!'];
const PRAISE_EN = ['Great job!', 'Well done!', 'Excellent!', 'Awesome!'];

function pageGames() {
  chrome('ألعاب وأنشطة', '#/', 'games');
  app.innerHTML = `<p class="hint">اختر لعبة واجمع النجوم! ⭐</p>
  <div class="tiles">${GAMES.map((g, i) => `<a class="tile" href="#/game/${g.id}" style="--c:${KC[i % 6]};--c2:#fff;--c3:${KC[i % 6]}33"><span class="tglyph ${g.en ? 'en' : ''} ${g.emo ? 'emo' : ''}">${g.g}</span><span class="tname" dir="auto" style="font-size:1.05rem">${g.t}</span></a>`).join('')}
  <a class="tile" href="#/draw" style="${thStyle('draw')}"><span class="tglyph emo">🖍️</span><span class="tname" style="font-size:1.05rem">ارسم وتلوّن</span></a></div>`;
}

function pageGame(id) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return pageGames();
  chrome(g.t.replace(/ ?🎈/, ''), '#/games', 'games');
  setTheme('games');
  if (g.memory) return memoryGame();
  runQuiz(g);
}

function runQuiz(g) {
  const rounds = 6; let r = 0, score = 0, first = true, busy = false, q;
  function next() {
    if (r >= rounds) return finish();
    q = g.gen(); q.opts = shuffle(q.opts); first = true; busy = false; paint();
    if (q.say) later(() => say(q.say[0], q.say[1]), 300);
  }
  function paint() {
    app.innerHTML = `<div class="quiz">
      <div class="qtop"><div class="progress"><i style="width:${r / rounds * 100}%"></i></div><div class="qn">${r + 1}/${rounds}</div></div>
      <div class="ask" dir="auto">${q.ask}<small dir="auto">${q.sub || ''}</small></div>
      ${q.stim ? `<div class="stimulus" data-hear tabindex="0" role="button" title="اضغط للاستماع">${q.stim}</div>` : ''}
      <div class="opts ${q.cls || ''}">${q.opts.map((o, i) => `<button class="opt" data-i="${i}" style="${o.st || ''}" ${o.aria ? `aria-label="${o.aria}"` : ''}>${o.h}</button>`).join('')}</div>
      <div class="feedback" aria-live="polite"></div></div>`;
  }
  function finish() {
    const ratio = score / rounds, st = ratio >= .84 ? 3 : ratio >= .5 ? 2 : 1; addStars(st);
    const msg = st === 3 ? 'ممتاز يا بطل! 🏆' : st === 2 ? 'أحسنت يا زين! 👏' : 'محاولة جميلة! 💪';
    app.innerHTML = `<div class="result"><h2>${msg}</h2>
      <div class="bigstars">${[1, 2, 3].map(n => n <= st ? '⭐' : '<span class="dim">⭐</span>').join('')}</div>
      <p style="font-weight:700;font-size:1.15rem">إجابات صحيحة من أول مرة: ${score} من ${rounds}<br>حصلت على ${st} نجوم إضافية!</p>
      <div class="row"><button class="btn ok" data-again>🔁 العب مرة أخرى</button><a class="btn alt" href="#/games" style="text-decoration:none">🎮 ألعاب أخرى</a></div></div>`;
    sfx.win(); if (st >= 2) confetti(50); say(st === 3 ? 'ممتاز يا بطل' : 'أحسنت يا زين');
    $('[data-again]').addEventListener('click', () => { r = 0; score = 0; sfx.tap(); next(); });
  }
  app.onclick = e => {
    if (e.target.closest('[data-hear]') && q && q.say) { say(q.say[0], q.say[1]); return; }
    const b = e.target.closest('.opt'); if (!b || busy || !q) return;
    const o = q.opts[+b.dataset.i]; const fb = $('.feedback');
    if (o.ok) {
      busy = true; b.classList.add('right'); sfx.ok();
      if (first) { score++; addStars(1); }
      const p = q.lang === 'en' ? pick(PRAISE_EN) : pick(PRAISE_AR); fb.textContent = p + ' ⭐'; say(p, q.lang === 'en' ? 'en-US' : 'ar-SA');
      later(() => { r++; next(); }, 1500);
    } else {
      first = false; b.classList.add('wrong'); sfx.bad(); fb.textContent = q.lang === 'en' ? 'Try again 💪' : 'حاول مرة أخرى 💪';
      later(() => b.classList.remove('wrong'), 450);
    }
  };
  next();
}

/* generators */
function letterGen(kind, pool) {
  const t = pick(pool); const all = kind === 'ar' ? AR : EN;
  let others = pool.filter(x => x !== t);
  if (others.length < 2) others = all.filter(x => x !== t);
  const opts = [t, ...sample(others, 2)].map(x => ({ ok: x === t, h: `<span class="${kind === 'en' ? 'en' : ''}">${x.ch}</span>`, aria: x.ch }));
  const en = kind === 'en';
  return {
    lang: en ? 'en' : 'ar', ask: 'بأي حرف يبدأ هذا الاسم؟', sub: 'Which letter does it start with?',
    stim: `<div class="bigemoji">${t.e}</div><div class="bigword ${en ? 'en' : ''}">${t.word}</div>`,
    say: [t.word, en ? 'en-US' : 'ar-SA'], opts
  };
}
function countGen(kind) {
  const ar = kind === 'ar'; const n = ar ? 1 + rnd(5) : rnd(11); const e = pick(OBJ.slice(1));
  const pool = ar ? [1, 2, 3, 4, 5] : Array.from({ length: 11 }, (_, i) => i);
  const opts = [n, ...sample(pool.filter(x => x !== n), 2)].map(x => ({ ok: x === n, h: `<span class="${ar ? '' : 'en'}">${ar ? arDigits(x) : x}</span>`, aria: String(x) }));
  return {
    lang: ar ? 'ar' : 'en', ask: ar ? 'كم عددها؟' : 'How many?', sub: ar ? 'اختر الرقم الصحيح' : 'كم العدد؟',
    stim: n === 0 ? `<div class="bigemoji">🍽️</div><div class="bigword">${ar ? 'لا شيء' : 'Nothing'}</div>` : `<div class="many">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</div>`,
    say: ar ? ['كم العدد؟', 'ar-SA'] : ['How many?', 'en-US'], opts
  };
}
function balloonGen() {
  const ar = Math.random() < .5; const n = rnd(11); const cols = shuffle(['#E03131', '#1C7ED6', '#2F9E44', '#7048E8', '#F76707', '#D6336C']);
  const nums = [n, ...sample(Array.from({ length: 11 }, (_, i) => i).filter(x => x !== n), 3)];
  const opts = nums.map((x, i) => ({ ok: x === n, h: `<span class="${ar ? '' : 'en'}">${ar ? arDigits(x) : x}</span>`, st: `--b:${cols[i]};--d:${-i * .7}s`, aria: String(x) }));
  return {
    lang: ar ? 'ar' : 'en', ask: ar ? 'فرقع البالونة التي عليها الرقم' : 'Pop the balloon with the number', sub: ar ? 'Pop the balloon!' : 'فرقع البالونة!',
    stim: `<div class="bigword ${ar ? '' : 'en'}">${ar ? ARN[n] : ENN[n]}</div>`, say: ar ? [ARN[n], 'ar-SA'] : [ENN[n], 'en-US'], cls: 'balloon', opts
  };
}
function patternGen() {
  const ar = Math.random() < .5; const step = !ar && Math.random() < .4 ? 2 : 1;
  const start = ar ? 1 + rnd(4) : rnd(3) * (step === 2 ? 1 : 1) + (step === 2 ? 0 : 1);
  const seq = Array.from({ length: 5 }, (_, k) => start + step * k); const m = 1 + rnd(3); const ans = seq[m];
  const wrong = shuffle([ans - step, ans + step, ans + 2 * step, ans - 2 * step].filter(x => x >= 0 && x !== ans && x <= 12)).slice(0, 2);
  const fmt = x => ar ? arDigits(x) : x;
  const cells = seq.map((x, k) => k === m ? `<span class="slot" style="border-radius:16px;display:inline-block;width:62px;height:62px"></span>` : `<span class="bigword ${ar ? '' : 'en'}" style="min-width:48px">${fmt(x)}</span>`).join('');
  return {
    lang: ar ? 'ar' : 'en', ask: 'ما الرقم الناقص؟', sub: 'What number is missing?',
    stim: `<div class="many" dir="${ar ? 'rtl' : 'ltr'}" style="align-items:center;gap:14px">${cells}</div>`,
    opts: [ans, ...wrong].map(x => ({ ok: x === ans, h: `<span class="${ar ? '' : 'en'}">${fmt(x)}</span>`, aria: String(x) }))
  };
}
function colorPickGen() {
  const t = pick(COLORS.slice(0, 9)); const others = sample(COLORS.slice(0, 9).filter(c => c !== t), 2);
  return {
    lang: 'ar', ask: `أين اللون ${t.ar}؟`, sub: `Where is ${t.en.toLowerCase()}?`, stim: `<div class="bigword">${t.ar} · <span class="en">${t.en}</span></div>`,
    say: [`أين اللون ${t.ar}`, 'ar-SA'], opts: [t, ...others].map(c => ({ ok: c === t, h: `<span class="swatch" style="background:${c.hex}"></span>`, aria: c.ar }))
  };
}
function colorFruitGen() {
  const [e, nm, ck] = pick(FRUIT_COLOR); const t = COL(ck); const others = sample(COLORS.slice(0, 8).filter(c => c !== t), 2);
  return {
    lang: 'ar', ask: `ما لون ${nm}؟`, sub: 'What color is it?', stim: `<div class="bigemoji">${e}</div><div class="bigword">${nm}</div>`,
    say: [`ما لون ${nm}`, 'ar-SA'], opts: [t, ...others].map(c => ({ ok: c === t, h: `<span class="swatch" style="background:${c.hex}"></span>`, aria: c.ar }))
  };
}
function fruitVegGen() {
  const isF = Math.random() < .5; const it = pick(isF ? FRUITS.slice(0, 6) : VEGS);
  return {
    lang: 'ar', ask: 'هل هذا فاكهة أم خضار؟', sub: 'Is it a fruit or a vegetable?', stim: `<div class="bigemoji">${it[2]}</div><div class="bigword">${it[0]} · <span class="en">${it[1]}</span></div>`,
    say: [it[0], 'ar-SA'], cls: 'two',
    opts: [{ ok: isF, h: `<span style="font-size:3rem">🍎</span><span style="font-size:1.5rem">فاكهة</span><small>Fruit</small>` }, { ok: !isF, h: `<span style="font-size:3rem">🥕</span><span style="font-size:1.5rem">خضار</span><small>Vegetable</small>` }]
  };
}

/* memory game */
function memoryGame() {
  const pool = sample(['🍎', '🍌', '🍇', '🍊', '🥕', '🐶', '🐱', '🐟', '🦁', '🐘', '🌸', '🚗'], 6);
  const cards = shuffle([...pool, ...pool]); let open = [], matched = 0, moves = 0, lock = false;
  const info = () => `الحركات: ${moves} &nbsp;·&nbsp; الأزواج: ${matched}/6`;
  app.innerHTML = `<div class="quiz"><p class="hint">اقلب البطاقات وابحث عن الأزواج المتشابهة! 🧠</p><div class="minfo" id="mi">${info()}</div>
    <div class="mgrid">${cards.map((e, i) => `<button class="mcard" data-i="${i}" aria-label="بطاقة"><span class="f">❓</span><span class="b">${e}</span></button>`).join('')}</div></div>`;
  app.onclick = e => {
    const b = e.target.closest('.mcard'); if (!b || lock || b.classList.contains('flip')) return;
    b.classList.add('flip'); sfx.tap(); open.push(b);
    if (open.length < 2) return;
    moves++; const [a, c] = open; open = [];
    if (cards[+a.dataset.i] === cards[+c.dataset.i]) {
      matched++; a.classList.add('done'); c.classList.add('done'); sfx.ok(); $('#mi').innerHTML = info();
      if (matched === 6) later(() => {
        addStars(3); sfx.win(); confetti(60); say('أحسنت يا زين');
        app.innerHTML = `<div class="result"><h2>أحسنت يا بطل! 🎉</h2><div class="bigstars">⭐⭐⭐</div><p style="font-weight:700;font-size:1.15rem">أنهيت اللعبة في ${moves} حركات</p>
          <div class="row"><button class="btn ok" data-again>🔁 العب مرة أخرى</button><a class="btn alt" href="#/games" style="text-decoration:none">🎮 ألعاب أخرى</a></div></div>`;
        $('[data-again]').addEventListener('click', memoryGame);
      }, 700);
    } else {
      lock = true; $('#mi').innerHTML = info();
      later(() => { a.classList.remove('flip'); c.classList.remove('flip'); lock = false; }, 850);
    }
  };
}

/* ---------- events (delegated) ---------- */
app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, kind = app.dataset.kind, i = +app.dataset.i;
  if (act === 'greet') { sfx.tap(); speakParts([['أهلا يا زين! ماذا تحب أن نتعلم اليوم؟', 'ar-SA']]); }
  else if (act === 'hear') { sfx.tap(); speakParts(itemSpeech(kind, i)); }
  else if (act === 'trace') { sfx.tap(); traceModal(kind, i); }
  else if (act === 'count') { sfx.tap(); countAlong(kind, i); }
  else if (act === 'item') {
    const k = +b.dataset.k; const ar = kind === 'hisab'; sfx.tap();
    app.querySelectorAll('.item').forEach((x, j) => x.classList.toggle('on', j <= k));
    $('#counter').textContent = ar ? arDigits(k + 1) + ' — ' + ARN[k + 1] : (k + 1) + ' — ' + ENN[k + 1];
    say(ar ? ARN[k + 1] : ENN[k + 1], ar ? 'ar-SA' : 'en-US');
  }
  else if (act === 'color') {
    const c = COLORS[+b.dataset.i]; const cb = $('#cb'); cb.style.borderColor = c.hex === '#FFFFFF' ? '#adb5bd' : c.hex;
    cb.innerHTML = `<span class="be">${c.e}</span><span>اللون <span style="color:${c.hex === '#FFFFFF' ? '#868e96' : c.hex}">${c.ar}</span><br><small dir="ltr" style="font-family:var(--f-en);display:block">${c.en}</small></span>`;
    sfx.tap(); speakParts([[c.ar, 'ar-SA'], [c.en, 'en-US']]);
  }
  else if (act === 'prim') mixPick(b.dataset.k);
  else if (act === 'mixreset') { app.dataset.mix = ''; $('#s1').style.background = $('#s2').style.background = $('#res').style.background = '#fff'; $('#resname').textContent = 'اختر لونين'; sfx.tap(); }
  else if (act === 'tab') { sfx.tap(); pageScience(b.dataset.k); }
  else if (act === 'sci') { sfx.tap(); sciModal(b.dataset.t, +b.dataset.i); }
  else if (act === 'print') window.print();
  else if (act === 'resetstars') { if (confirm('هل تريد تصفير النجوم؟')) { stars = 0; store.set('stars', 0); paintStars(); pageStars(); } }
});

/* ---------- router ---------- */
function route() {
  token++; closeModal(); app.onclick = null; app.dataset.kind = ''; app.dataset.i = '';
  if (hasTTS) try { speechSynthesis.cancel(); } catch (e) {}
  const [a, b] = (location.hash || '#/').slice(2).split('/');
  if (!a) pageHome();
  else if (KINDS[a]) (b === undefined || b === '') ? pageList(a) : pageDetail(a, parseInt(b, 10));
  else if (a === 'colors') pageColors();
  else if (a === 'science') pageScience();
  else if (a === 'games') pageGames();
  else if (a === 'game') pageGame(b);
  else if (a === 'draw') pageDraw();
  else if (a === 'stars') pageStars();
  else pageHome();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
$('#snd').textContent = soundOn ? '🔊' : '🔇';
paintStars();
route();
})();
