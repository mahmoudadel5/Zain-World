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
  const h1 = $('#title');
  if (title === 'عالم زين') h1.innerHTML = '<img class="hlogo" src="img/icon-192.png" alt=""><span class="w1">عالم</span><span class="w2">زين</span>';
  else h1.textContent = title;
  h1.className = title === 'عالم زين' ? 'home' : '';
  document.title = title === 'عالم زين' ? 'عالم زين التعليمي | Zain\'s Learning World' : title + ' — عالم زين';
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
  ['#/shapes', 'shapes', '🔷', 'الأشكال', 'Shapes', 'emo'],
  ['#/science', 'science', '🔬', 'العلوم', 'Science', 'emo'],
  ['#/feelings', 'feelings', '😊', 'مشاعري', 'My Feelings', 'emo'],
  ['#/stories', 'stories', '📖', 'حكايات واسمي', 'Stories', 'emo'],
  ['#/games', 'games', '🎮', 'ألعاب الذكاء', 'Brain Games', 'emo'],
  ['#/move', 'move', '🏃', 'ألعاب الحركة', 'Move & Play', 'emo'],
  ['#/draw', 'draw', '🖍️', 'ارسم وتلوّن', 'Draw', 'emo'],
  ['#/stars', 'stars', '🏆', 'نجوم زين', 'Super Star', 'emo']
];
function pageHome() {
  chrome('عالم زين', '', 'home');
  app.innerHTML = `
  <div class="hello">
    <img class="hero" src="img/logo.png" alt="شعار عالم زين — نتعلم نلعب ننمو" width="320" height="320">
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
/* =====================================================================
   المنهج الموسّع: أشكال، مشاعر، جسم، طقس، نباتات، حكايات، ألغاز، برمجة، حركة
   ===================================================================== */
Object.assign(TH, {
  shapes: ['#845EF7', '#EDE7FD', '#CDBFF8'], feelings: ['#FF8787', '#FFECEC', '#FFC9C9'],
  stories: ['#15AABF', '#E3FAFC', '#A5D8E0'], move: ['#82C91E', '#F0FAE0', '#C5E88B']
});
SCI.body = { t: '🧍 جسمي', items: [
  ['عين', 'Eye', '👁️', 'نرى بعيوننا الألوان والأشكال.'], ['أذن', 'Ear', '👂', 'نسمع بآذاننا الأصوات والموسيقى.'],
  ['أنف', 'Nose', '👃', 'نشمّ بأنفنا الروائح الطيبة.'], ['فم', 'Mouth', '👄', 'نأكل ونتكلم بفمنا.'],
  ['يد', 'Hand', '✋', 'نمسك الأشياء ونرسم بأيدينا.'], ['قدم', 'Foot', '🦶', 'نمشي ونجري ونقفز بأقدامنا.']] };
SCI.weather = { t: '⛅ الطقس', items: [
  ['مشمس', 'Sunny', '☀️', 'الجو دافئ ومشمس، نلبس قبعة ونلعب في الخارج.'], ['غائم', 'Cloudy', '☁️', 'السماء مليئة بالغيوم.'],
  ['ممطر', 'Rainy', '🌧️', 'ينزل المطر، نأخذ المظلة.'], ['حار', 'Hot', '🥵', 'نشرب الماء ونلبس ملابس خفيفة.'],
  ['بارد', 'Cold', '🥶', 'نلبس معطفًا دافئًا.'], ['عاصف', 'Windy', '💨', 'الرياح قوية وتحرّك الأشجار.']] };
SCI.plants = { t: '🌱 النباتات', items: [
  ['بذرة', 'Seed', '🌰', 'نزرع البذرة في التراب فتنمو نبتة.'], ['ماء', 'Water', '💧', 'النبات يحتاج الماء ليعيش.'],
  ['شمس', 'Sunlight', '☀️', 'النبات يحتاج ضوء الشمس ليكبر.'], ['هواء', 'Air', '💨', 'النبات يحتاج الهواء أيضًا.'],
  ['نبتة', 'Plant', '🌱', 'تخرج النبتة الصغيرة من البذرة.'], ['شجرة', 'Tree', '🌳', 'الشجرة نبات كبير يعطينا الظل.']] };

/* ---------- shapes ---------- */
const SHAPES = [
  ['circle', 'دائرة', 'Circle', ['⚽', '🌕', '🍪']], ['square', 'مربع', 'Square', ['🧊', '📦', '🪟']],
  ['triangle', 'مثلث', 'Triangle', ['🍕', '⛺', '🚩']], ['rectangle', 'مستطيل', 'Rectangle', ['🚪', '📱', '📘']],
  ['star', 'نجمة', 'Star', ['⭐', '🌟', '✨']], ['heart', 'قلب', 'Heart', ['❤️', '💖', '💝']]
];
const SHCOL = ['#FF6B6B', '#4DABF7', '#FFD43B', '#69DB7C', '#B197FC', '#FF8CC6'];
function shapeSVG(k, fill, size = 90) {
  const st = `fill="${fill}" stroke="#1F2A44" stroke-width="4" stroke-linejoin="round"`;
  const g = {
    circle: `<circle cx="50" cy="50" r="40" ${st}/>`, square: `<rect x="12" y="12" width="76" height="76" rx="6" ${st}/>`,
    triangle: `<polygon points="50,10 92,88 8,88" ${st}/>`, rectangle: `<rect x="5" y="26" width="90" height="48" rx="6" ${st}/>`,
    star: `<polygon points="50,6 62,36 94,38 69,58 78,90 50,72 22,90 31,58 6,38 38,36" ${st}/>`,
    heart: `<path d="M50 88 C10 58 6 28 28 18 C40 13 50 22 50 30 C50 22 60 13 72 18 C94 28 90 58 50 88Z" ${st}/>`
  }[k];
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${g}</svg>`;
}
function pageShapes() {
  chrome('الأشكال', '#/', 'shapes');
  app.innerHTML = `<p class="hint">اضغط على الشكل لتتعرف عليه 👆</p>
  <div class="grid sci">${SHAPES.map((s, i) => `<button class="scard" data-act="shape" data-i="${i}">${shapeSVG(s[0], SHCOL[i], 84)}<b>${s[1]}</b><small>${s[2]}</small></button>`).join('')}</div>
  <div class="row" style="margin-top:24px"><a class="btn" href="#/game/shape-pick" style="text-decoration:none">🎮 لعبة الأشكال</a><a class="btn alt" href="#/game/sort-color" style="text-decoration:none">🧺 صنّف الأشكال</a></div>`;
}
function shapeModal(i) {
  const s = SHAPES[i];
  const m = modal(`<div style="margin-top:14px">${shapeSVG(s[0], SHCOL[i], 150)}</div><div class="mn">${s[1]}<small>${s[2]}</small></div>
    <p class="fact">نراه في: <span style="font-size:2.4rem;letter-spacing:6px">${s[3].join(' ')}</span></p><button class="btn" data-hear>🔊 استمع</button>`);
  const hear = () => speakParts([[s[1], 'ar-SA'], [s[2], 'en-US']]);
  m.querySelector('[data-hear]').addEventListener('click', hear); hear();
}

