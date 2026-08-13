const iframe = document.getElementById('browser');
const urlInput = document.getElementById('urlInput');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const homeBtn = document.getElementById('homeBtn');
const menuBtn = document.getElementById('menuBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const themeSelect = document.getElementById('themeSelect');
const blurRange = document.getElementById('blurRange');
const blurValue = document.getElementById('blurValue');
const searchEngine = document.getElementById('searchEngine');
const homePageToggle = document.getElementById('homePageToggle');
const darkModeAuto = document.getElementById('darkModeAuto');
const resetBtn = document.getElementById('resetBtn');

// تنظیمات پیش‌فرض
const defaultSettings = {
  theme: 'ios',
  blur: 20,
  searchEngine: 'google',
  homePage: true,
  darkModeAuto: false
};

// بارگذاری تنظیمات از localStorage
function loadSettings() {
  const saved = localStorage.getItem('liquidBrowserSettings');
  if (saved) {
    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      return { ...defaultSettings };
    }
  }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  localStorage.setItem('liquidBrowserSettings', JSON.stringify(settings));
}

let settings = loadSettings();
let currentSearch = settings.searchEngine;

// اعمال تنظیمات اولیه
function applySettings() {
  // تم
  document.body.className = '';
  if (settings.theme !== 'ios') {
    document.body.classList.add('theme-' + settings.theme);
  }
  themeSelect.value = settings.theme;

  // شفافیت
  document.documentElement.style.setProperty('--blur', settings.blur + 'px');
  blurRange.value = settings.blur;
  blurValue.textContent = settings.blur;

  // موتور جستجو
  searchEngine.value = settings.searchEngine;
  currentSearch = settings.searchEngine;

  // چک‌باکس‌ها
  homePageToggle.checked = settings.homePage;
  darkModeAuto.checked = settings.darkModeAuto;

  // حالت تاریک خودکار
  if (settings.darkModeAuto) {
    checkAutoDark();
  }
}

function checkAutoDark() {
  const hour = new Date().getHours();
  if (hour >= 19 || hour < 7) {
    document.body.className = 'theme-dark';
  }
}

// موتورهای جستجو
const engines = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  yahoo: (q) => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`
};

function navigate() {
  let value = urlInput.value.trim();
  if (!value) return;

  // تشخیص جستجو یا آدرس
  const isUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i.test(value) || 
                value.startsWith('http://') || 
                value.startsWith('https://') ||
                value.includes('.') && !value.includes(' ');

  if (!isUrl) {
    // جستجو
    iframe.src = engines[currentSearch](value);
  } else {
    // آدرس
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      value = 'https://' + value;
    }
    iframe.src = value;
  }

  // بستن کیبورد در موبایل
  urlInput.blur();
}

// رویدادها
goBtn.addEventListener('click', navigate);

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    navigate();
  }
});

backBtn.addEventListener('click', () => {
  try {
    iframe.contentWindow.history.back();
  } catch (e) {
    // محدودیت CORS
  }
});

forwardBtn.addEventListener('click', () => {
  try {
    iframe.contentWindow.history.forward();
  } catch (e) {}
});

reloadBtn.addEventListener('click', () => {
  try {
    iframe.contentWindow.location.reload();
  } catch (e) {
    iframe.src = iframe.src;
  }
});

homeBtn.addEventListener('click', () => {
  iframe.src = 'https://www.google.com';
  urlInput.value = '';
});

menuBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});

closeSettings.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

// تغییر تم
themeSelect.addEventListener('change', () => {
  settings.theme = themeSelect.value;
  document.body.className = '';
  if (settings.theme !== 'ios') {
    document.body.classList.add('theme-' + settings.theme);
  }
  saveSettings(settings);
});

// تغییر شفافیت
blurRange.addEventListener('input', () => {
  const val = blurRange.value;
  blurValue.textContent = val;
  document.documentElement.style.setProperty('--blur', val + 'px');
  settings.blur = parseInt(val);
  saveSettings(settings);
});

// موتور جستجو
searchEngine.addEventListener('change', () => {
  currentSearch = searchEngine.value;
  settings.searchEngine = currentSearch;
  saveSettings(settings);
});

// صفحه شروع
homePageToggle.addEventListener('change', () => {
  settings.homePage = homePageToggle.checked;
  saveSettings(settings);
});

// حالت تاریک خودکار
darkModeAuto.addEventListener('change', () => {
  settings.darkModeAuto = darkModeAuto.checked;
  saveSettings(settings);
  if (settings.darkModeAuto) {
    checkAutoDark();
  } else {
    // بازگشت به تم انتخاب‌شده
    document.body.className = '';
    if (settings.theme !== 'ios') {
      document.body.classList.add('theme-' + settings.theme);
    }
  }
});

// بازنشانی
resetBtn.addEventListener('click', () => {
  if (confirm('آیا مطمئن هستید که می‌خواهید همه تنظیمات بازنشانی شود؟')) {
    settings = { ...defaultSettings };
    localStorage.removeItem('liquidBrowserSettings');
    applySettings();
    iframe.src = 'https://www.google.com';
    urlInput.value = '';
  }
});

// بستن پنل با کلیک بیرون
document.addEventListener('click', (e) => {
  if (!settingsPanel.classList.contains('hidden') &&
      !settingsPanel.contains(e.target) &&
      e.target !== menuBtn) {
    settingsPanel.classList.add('hidden');
  }
});

// شروع
applySettings();

if (settings.homePage) {
  iframe.src = 'https://www.google.com';
}

// آپدیت آدرس در نوار (تا جایی که CORS اجازه بده)
try {
  iframe.addEventListener('load', () => {
    try {
      const currentUrl = iframe.contentWindow.location.href;
      if (currentUrl && !currentUrl.startsWith('about:')) {
        urlInput.value = currentUrl;
      }
    } catch (e) {
      // محدودیت امنیتی مرورگر
    }
  });
} catch (e) {}