/* ---------- feelings ---------- */
const FEEL = [
  ['فرح', 'Happy', '😀', 'نبتسم ونشارك فرحتنا مع من نحب!'], ['حزن', 'Sad', '😢', 'نطلب حضنًا ونتكلم عن حزننا.'],
  ['غضب', 'Angry', '😠', 'نتنفس بعمق ونقول: أنا غاضب، أحتاج مساعدة. ولا نضرب أبدًا.'],
  ['خوف', 'Scared', '😨', 'نقول: أنا خائف، ونمسك يد شخص نثق به.'], ['دهشة', 'Surprised', '😮', 'نتعجب عندما نرى شيئًا جديدًا!'],
  ['تعب', 'Tired', '😴', 'نرتاح وننام لنستعيد نشاطنا.'], ['حب', 'Love', '🥰', 'نقول: أحبك، ونعطي حضنًا دافئًا.']
];
function pageFeelings() {
  chrome('مشاعري', '#/', 'feelings');
  app.innerHTML = `<p class="hint">كيف تشعر اليوم؟ اضغط على الوجه 👆</p>
  <div class="grid sci">${FEEL.map((f, i) => `<button class="scard" data-act="feel" data-i="${i}"><span class="se">${f[2]}</span><b>${f[0]}</b><small>${f[1]}</small></button>`).join('')}</div>
  <h2 class="sub">ألعاب المشاعر والسلوك</h2>
  <div class="row"><a class="btn" href="#/game/feeling-face" style="text-decoration:none">😀 كيف يشعر؟</a><a class="btn alt" href="#/game/manners" style="text-decoration:none">🙏 ماذا نقول؟</a><a class="btn alt" href="#/game/what-do" style="text-decoration:none">🤝 ماذا نفعل؟</a></div>`;
}
function feelModal(i) {
  const f = FEEL[i];
  const m = modal(`<div class="me">${f[2]}</div><div class="mn">${f[0]}<small>${f[1]}</small></div><p class="fact">${f[3]}</p><button class="btn" data-hear>🔊 استمع</button>`);
  const hear = () => speakParts([[f[0], 'ar-SA'], [f[1], 'en-US'], [f[3], 'ar-SA']]);
  m.querySelector('[data-hear]').addEventListener('click', hear); hear();
}

/* ---------- helpers for custom games ---------- */
function showResult(st, title, text, again) {
  addStars(st); app.onclick = null;
  app.innerHTML = `<div class="result"><h2>${title}</h2><div class="bigstars">${[1, 2, 3].map(n => n <= st ? '⭐' : '<span class="dim">⭐</span>').join('')}</div>
    <p style="font-weight:700;font-size:1.15rem">${text}<br>حصلت على ${st} نجوم!</p>
    <div class="row"><button class="btn ok" data-again>🔁 مرة أخرى</button><a class="btn alt" href="#/games" style="text-decoration:none">🎮 ألعاب أخرى</a></div></div>`;
  sfx.win(); confetti(st >= 2 ? 50 : 25); say('أحسنت يا زين');
  $('[data-again]').addEventListener('click', () => { sfx.tap(); again(); });
}
const topBar = (r, n) => `<div class="qtop"><div class="progress"><i style="width:${r / n * 100}%"></i></div><div class="qn">${Math.min(r + 1, n)}/${n}</div></div>`;
function countdown(sec, tick, end) {
  let s = sec, on = true;
  const run = () => { if (!on) return; tick(s); if (s <= 0) { end(); return; } s--; later(run, 1000); };
  run(); return () => { on = false; };
}

/* ---------- puzzle ---------- */
function puzzleGame() {
  const levels = [[2, 2], [3, 2], [3, 3]]; const pics = ['🐘', '🦁', '🐢', '🦋', '🚀', '🌈', '🐠', '🚗', '🏠', '🐙', '🦄', '🐼'];
  let lv = 0;
  function start() {
    const [cols, rows] = levels[lv]; const n = cols * rows; const pic = pick(pics);
    let arr; do { arr = shuffle([...Array(n).keys()]); } while (arr.every((v, i) => v === i));
    let sel = -1, locked = false;
    const draw = () => {
      app.innerHTML = `<div class="quiz">${topBar(lv, levels.length)}<p class="hint">اضغط قطعتين لتبديل مكانهما وأكمل الصورة! 🧩</p>
        <div class="pzwrap"><div class="pz" style="--cols:${cols};--rows:${rows}" data-order="${arr.join(',')}">
        ${arr.map((id, pos) => `<button class="pzc${sel === pos ? ' sel' : ''}" data-pos="${pos}" data-id="${id}" aria-label="قطعة" style="--c:${id % cols};--r:${Math.floor(id / cols)}"><span>${pic}</span></button>`).join('')}</div>
        <div class="pzprev"><small>الصورة</small><span>${pic}</span></div></div></div>`;
    };
    draw();
    app.onclick = e => {
      const b = e.target.closest('.pzc'); if (!b || locked) return; const pos = +b.dataset.pos; sfx.tap();
      if (sel < 0) sel = pos; else { if (sel !== pos) [arr[sel], arr[pos]] = [arr[pos], arr[sel]]; sel = -1; }
      draw();
      if (arr.every((v, i) => v === i)) {
        locked = true; sfx.ok(); confetti(20); say(pick(PRAISE_AR));
        later(() => { lv++; lv < levels.length ? start() : showResult(3, 'أحسنت يا بطل الألغاز! 🧩', 'أكملت ٣ ألغاز', () => { lv = 0; start(); }); }, 1500);
      }
    };
  }
  start();
}

/* ---------- blocks ---------- */
const BLK = [['#E03131', 'أحمر'], ['#1C7ED6', 'أزرق'], ['#FAB005', 'أصفر'], ['#2F9E44', 'أخضر'], ['#7048E8', 'بنفسجي'], ['#F76707', 'برتقالي']];
function blocksCopy() {
  const lens = [3, 3, 4, 5]; let r = 0;
  function start() {
    const len = lens[r]; const target = Array.from({ length: len }, () => rnd(5)); let mine = [], busy = false;
    const tower = (arr, cls) => `<div class="tw ${cls}">${arr.map(i => `<div class="blk" style="background:${BLK[i][0]}"></div>`).join('')}</div>`;
    const draw = () => {
      app.innerHTML = `<div class="quiz">${topBar(r, lens.length)}<div class="ask">ابنِ برجًا مثل هذا البرج!<small>Build the same tower</small></div>
        <div class="towers" data-target="${target.join(',')}"><div><div class="cap">المطلوب 👀</div>${tower(target, 'small')}</div><div><div class="cap">برجك 🏗️</div>${tower(mine, '')}</div></div>
        <div class="blkpal">${BLK.slice(0, 5).map((b, i) => `<button class="blkbtn" data-i="${i}" style="background:${b[0]}" aria-label="${b[1]}"></button>`).join('')}</div>
        <div class="row" style="margin-top:14px"><button class="btn alt" data-undo style="font-size:1rem;padding:4px 16px">↩️ تراجع</button></div></div>`;
    };
    draw();
    app.onclick = e => {
      if (busy) return;
      if (e.target.closest('[data-undo]')) { mine.pop(); sfx.tap(); draw(); return; }
      const b = e.target.closest('.blkbtn'); if (!b) return; const i = +b.dataset.i;
      if (i !== target[mine.length]) { sfx.bad(); b.classList.add('shake'); toast('ليس هذا اللون، انظر إلى البرج المطلوب 👀'); later(() => b.classList.remove('shake'), 450); return; }
      mine.push(i); sfx.tap(); draw();
      if (mine.length === len) { busy = true; sfx.ok(); confetti(15); say(pick(PRAISE_AR)); later(() => { r++; r < lens.length ? start() : showResult(3, 'مهندس ماهر! 🏗️', 'قلّدت ٤ أبراج', () => { r = 0; start(); }); }, 1500); }
    };
  }
  start();
}
function blocksFree() {
  let tw = [];
  const draw = () => {
    app.innerHTML = `<div class="quiz"><p class="hint">ابنِ أعلى برج تستطيعه! 🏗️ (حتى ١٢ مكعبًا)</p>
      <div class="towers free"><div class="tw" id="tw">${tw.map(t => `<div class="blk" style="background:${t.c};width:${t.w}px;margin-inline-start:${t.dx}px"></div>`).join('')}</div></div>
      <div class="blkpal">${BLK.map((b, i) => `<button class="blkbtn" data-i="${i}" style="background:${b[0]}" aria-label="${b[1]}"></button>`).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn alt" data-undo style="font-size:1rem;padding:4px 16px">↩️ تراجع</button><button class="btn" data-crash>💥 اهدم البرج</button></div>
      <div class="minfo" style="margin-top:10px">ارتفاع البرج: ${tw.length}</div></div>`;
  };
  draw();
  app.onclick = e => {
    if (e.target.closest('[data-undo]')) { tw.pop(); sfx.tap(); draw(); return; }
    if (e.target.closest('[data-crash]')) {
      document.querySelectorAll('#tw .blk').forEach(b => { b.style.transition = 'transform .8s ease-in,opacity .8s'; b.style.transform = `translate(${rnd(240) - 120}px,${200 + rnd(80)}px) rotate(${rnd(180) - 90}deg)`; b.style.opacity = '.2'; });
      tone(120, .5, 'sawtooth', 0, .1); later(() => { if (tw.length >= 8) { addStars(1); toast('برج عالٍ! ⭐ نجمة لك'); } tw = []; draw(); }, 900); return;
    }
    const b = e.target.closest('.blkbtn'); if (!b) return;
    if (tw.length >= 12) { toast('وصل البرج إلى القمة! 🎉'); confetti(20); return; }
    tw.push({ c: BLK[+b.dataset.i][0], w: 70 + rnd(40), dx: rnd(21) - 10 }); sfx.tap(); draw();
    if (tw.length === 12) { addStars(2); sfx.win(); confetti(40); say('ما شاء الله! برج عالٍ جدًا'); }
  };
}

/* ---------- robot (simple coding) ---------- */
const ROBOT_LV = [
  { s: [0, 0], g: [0, 3], o: [] }, { s: [0, 0], g: [2, 2], o: [[1, 1]] },
  { s: [3, 0], g: [0, 3], o: [[2, 0], [1, 2]] }, { s: [0, 0], g: [3, 3], o: [[1, 0], [1, 1], [2, 2]] }
];
const DIRS = { u: [-1, 0, '⬆️'], d: [1, 0, '⬇️'], l: [0, -1, '⬅️'], r: [0, 1, '➡️'] };
function robotGame() {
  let lv = 0;
  function start() {
    const L = ROBOT_LV[lv]; let cmds = [], pos = L.s.slice(), running = false;
    const cells = () => { let h = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const isR = pos[0] === r && pos[1] === c, isG = L.g[0] === r && L.g[1] === c, isO = L.o.some(o => o[0] === r && o[1] === c);
      h += `<div class="rc${isR ? ' rob' : ''}">${isR ? '🤖' : isG ? '⭐' : isO ? '🪨' : ''}</div>`; } return h; };
    const chips = () => cmds.map(c => `<span class="cmd">${DIRS[c][2]}</span>`).join('') || '<span style="color:var(--muted);font-weight:700">اضغط الأسهم لتبني الأوامر</span>';
    app.innerHTML = `<div class="quiz">${topBar(lv, ROBOT_LV.length)}<div class="ask">ساعد الروبوت 🤖 ليصل إلى النجمة ⭐<small>Help the robot reach the star</small></div>
      <div class="rgrid" dir="ltr" id="rg">${cells()}</div><div class="cmds" id="cm">${chips()}</div>
      <div class="pad4"><button class="arrow" data-d="u" style="grid-column:2;grid-row:1" aria-label="أعلى">⬆️</button><button class="arrow" data-d="l" style="grid-column:1;grid-row:2" aria-label="يسار">⬅️</button>
      <button class="arrow" data-d="d" style="grid-column:2;grid-row:2" aria-label="أسفل">⬇️</button><button class="arrow" data-d="r" style="grid-column:3;grid-row:2" aria-label="يمين">➡️</button></div>
      <div class="row"><button class="btn ok" data-run>▶️ شغّل</button><button class="btn alt" data-undo>↩️ تراجع</button><button class="btn alt" data-clear>🗑️ مسح</button></div>
      <div class="feedback" id="fb"></div></div>`;
    const paint = () => { $('#rg').innerHTML = cells(); $('#cm').innerHTML = chips(); };
    const fb = t => { $('#fb').textContent = t; };
    function step(i) {
      if (i >= cmds.length) {
        if (pos[0] === L.g[0] && pos[1] === L.g[1]) { sfx.ok(); addStars(1); confetti(20); fb('وصل الروبوت! أحسنت ⭐'); say('وصل الروبوت! أحسنت'); later(() => { lv++; lv < ROBOT_LV.length ? start() : showResult(3, 'مبرمج ماهر! 🤖', 'أنهيت كل المراحل', () => { lv = 0; start(); }); }, 1700); }
        else { sfx.bad(); fb('لم يصل بعد، عدّل الأوامر وجرّب مرة أخرى'); later(() => { pos = L.s.slice(); running = false; paint(); }, 900); }
        return;
      }
      const d = DIRS[cmds[i]], np = [pos[0] + d[0], pos[1] + d[1]];
      if (np[0] < 0 || np[0] > 3 || np[1] < 0 || np[1] > 3 || L.o.some(o => o[0] === np[0] && o[1] === np[1])) {
        sfx.bad(); fb('اصطدم الروبوت! 🤕 حاول مرة أخرى'); later(() => { pos = L.s.slice(); running = false; paint(); }, 1000); return; }
      pos = np; tone(440 + i * 60, .1); paint(); later(() => step(i + 1), 550);
    }
    app.onclick = e => {
      if (running) return;
      const a = e.target.closest('[data-d]');
      if (a) { if (cmds.length >= 10) { toast('الأوامر كثيرة! أقصى عدد ١٠'); return; } cmds.push(a.dataset.d); sfx.tap(); paint(); return; }
      if (e.target.closest('[data-undo]')) { cmds.pop(); sfx.tap(); paint(); }
      else if (e.target.closest('[data-clear]')) { cmds = []; sfx.tap(); paint(); }
      else if (e.target.closest('[data-run]')) { if (!cmds.length) { toast('اختر الأسهم أولًا 👆'); return; } running = true; pos = L.s.slice(); fb(''); paint(); later(() => step(0), 400); }
    };
  }
  start();
}

/* ---------- ordering game (routines + name letters) ---------- */
const ROUTINES = [
  ['غسل اليدين 🧼', [['🚰', 'نفتح الماء'], ['🧼', 'نضع الصابون'], ['👐', 'نفرك يدينا'], ['🧻', 'نجفف يدينا']]],
  ['تنظيف الأسنان 🪥', [['🪥', 'نضع المعجون على الفرشاة'], ['😁', 'نفرش أسناننا'], ['💧', 'نشطف فمنا بالماء']]],
  ['ترتيب الألعاب 🧸', [['🧸', 'نلعب بالألعاب'], ['🧺', 'نجمعها في السلة'], ['📦', 'نضعها في مكانها']]],
  ['كيف تنمو النبتة 🌱', [['🌰', 'نزرع البذرة'], ['💧', 'نسقيها الماء'], ['🌱', 'تخرج نبتة صغيرة'], ['🌳', 'تكبر وتصبح شجرة']]],
  ['نبدأ يومنا ☀️', [['🛏️', 'نستيقظ'], ['🪥', 'ننظف أسناننا'], ['🥣', 'نأكل الفطور'], ['🎒', 'نذهب إلى المدرسة']]],
  ['نعبر الطريق 🚦', [['🛑', 'نقف عند الرصيف'], ['👀', 'ننظر يمينًا ويسارًا'], ['🤝', 'نمسك يد شخص كبير'], ['🚶', 'نعبر بهدوء']]]
];
function orderGame(rounds) {
  let r = 0;
  function start() {
    const R = rounds[r]; const items = shuffle(R.items.map((it, i) => ({ it, i }))); let next = 0, busy = false;
    app.innerHTML = `<div class="quiz">${topBar(r, rounds.length)}<div class="ask" dir="auto">${R.title}<small dir="auto">${R.sub || 'اضغط الخطوات بالترتيب الصحيح'}</small></div>
      <div class="ord">${items.map(o => `<button class="ordc${R.letters ? ' lt' : ''}" data-i="${o.i}"><span class="ordn"></span><span class="ordem">${o.it[0]}</span><span class="ordt" ${R.en ? 'style="font-family:var(--f-en)"' : ''}>${o.it[1]}</span></button>`).join('')}</div>
      <div class="feedback"></div></div>`;
    app.onclick = e => {
      const b = e.target.closest('.ordc'); if (!b || busy || b.classList.contains('done')) return;
      if (+b.dataset.i === next) {
        b.classList.add('done'); b.querySelector('.ordn').textContent = R.en ? next + 1 : arDigits(next + 1); sfx.tap(); say(R.items[next][1], R.en ? 'en-US' : 'ar-SA'); next++;
        if (next === R.items.length) { busy = true; later(() => { sfx.ok(); confetti(15); addStars(1); $('.feedback').textContent = pick(PRAISE_AR) + ' ⭐'; }, 700); later(() => { r++; r < rounds.length ? start() : showResult(3, 'أحسنت يا منظّم! 🌟', 'رتّبت كل الخطوات', () => { r = 0; start(); }); }, 2200); }
      } else { sfx.bad(); b.classList.add('wrong'); later(() => b.classList.remove('wrong'), 450); $('.feedback').textContent = 'فكّر.. ماذا يأتي أولًا؟ 🤔'; }
    };
  }
  start();
}
const stepsGame = () => orderGame(sample(ROUTINES, 3).map(([t, items]) => ({ title: t, items })));
const nameOrderGame = () => orderGame([
  { title: 'رتّب حروف اسمك: زين', sub: 'ز ← ي ← ن', letters: true, items: [['', 'ز'], ['', 'ي'], ['', 'ن']] },
  { title: 'Spell your name: ZAIN', sub: 'Z → A → I → N', letters: true, en: true, items: [['', 'Z'], ['', 'A'], ['', 'I'], ['', 'N']] }
]);

/* ---------- catch (attention) ---------- */
function catchGame() {
  let score = 0, t = 30, over = false;
  app.innerHTML = `<div class="quiz"><p class="hint">المس النجمة ⭐ والفراشة 🦋 فقط! تجنّب القنبلة 💣 والعقرب 🦂</p>
    <div class="catchbar"><span id="ct">⏱️ 30</span><span id="cs">⭐ 0</span></div><div class="field" id="field"></div></div>`;
  const field = $('#field');
  const good = ['⭐', '🦋', '🌟'], bad = ['💣', '🦂', '🕷️'];
  function spawn() {
    if (over) return;
    const isGood = Math.random() < .7, b = document.createElement('button'); b.className = 'tg'; b.textContent = pick(isGood ? good : bad);
    b.dataset.good = isGood ? '1' : '0'; b.setAttribute('aria-label', isGood ? 'جيد' : 'خطر');
    b.style.left = (5 + rnd(80)) + '%'; b.style.top = (5 + rnd(75)) + '%'; field.appendChild(b);
    later(() => b.remove(), 1500); later(spawn, 800);
  }
  field.addEventListener('click', e => {
    const b = e.target.closest('.tg'); if (!b) return;
    if (b.dataset.good === '1') { score++; sfx.ok(); } else { score = Math.max(0, score - 1); sfx.bad(); }
    $('#cs').textContent = '⭐ ' + score; b.remove();
  });
  const tick = () => {
    if (t <= 0) { over = true; const st = score >= 14 ? 3 : score >= 8 ? 2 : 1; showResult(st, 'انتهى الوقت! ⏱️', `لمست ${score} نجمة وفراشة`, catchGame); return; }
    $('#ct').textContent = '⏱️ ' + t; t--; later(tick, 1000);
  };
  tick(); spawn();
}

/* ---------- movement page ---------- */
const ACTS = [['🦘', 'اقفز ٣ مرات'], ['👏', 'صفّق بيديك'], ['🔄', 'دُر حول نفسك'], ['🙆', 'المس رأسك'], ['🐰', 'تحرك مثل الأرنب'], ['🐘', 'امشِ مثل الفيل'],
  ['🧘', 'اجلس ثم قف'], ['🙌', 'ارفع يديك للأعلى'], ['🏃', 'اركض في مكانك'], ['🦆', 'تمايل مثل البطة'], ['🐸', 'اقفز مثل الضفدع'], ['🤸', 'تمدّد وارفع يديك']];
const HUNT = [['🔴', 'ابحث عن شيء أحمر'], ['🔵', 'ابحث عن شيء أزرق'], ['🟢', 'ابحث عن شيء أخضر'], ['🟡', 'ابحث عن شيء أصفر'],
  ['⚪', 'ابحث عن شيء مستدير'], ['🧸', 'ابحث عن شيء ناعم'], ['📏', 'ابحث عن شيء طويل'], ['🔷', 'ابحث عن شيء على شكل مربع']];
function pageMove(w) {
  if (w === 'simon') return simonGame();
  if (w === 'freeze') return freezeGame();
  if (w === 'hunt') return huntGame();
  chrome('ألعاب الحركة', '#/', 'move');
  const T = [['#/move/simon', '🦘', 'سيمون يقول', 'قلّد الحركة'], ['#/move/freeze', '🧊', 'قف وتحرّك', 'تحرّك ثم تجمّد'], ['#/move/hunt', '🔍', 'ابحث عن شيء', 'مستكشف البيت'], ['#/game/catch', '⭐', 'التقط النجوم', 'سرعة وانتباه']];
  app.innerHTML = `<p class="hint">حان وقت الحركة! 🏃 ابتعد قليلًا عن الأثاث قبل أن تلعب</p>
    <div class="tiles">${T.map(([h, g, n, s], i) => `<a class="tile" href="${h}" style="--c:${KC[(i + 3) % 6]};--c2:#fff;--c3:${KC[(i + 3) % 6]}33"><span class="tglyph emo">${g}</span><span class="tname">${n}</span><span class="tsub">${s}</span></a>`).join('')}</div>`;
}
function simonGame() {
  chrome('سيمون يقول', '#/move', 'move');
  let done = 0, cancel = () => {}; const GOAL = 5;
  function next() {
    cancel(); const a = pick(ACTS);
    app.innerHTML = `<div class="quiz"><div class="qtop"><div class="progress"><i style="width:${done / GOAL * 100}%"></i></div><div class="qn" >${done}/${GOAL}</div></div>
      <div class="ask">سيمون يقول…<small>Simon says</small></div><div class="stimulus"><div class="bigemoji">${a[0]}</div><div class="bigword">${a[1]}</div></div>
      <div class="ring" id="ring">5</div><div class="row"><button class="btn ok" data-ok>✅ فعلتها!</button><button class="btn alt" data-skip>⏭️ تغيير</button></div></div>`;
    say('سيمون يقول: ' + a[1]);
    cancel = countdown(5, s => { const r = $('#ring'); if (r) r.textContent = s > 0 ? s : '🎉'; }, () => {});
    app.onclick = e => {
      if (e.target.closest('[data-ok]')) { cancel(); sfx.ok(); done++; confetti(10); if (done >= GOAL) return showResult(2, 'نشاط رائع يا بطل! 🦘', 'قلّدت ٥ حركات', () => { done = 0; next(); }); later(next, 300); }
      else if (e.target.closest('[data-skip]')) { sfx.tap(); next(); }
    };
  }
  next();
}
function freezeGame() {
  chrome('قف وتحرّك', '#/move', 'move');
  let cyc = 0; const N = 5;
  app.innerHTML = `<div class="quiz">${topBar(0, N)}<div class="fz" id="fz"></div><p class="hint" style="margin-top:14px">عندما تسمع «تحرّك» اتحرّك، وعندما تسمع «قف» تجمّد مكانك! 🧊</p></div>`;
  const card = (bg, e, t) => { const f = $('#fz'); if (!f) return; f.style.background = bg; f.innerHTML = `<div class="bigemoji">${e}</div><div class="bigword">${t}</div>`; };
  function go() {
    const a = pick(ACTS); card('#2F9E44', a[0], 'تحرّك! ' + a[1]); say('تحرّك! ' + a[1]); [523, 659, 784].forEach((f, i) => tone(f, .15, 'triangle', i * .08));
    later(stop, 5000 + rnd(3000));
  }
  function stop() {
    card('#E03131', '🧊', 'قف! تجمّد!'); say('قف! تجمّد!'); tone(200, .4, 'square', 0, .08);
    later(() => { cyc++; document.querySelector('.progress i').style.width = (cyc / N * 100) + '%'; if (cyc >= N) showResult(2, 'أنت بطل التجمّد! 🧊', 'أكملت ٥ جولات', freezeGame); else go(); }, 3000);
  }
  card('#868E96', '🎵', 'استعد…'); say('استعد'); later(go, 1500);
}
function huntGame() {
  chrome('ابحث عن شيء', '#/move', 'move');
  const rs = sample(HUNT, 4); let i = 0, found = 0, cancel = () => {};
  function next() {
    cancel(); if (i >= rs.length) { const st = found >= 3 ? 3 : found >= 2 ? 2 : 1; return showResult(st, 'أنت مستكشف ماهر! 🔍', `وجدت ${found} من ${rs.length}`, huntGame); }
    const a = rs[i];
    app.innerHTML = `<div class="quiz">${topBar(i, rs.length)}<div class="ask">مهمة المستكشف<small>Treasure hunt</small></div><div class="stimulus"><div class="bigemoji">${a[0]}</div><div class="bigword">${a[1]}</div></div>
      <div class="ring" id="ring">30</div><div class="row"><button class="btn ok" data-ok>🎉 وجدته!</button><button class="btn alt" data-skip>⏭️ تخطَّ</button></div></div>`;
    say(a[1]); cancel = countdown(30, s => { const r = $('#ring'); if (r) r.textContent = s; }, () => { sfx.bad(); i++; next(); });
    app.onclick = e => {
      if (e.target.closest('[data-ok]')) { cancel(); found++; sfx.ok(); confetti(15); say(pick(PRAISE_AR)); i++; later(next, 900); }
      else if (e.target.closest('[data-skip]')) { cancel(); sfx.tap(); i++; next(); }
    };
  }
  next();
}

/* ---------- stories + name ---------- */
const qs = (ask, right, wrongs) => ({ lang: 'ar', ask, sub: '', stim: '', say: [ask, 'ar-SA'], optCls: 'txt', cls: wrongs.length === 1 ? 'two' : '', opts: [{ ok: true, h: right }, ...wrongs.map(w => ({ ok: false, h: w }))] });
const STORIES = [
  { t: 'الأرنب والجزرة', e: '🐰🥕', lines: ['كان هناك أرنب صغير اسمه نونو.', 'خرج نونو من بيته في الصباح.', 'وجد جزرة كبيرة في الحديقة.', 'أكل نونو الجزرة وكان سعيدًا جدًا.'],
    q: [qs('ما اسم الأرنب؟', 'نونو', ['ريما', 'سامي']), qs('ماذا وجد الأرنب في الحديقة؟', '🥕 جزرة', ['🍌 موزة', '🍎 تفاحة']), qs('كيف شعر الأرنب في النهاية؟', '😀 سعيد', ['😢 حزين', '😠 غاضب'])] },
  { t: 'القطة والمطر', e: '🐱🌧️', lines: ['نظرت القطة ميمي من النافذة.', 'كانت السماء غائمة ثم بدأ المطر.', 'أخذت ميمي المظلة وخرجت إلى الحديقة.', 'قفزت في الماء وضحكت كثيرًا.'],
    q: [qs('كيف كان الطقس؟', '🌧️ ممطر', ['☀️ مشمس', '❄️ بارد جدًا']), qs('ماذا أخذت ميمي معها؟', '☂️ مظلة', ['⚽ كرة', '👒 قبعة']), qs('ماذا فعلت ميمي في الماء؟', 'قفزت وضحكت', ['نامت', 'بكت'])] },
  { t: 'زين وصديقه', e: '🧒⚽', lines: ['عند زين كرة حمراء.', 'جاء صديقه سامي وقال: هل ألعب معك؟', 'ابتسم زين وقال: نعم، لنلعب معًا!', 'لعبا معًا وكانا سعيدين.'],
    q: [qs('ما لون الكرة؟', '🔴 حمراء', ['🔵 زرقاء', '🟡 صفراء']), qs('ماذا فعل زين عندما جاء صديقه؟', 'شاركه الكرة', ['أخذ الكرة وهرب', 'لم يرد عليه']), qs('ما اسم صديق زين؟', 'سامي', ['نونو', 'ميمي'])] }
];
function pageStories() {
  chrome('حكايات واسمي', '#/', 'stories');
  app.innerHTML = `<p class="hint">استمع للحكاية ثم أجب عن الأسئلة 📖</p>
    <div class="tiles"><a class="tile" href="#/name" style="--c:#F2B53C;--c2:#fff;--c3:#F8DB98"><span class="tglyph emo">✍️</span><span class="tname">اسمي زين</span><span class="tsub">My name</span></a>
    ${STORIES.map((s, i) => `<a class="tile" href="#/story/${i}" style="--c:${KC[i]};--c2:#fff;--c3:${KC[i]}33"><span class="tglyph emo" style="font-size:2.4rem">${s.e}</span><span class="tname">${s.t}</span><span class="tsub">حكاية ${arDigits(i + 1)}</span></a>`).join('')}</div>`;
}
function pageStory(i) {
  const s = STORIES[i]; if (!s) return pageStories();
  chrome(s.t, '#/stories', 'stories'); app.dataset.story = i;
  app.innerHTML = `<div class="story"><div class="se">${s.e}</div><h2 class="sub" style="margin-top:6px">${s.t}</h2>${s.lines.map(l => `<p>${l}</p>`).join('')}
    <div class="row" style="margin-top:12px"><button class="btn" data-act="story-hear">🔊 اسمع الحكاية</button><a class="btn ok" href="#/game/story-${i}" style="text-decoration:none">❓ الأسئلة</a></div></div>`;
}
function pageName() {
  chrome('اسمي', '#/stories', 'stories');
  const en = 'ZAIN'.split('');
  app.innerHTML = `<p class="hint">هذا اسمي! 😊</p><div class="detail"><div class="dcard"><div class="nm" id="nmar">زين</div>
    <div class="nmen" dir="ltr">${en.map((c, i) => `<button data-act="nmL" data-c="${c}" style="--k:${KC[i]}">${c}</button>`).join('')}</div>
    <div class="row" style="margin-top:18px"><button class="btn" data-act="nmHear">🔊 استمع</button><button class="btn alt" data-act="nmTraceAr">✏️ اكتب «زين»</button><button class="btn alt" data-act="nmTraceEn">✏️ Write ZAIN</button><a class="btn ok" href="#/game/name" style="text-decoration:none">🔤 رتّب الحروف</a></div></div></div>`;
}
function traceText(ch, L, cls) {
  const m = modal(`<div class="mn" style="font-size:1.6rem">${L ? 'Trace it with your finger!' : 'اكتب فوق الشكل بإصبعك!'}</div>
    <div class="stage"><div class="ghost ${L ? 'en' : ''} ${cls || ''}">${ch}</div><canvas class="pad" aria-label="مساحة الكتابة"></canvas></div>${toolsHTML()}`);
  bindPad(m, m.querySelector('canvas'));
}

/* ---------- more quiz generators ---------- */
const optTxt = (ar, en) => `<span style="font-size:1.6rem">${ar}</span>${en ? `<small>${en}</small>` : ''}`;
function shapeGen() {
  const t = rnd(6), s = SHAPES[t];
  if (Math.random() < .5) {
    const ids = [t, ...sample([0, 1, 2, 3, 4, 5].filter(x => x !== t), 2)];
    return { lang: 'ar', ask: `أين ال${s[1]}؟`, sub: `Where is the ${s[2].toLowerCase()}?`, stim: `<div class="bigword">${s[1]} · <span class="en">${s[2]}</span></div>`, say: [s[1], 'ar-SA'],
      opts: ids.map(x => ({ ok: x === t, h: shapeSVG(SHAPES[x][0], SHCOL[x], 78), aria: SHAPES[x][1] })) };
  }
  const names = [t, ...sample([0, 1, 2, 3, 4, 5].filter(x => x !== t), 2)];
  return { lang: 'ar', ask: 'ما اسم هذا الشكل؟', sub: 'What is this shape?', stim: shapeSVG(s[0], SHCOL[t], 110), say: ['ما اسم هذا الشكل؟', 'ar-SA'], optCls: 'txt',
    opts: names.map(x => ({ ok: x === t, h: `${SHAPES[x][1]}<small>${SHAPES[x][2]}</small>` })) };
}
function sortColorGen() {
  const k = rnd(6), cs = sample(COLORS.slice(0, 6), 2), c = cs[0];
  return { lang: 'ar', ask: 'ضع الشكل في السلة التي لها نفس لونه', sub: 'Put it in the matching basket', stim: shapeSVG(SHAPES[k][0], c.hex, 100), say: ['ضع الشكل في السلة المناسبة', 'ar-SA'], cls: 'two',
    opts: cs.map(x => ({ ok: x === c, h: `<span style="font-size:3rem">🧺</span><span class="swatch" style="background:${x.hex};width:46px;height:46px"></span>`, aria: x.ar })) };
}
function compareGen() {
  const type = pick(['size', 'long', 'more']);
  if (type === 'size') {
    const e = pick(['🐘', '🍎', '🐶', '⚽', '🌳', '🚗']), big = Math.random() < .5;
    return { lang: 'ar', ask: big ? 'اختر الأكبر' : 'اختر الأصغر', sub: big ? 'Pick the BIGGER one' : 'Pick the SMALLER one', say: [big ? 'اختر الأكبر' : 'اختر الأصغر', 'ar-SA'], cls: 'two',
      opts: [{ ok: big, h: `<span style="font-size:5.2rem;line-height:1.1">${e}</span>` }, { ok: !big, h: `<span style="font-size:2rem;line-height:1.1">${e}</span>` }] };
  }
  if (type === 'long') {
    const tall = Math.random() < .5, c = pick(BLK)[0], bar = h => `<span style="display:block;width:30px;height:${h}px;background:${c};border:3px solid #1F2A44;border-radius:10px"></span>`;
    return { lang: 'ar', ask: tall ? 'أيهما الأطول؟' : 'أيهما الأقصر؟', sub: tall ? 'Which is TALLER?' : 'Which is SHORTER?', say: [tall ? 'أيهما الأطول' : 'أيهما الأقصر', 'ar-SA'], cls: 'two',
      opts: [{ ok: tall, h: bar(96) }, { ok: !tall, h: bar(44) }] };
  }
  const more = Math.random() < .5, e = pick(['🍎', '⭐', '🐥', '🎈', '🍓']); const a = 1 + rnd(6); let b = 1 + rnd(6); if (b === a) b = a === 6 ? 5 : a + 1;
  const grp = n => `<span class="many" style="font-size:1.6rem;gap:2px">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span>`;
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return { lang: 'ar', ask: more ? 'أيهما أكثر؟' : 'أيهما أقل؟', sub: more ? 'Which has MORE?' : 'Which has FEWER?', say: [more ? 'أيهما أكثر' : 'أيهما أقل', 'ar-SA'], cls: 'two',
    opts: [{ ok: more ? a === hi : a === lo, h: grp(a) }, { ok: more ? b === hi : b === lo, h: grp(b) }] };
}
const POS = [['فوق', 'On top', [80, 70], [96, 8]], ['تحت', 'Under', [80, 6], [96, 100]], ['داخل', 'Inside', [80, 50], [102, 80]], ['خارج', 'Outside', [8, 60], [160, 72]]];
function positionGen() {
  const t = rnd(4), a = pick([['🐰', 'الأرنب'], ['🐱', 'القطة'], ['🐶', 'الكلب'], ['🐥', 'الكتكوت']]), P = POS[t];
  const stim = `<div class="scene"><span style="left:${P[2][0]}px;top:${P[2][1]}px;font-size:5rem;z-index:1">📦</span><span style="left:${P[3][0]}px;top:${P[3][1]}px;font-size:${t === 2 ? '2.2rem' : '3rem'};z-index:2">${a[0]}</span></div>`;
  const ids = [t, ...sample([0, 1, 2, 3].filter(x => x !== t), 2)];
  return { lang: 'ar', ask: `أين ${a[1]} بالنسبة للصندوق؟`, sub: 'Where is it?', stim, say: [`أين ${a[1]}`, 'ar-SA'], optCls: 'txt', opts: ids.map(x => ({ ok: x === t, h: optTxt(POS[x][0], POS[x][1]) })) };
}
function patternColorGen() {
  const set = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'], ty = pick(['AB', 'ABB', 'ABC']), [a, b, c] = sample(set, 3);
  const base = ty === 'AB' ? [a, b] : ty === 'ABB' ? [a, b, b] : [a, b, c]; const seq = Array.from({ length: 7 }, (_, k) => base[k % base.length]);
  const hide = 5 + rnd(2); const ans = seq[hide];
  const cells = seq.slice(0, hide + 1).map((x, k) => k === hide ? `<span class="slot" style="border-radius:16px;display:inline-block;width:50px;height:50px"></span>` : `<span>${x}</span>`).join('');
  const others = sample(set.filter(x => x !== ans), 2);
  return { lang: 'ar', ask: 'ما الذي يأتي بعد ذلك؟', sub: 'What comes next?', stim: `<div class="many" dir="ltr" style="align-items:center;font-size:2.4rem">${cells}</div>`, opts: [ans, ...others].map(x => ({ ok: x === ans, h: `<span>${x}</span>` })) };
}
function animalPlantGen() {
  const isA = Math.random() < .5, it = isA ? pick(SCI.animals.items) : pick([['شجرة', 'Tree', '🌳'], ['زهرة', 'Flower', '🌸'], ['نبتة', 'Plant', '🌱'], ['صبّار', 'Cactus', '🌵'], ['عشب', 'Grass', '🌿']]);
  return { lang: 'ar', ask: 'هل هذا حيوان أم نبات؟', sub: 'Animal or plant?', stim: `<div class="bigemoji">${it[2]}</div><div class="bigword">${it[0]}</div>`, say: [it[0], 'ar-SA'], cls: 'two',
    opts: [{ ok: isA, h: `<span style="font-size:3rem">🐾</span><span style="font-size:1.5rem">حيوان</span><small>Animal</small>` }, { ok: !isA, h: `<span style="font-size:3rem">🌿</span><span style="font-size:1.5rem">نبات</span><small>Plant</small>` }] };
}
function sinkFloatGen() {
  const it = pick([['قارب', '⛵', 1], ['ورقة شجر', '🍃', 1], ['كرة', '⚽', 1], ['بطة مطاطية', '🦆', 1], ['حجر', '🪨', 0], ['مفتاح', '🔑', 0], ['عملة معدنية', '🪙', 0], ['ملعقة معدنية', '🥄', 0]]);
  return { lang: 'ar', ask: 'هل يطفو أم يغرق في الماء؟', sub: 'Does it float or sink?', stim: `<div class="bigemoji">${it[1]}</div><div class="bigword">${it[0]}</div>`, say: [`هل ${it[0]} يطفو أم يغرق`, 'ar-SA'], cls: 'two',
    opts: [{ ok: !!it[2], h: `<span style="font-size:2.8rem">🌊</span><span style="font-size:1.5rem">يطفو</span><small>Floats</small>` }, { ok: !it[2], h: `<span style="font-size:2.8rem">🫧</span><span style="font-size:1.5rem">يغرق</span><small>Sinks</small>` }] };
}
function weatherWearGen() {
  const W = [['ممطر 🌧️', '☂️', 'مظلة', ['🧤', '🩴']], ['مشمس ☀️', '👒', 'قبعة', ['🧤', '🧣']], ['بارد ❄️', '🧥', 'معطف', ['🩳', '🩴']], ['حار 🥵', '🩳', 'ملابس خفيفة', ['🧥', '🧣']]];
  const w = pick(W); const all = [w[1], ...w[3]];
  return { lang: 'ar', ask: `الجو ${w[0]} ماذا نلبس أو نأخذ؟`, sub: 'What do we wear or take?', say: [`الجو ${w[0].split(' ')[0]}، ماذا نلبس`, 'ar-SA'], opts: all.map(x => ({ ok: x === w[1], h: `<span>${x}</span>` })) };
}
function bodyGen() {
  const P = [['نرى', '👁️', 'العين', 'Eye'], ['نسمع', '👂', 'الأذن', 'Ear'], ['نشمّ', '👃', 'الأنف', 'Nose'], ['نتكلم ونأكل', '👄', 'الفم', 'Mouth'], ['نمسك الأشياء', '✋', 'اليد', 'Hand'], ['نمشي ونجري', '🦶', 'القدم', 'Foot']];
  const t = pick(P), others = sample(P.filter(x => x !== t), 2);
  return { lang: 'ar', ask: `بماذا ${t[0]}؟`, sub: 'Which body part?', say: [`بماذا ${t[0]}`, 'ar-SA'], opts: [t, ...others].map(x => ({ ok: x === t, h: `<span>${x[1]}</span><small>${x[2]}</small>` })) };
}
function plantNeedGen() {
  const good = pick([['💧', 'ماء'], ['☀️', 'ضوء الشمس'], ['💨', 'هواء']]), bad = sample([['🍫', 'شوكولاتة'], ['🧸', 'دمية'], ['📱', 'هاتف'], ['🍟', 'بطاطس مقلية']], 2);
  return { lang: 'ar', ask: 'ماذا يحتاج النبات ليعيش ويكبر؟', sub: 'What does a plant need?', stim: '<div class="bigemoji">🌱</div>', say: ['ماذا يحتاج النبات ليعيش ويكبر', 'ar-SA'],
    opts: [good, ...bad].map(x => ({ ok: x === good, h: `<span>${x[0]}</span><small>${x[1]}</small>` })) };
}
function feelingGen() {
  const S = [['حصل زين على هدية جميلة', 0], ['انكسرت لعبة زين المفضلة', 1], ['أخذ صديقه لعبته بدون إذن', 2], ['سمع زين صوت رعد قويًا', 3], ['وجد زين مفاجأة في حقيبته', 4], ['لعب زين طوال اليوم', 5], ['عانق زين أمه', 6]];
  const s = pick(S), ids = [s[1], ...sample([0, 1, 2, 3, 4, 5, 6].filter(x => x !== s[1]), 2)];
  return { lang: 'ar', ask: 'كيف يشعر زين؟', sub: 'How does Zain feel?', stim: `<div class="bigword" style="font-size:1.6rem;line-height:1.5">${s[0]}</div>`, say: [s[0], 'ar-SA'], opts: ids.map(x => ({ ok: x === s[1], h: `<span>${FEEL[x][2]}</span><small>${FEEL[x][0]}</small>` })) };
}
function mannersGen() {
  const S = [['أخذنا هدية من صديقنا', 'شكرًا'], ['نريد أن نطلب شيئًا', 'من فضلك'], ['وقعنا على صديقنا بالخطأ', 'آسف'], ['قابلنا جارنا', 'السلام عليكم'], ['صديقنا ساعدنا', 'شكرًا'], ['نريد أن نمرّ من أمام شخص', 'بعد إذنك']];
  const POOL = ['شكرًا', 'من فضلك', 'آسف', 'السلام عليكم', 'بعد إذنك'], s = pick(S);
  return { lang: 'ar', ask: 'ماذا نقول؟', sub: '', stim: `<div class="bigword" style="font-size:1.6rem;line-height:1.5">${s[0]}</div>`, say: [s[0] + '، ماذا نقول', 'ar-SA'], optCls: 'txt',
    opts: [s[1], ...sample(POOL.filter(x => x !== s[1]), 2)].map(x => ({ ok: x === s[1], h: x })) };
}
function whatDoGen() {
  const S = [['صديقك يريد اللعب بلعبتك', 'نشاركه اللعبة', 'نصرخ عليه'], ['هناك طابور للعب', 'ننتظر دورنا', 'ندفع الأطفال'], ['أنت غاضب', 'نتكلم ونطلب المساعدة', 'نضرب أحدًا'],
    ['صديقك حزين', 'نواسيه ونسأله', 'نضحك عليه'], ['وقعت لعبة صديقك', 'نساعده', 'نتركها ونذهب'], ['سنعبر الطريق', 'نمسك يد شخص كبير', 'نركض وحدنا'], ['شخص غريب يعطيك حلوى', 'نقول لا ونخبر أمي وأبي', 'نأخذها']];
  const s = pick(S);
  return { lang: 'ar', ask: 'ماذا نفعل؟', sub: '', stim: `<div class="bigword" style="font-size:1.6rem;line-height:1.5">${s[0]}</div>`, say: [s[0] + '، ماذا نفعل', 'ar-SA'], cls: 'two', optCls: 'txt', opts: [{ ok: true, h: s[1] }, { ok: false, h: s[2] }] };
}

/* ---------- games catalogue ---------- */
const storyGames = STORIES.map((s, i) => ({ id: 'story-' + i, hide: true, back: '#/story/' + i, theme: 'stories', t: 'أسئلة: ' + s.t, rounds: s.q.length, gen: (() => { let k = 0; return () => s.q[k++ % s.q.length]; })() }));
const GAMES = [
  { cat: '🧩 ألغاز وبناء', id: 'puzzle', t: 'الأحجية', g: '🧩', emo: 1, run: puzzleGame },
  { cat: '🧩 ألغاز وبناء', id: 'blocks-copy', t: 'قلّد البرج', g: '🏗️', emo: 1, run: blocksCopy },
  { cat: '🧩 ألغاز وبناء', id: 'blocks-free', t: 'ابنِ برجك', g: '🧱', emo: 1, run: blocksFree },
  { cat: '🧠 ذاكرة وانتباه', id: 'memory', t: 'لعبة الذاكرة', g: '🧠', emo: 1, run: memoryGame },
  { cat: '🧠 ذاكرة وانتباه', id: 'catch', t: 'التقط النجوم', g: '⭐', emo: 1, run: catchGame },
  { cat: '🔷 تصنيف وأنماط', id: 'pattern', t: 'أكمل نمط الأرقام', g: '🧩', emo: 1, gen: patternGen },
  { cat: '🔷 تصنيف وأنماط', id: 'pattern-color', t: 'أكمل نمط الألوان', g: '🔴🔵', emo: 1, gen: patternColorGen },
  { cat: '🔷 تصنيف وأنماط', id: 'sort-color', t: 'صنّف الأشكال', g: '🧺', emo: 1, gen: sortColorGen },
  { cat: '🔷 تصنيف وأنماط', id: 'shape-pick', t: 'الأشكال', g: '🔺', emo: 1, gen: shapeGen },
  { cat: '🔷 تصنيف وأنماط', id: 'compare', t: 'أكبر وأصغر وأكثر', g: '⚖️', emo: 1, gen: compareGen },
  { cat: '🔷 تصنيف وأنماط', id: 'position', t: 'فوق وتحت وداخل', g: '📦', emo: 1, gen: positionGen },
  { cat: '🤖 تفكير وبرمجة', id: 'robot', t: 'الروبوت الذكي', g: '🤖', emo: 1, run: robotGame },
  { cat: '🤖 تفكير وبرمجة', id: 'steps', t: 'رتّب الخطوات', g: '🔢', emo: 1, run: stepsGame },
  { cat: '🔤 الحروف', id: 'ar-easy', t: 'أي حرف؟ (أ ب ت)', g: 'أ', gen: () => letterGen('ar', AR.slice(0, 3)) },
  { cat: '🔤 الحروف', id: 'ar-all', t: 'أي حرف؟ (كل الحروف)', g: 'ب', gen: () => letterGen('ar', AR) },
  { cat: '🔤 الحروف', id: 'en-easy', t: 'Which letter? A B C', g: 'A', en: 1, gen: () => letterGen('en', EN.slice(0, 3)) },
  { cat: '🔤 الحروف', id: 'en-all', t: 'Which letter? A to Z', g: 'Z', en: 1, gen: () => letterGen('en', EN) },
  { cat: '🔤 الحروف', id: 'name', t: 'رتّب حروف اسمي', g: '✍️', emo: 1, run: nameOrderGame },
  { cat: '🔢 الأعداد', id: 'count-ar', t: 'كم العدد؟ (١ إلى ٥)', g: '٣', gen: () => countGen('ar') },
  { cat: '🔢 الأعداد', id: 'count-en', t: 'How many? 0 to 10', g: '7', en: 1, gen: () => countGen('en') },
  { cat: '🔢 الأعداد', id: 'balloons', t: 'فرقع البالونة', g: '🎈', emo: 1, gen: balloonGen },
  { cat: '🎨 ألوان وعلوم', id: 'color-pick', t: 'اختر اللون', g: '🎨', emo: 1, gen: colorPickGen },
  { cat: '🎨 ألوان وعلوم', id: 'color-fruit', t: 'ما لون هذا؟', g: '🍌', emo: 1, gen: colorFruitGen },
  { cat: '🎨 ألوان وعلوم', id: 'fruit-veg', t: 'فاكهة أم خضار؟', g: '🥕', emo: 1, gen: fruitVegGen },
  { cat: '🎨 ألوان وعلوم', id: 'animal-plant', t: 'حيوان أم نبات؟', g: '🐾', emo: 1, gen: animalPlantGen },
  { cat: '🎨 ألوان وعلوم', id: 'body', t: 'أجزاء جسمي', g: '🧍', emo: 1, gen: bodyGen },
  { cat: '🎨 ألوان وعلوم', id: 'weather-wear', t: 'ماذا نلبس؟', g: '☂️', emo: 1, gen: weatherWearGen },
  { cat: '🎨 ألوان وعلوم', id: 'sink-float', t: 'يطفو أم يغرق؟', g: '🌊', emo: 1, gen: sinkFloatGen },
  { cat: '🎨 ألوان وعلوم', id: 'plant-needs', t: 'ماذا يحتاج النبات؟', g: '🌱', emo: 1, gen: plantNeedGen },
  { cat: '💛 مشاعر وسلوك', id: 'feeling-face', t: 'كيف يشعر؟', g: '😀', emo: 1, gen: feelingGen },
  { cat: '💛 مشاعر وسلوك', id: 'manners', t: 'ماذا نقول؟', g: '🙏', emo: 1, gen: mannersGen },
  { cat: '💛 مشاعر وسلوك', id: 'what-do', t: 'ماذا نفعل؟', g: '🤝', emo: 1, gen: whatDoGen },
  ...storyGames
];
const PRAISE_AR = ['أحسنت!', 'ممتاز!', 'برافو يا زين!', 'رائع!', 'عمل جميل!'];
const PRAISE_EN = ['Great job!', 'Well done!', 'Excellent!', 'Awesome!'];

function pageGames() {
  chrome('ألعاب وأنشطة', '#/', 'games');
  const cats = [...new Set(GAMES.filter(g => !g.hide).map(g => g.cat))]; let n = 0;
  const tile = g => `<a class="tile" href="#/game/${g.id}" style="--c:${KC[n % 6]};--c2:#fff;--c3:${KC[n++ % 6]}33"><span class="tglyph ${g.en ? 'en' : ''} ${g.emo ? 'emo' : ''}">${g.g}</span><span class="tname" dir="auto" style="font-size:1.05rem">${g.t}</span></a>`;
  app.innerHTML = `<p class="hint">اختر لعبة واجمع النجوم! ⭐</p>
    ${cats.map(c => `<h2 class="sub">${c}</h2><div class="tiles sm">${GAMES.filter(g => g.cat === c && !g.hide).map(tile).join('')}</div>`).join('')}
    <h2 class="sub">🏃 حركة ونشاط</h2><div class="tiles sm"><a class="tile" href="#/move" style="${thStyle('move')}"><span class="tglyph emo">🏃</span><span class="tname" style="font-size:1.05rem">ألعاب الحركة</span></a>
    <a class="tile" href="#/draw" style="${thStyle('draw')}"><span class="tglyph emo">🖍️</span><span class="tname" style="font-size:1.05rem">ارسم وتلوّن</span></a></div>`;
}
function pageGame(id) {
  const g = GAMES.find(x => x.id === id);
  if (!g) return pageGames();
  chrome(g.t, g.back || '#/games', g.theme || 'games');
  if (g.run) return g.run(g);
  runQuiz(g);
}

function runQuiz(g) {
  const rounds = g.rounds || 6; let r = 0, score = 0, first = true, busy = false, q;
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
      <div class="opts ${q.cls || ''}">${q.opts.map((o, i) => `<button class="opt ${q.optCls || ''}" data-i="${i}" style="${o.st || ''}" ${o.aria ? `aria-label="${o.aria}"` : ''}>${o.h}</button>`).join('')}</div>
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
  else if (act === 'shape') { sfx.tap(); shapeModal(+b.dataset.i); }
  else if (act === 'feel') { sfx.tap(); feelModal(+b.dataset.i); }
  else if (act === 'story-hear') { const st = STORIES[+app.dataset.story]; sfx.tap(); speakParts([[st.t + '. ' + st.lines.join(' '), 'ar-SA']]); }
  else if (act === 'nmL') { sfx.tap(); say(b.dataset.c, 'en-US'); }
  else if (act === 'nmHear') { sfx.tap(); speakParts([['زين', 'ar-SA'], ['Zain. Z, A, I, N.', 'en-US']]); }
  else if (act === 'nmTraceAr') { sfx.tap(); traceText('زين', false, 'name'); }
  else if (act === 'nmTraceEn') { sfx.tap(); traceText('ZAIN', true, 'name-en'); }
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
  else if (a === 'shapes') pageShapes();
  else if (a === 'feelings') pageFeelings();
  else if (a === 'stories') pageStories();
  else if (a === 'story') pageStory(parseInt(b, 10));
  else if (a === 'name') pageName();
  else if (a === 'move') pageMove(b);
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
