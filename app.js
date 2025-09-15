(() => {
  const qs = (sel) => document.querySelector(sel);
  const qid = (id) => document.getElementById(id);

  const els = {
    modeYears: qid('modeYears'),
    modeNumbers: qid('modeNumbers'),
    yearsConfig: qid('yearsConfig'),
    numbersConfig: qid('numbersConfig'),
    yearMin: qid('yearMin'),
    yearMax: qid('yearMax'),
    minDigits: qid('minDigits'),
    maxDigits: qid('maxDigits'),
    itemValue: qid('itemValue'),
    reading: qid('reading'),
    nextBtn: qid('nextBtn'),
    toggleAnswerBtn: qid('toggleAnswerBtn'),
    speakBtn: qid('speakBtn')
  };

  const defaultSettings = {
    mode: 'years',        // 'years' | 'numbers'
    yearMin: 1800,
    yearMax: 2099,
    minDigits: 2,
    maxDigits: 6,
  };

  let settings = loadSettings();
  let current = { value: null, reading: '' };
  let voices = [];

  function loadSettings() {
    try {
      const raw = localStorage.getItem('pte-di-settings');
      if (!raw) return { ...defaultSettings };
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      return { ...defaultSettings };
    }
  }

  function saveSettings() {
    localStorage.setItem('pte-di-settings', JSON.stringify(settings));
  }

  function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randIntWithDigits(minDigits, maxDigits) {
    const d = randInt(minDigits, maxDigits);
    if (d === 1) return randInt(0, 9);
    const min = Math.pow(10, d - 1);
    const max = Math.pow(10, d) - 1;
    return randInt(min, max);
  }

  // Number to words (US style, no British "and") up to billions
  const BELOW_TWENTY = [
    'zero','one','two','three','four','five','six','seven','eight','nine',
    'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'
  ];
  const TENS = ['', '', 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

  function chunkToWords(n) { // 0-999
    if (n < 20) return BELOW_TWENTY[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const r = n % 10;
      return r ? `${TENS[t]}-${BELOW_TWENTY[r]}` : TENS[t];
    }
    const h = Math.floor(n / 100);
    const r = n % 100;
    return r ? `${BELOW_TWENTY[h]} hundred ${chunkToWords(r)}` : `${BELOW_TWENTY[h]} hundred`;
  }

  function numberToWords(n) {
    if (n === 0) return 'zero';
    const parts = [];
    const billions = Math.floor(n / 1_000_000_000);
    const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
    const thousands = Math.floor((n % 1_000_000) / 1_000);
    const rest = n % 1_000;
    if (billions) parts.push(`${chunkToWords(billions)} billion`);
    if (millions) parts.push(`${chunkToWords(millions)} million`);
    if (thousands) parts.push(`${chunkToWords(thousands)} thousand`);
    if (rest) parts.push(chunkToWords(rest));
    return parts.join(' ');
  }

  function twoDigitNumberWords(n) { // 10-99
    if (n < 10) return BELOW_TWENTY[n];
    if (n < 20) return BELOW_TWENTY[n];
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r ? `${TENS[t]}-${BELOW_TWENTY[r]}` : TENS[t];
  }

  function yearToWords(y) {
    // Default to general reading if out of expected range
    if (y >= 2000 && y <= 2009) {
      return y === 2000 ? 'two thousand' : `two thousand ${numberToWords(y - 2000)}`;
    }
    if (y >= 2010 && y <= 2099) {
      return `twenty ${twoDigitNumberWords(y - 2000)}`; // e.g., 2021 -> twenty twenty-one
    }
    if (y >= 1100 && y <= 1999) {
      const firstTwo = Math.floor(y / 100); // 18 for 1800s
      const lastTwo = y % 100;
      const firstWords = numberToWords(firstTwo);
      if (lastTwo === 0) return `${firstWords} hundred`;
      if (lastTwo < 10) return `${firstWords} oh ${numberToWords(lastTwo)}`;
      return `${firstWords} ${twoDigitNumberWords(lastTwo)}`;
    }
    if (y === 2000) return 'two thousand';
    // fallback
    return numberToWords(y);
  }

  function englishReading(value, mode) {
    if (mode === 'years') return yearToWords(value);
    return numberToWords(value);
  }

  function render() {
    const display = (() => {
      if (current.value == null) return '—';
      if (settings.mode === 'numbers') {
        try { return Number(current.value).toLocaleString('en-US'); } catch { return String(current.value); }
      }
      return String(current.value);
    })();
    els.itemValue.textContent = display;
    els.reading.textContent = current.reading || '—';
  }

  function setReadingVisible(visible) {
    els.reading.classList.toggle('hidden', !visible);
    els.toggleAnswerBtn.textContent = visible ? '隐藏读法' : '显示读法';
  }

  function nextItem() {
    let value;
    if (settings.mode === 'years') {
      const minY = Math.min(settings.yearMin, settings.yearMax);
      const maxY = Math.max(settings.yearMin, settings.yearMax);
      value = randInt(minY, maxY);
    } else {
      const minD = Math.min(settings.minDigits, settings.maxDigits);
      const maxD = Math.max(settings.minDigits, settings.maxDigits);
      value = randIntWithDigits(minD, maxD);
    }
    current.value = value;
    current.reading = englishReading(value, settings.mode);
    setReadingVisible(false);
    render();
  }

  function updateConfigVisibility() {
    const years = settings.mode === 'years';
    els.yearsConfig.classList.toggle('hidden', !years);
    els.numbersConfig.classList.toggle('hidden', years);
  }

  function initUIFromSettings() {
    els.modeYears.checked = settings.mode === 'years';
    els.modeNumbers.checked = settings.mode === 'numbers';
    els.yearMin.value = settings.yearMin;
    els.yearMax.value = settings.yearMax;
    els.minDigits.value = settings.minDigits;
    els.maxDigits.value = settings.maxDigits;
    updateConfigVisibility();
  }

  function validateAndSaveSettings() {
    settings.yearMin = clamp(parseInt(els.yearMin.value || '1800', 10), 1000, 3000);
    settings.yearMax = clamp(parseInt(els.yearMax.value || '2099', 10), 1000, 3000);
    settings.minDigits = clamp(parseInt(els.minDigits.value || '2', 10), 1, 12);
    settings.maxDigits = clamp(parseInt(els.maxDigits.value || '6', 10), 1, 12);
    saveSettings();
  }

  // TTS functionality with Tencent Cloud fallback to Web Speech API
  let currentAudio = null;

  function pickEnglishVoice() {
    const v = speechSynthesis.getVoices();
    voices = v;
    const priorities = [
      (x) => x.lang && x.lang.toLowerCase().startsWith('en-us'),
      (x) => x.lang && x.lang.toLowerCase().startsWith('en-gb'),
      (x) => x.lang && x.lang.toLowerCase().startsWith('en-')
    ];
    for (const match of priorities) {
      const found = v.find(match);
      if (found) return found;
    }
    return v[0];
  }

  async function speakWithTencentTTS(text) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: '1001', // English voice
          speed: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        URL.revokeObjectURL(currentAudio.src);
      }

      currentAudio = new Audio(audioUrl);
      currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
      };
      
      await currentAudio.play();
      return true;
    } catch (error) {
      console.warn('Tencent TTS failed, falling back to Web Speech API:', error);
      return false;
    }
  }

  function speakWithWebSpeechAPI(text) {
    if (!('speechSynthesis' in window)) {
      alert('当前浏览器不支持语音合成（Web Speech API）。');
      return;
    }
    try { speechSynthesis.cancel(); } catch {}
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickEnglishVoice();
    if (voice) utter.voice = voice;
    utter.lang = (voice && voice.lang) || 'en-US';
    utter.rate = 0.95;
    utter.pitch = 1.0;
    speechSynthesis.speak(utter);
  }

  async function speak(text) {
    // Try Tencent TTS first, fallback to Web Speech API
    const tencentSuccess = await speakWithTencentTTS(text);
    if (!tencentSuccess) {
      speakWithWebSpeechAPI(text);
    }
  }

  function bindEvents() {
    // Mode
    els.modeYears.addEventListener('change', () => {
      if (els.modeYears.checked) {
        settings.mode = 'years';
        updateConfigVisibility();
        saveSettings();
      }
    });
    els.modeNumbers.addEventListener('change', () => {
      if (els.modeNumbers.checked) {
        settings.mode = 'numbers';
        updateConfigVisibility();
        saveSettings();
      }
    });

    // Config inputs
    ['yearMin','yearMax','minDigits','maxDigits'].forEach((id) => {
      qid(id).addEventListener('change', () => {
        validateAndSaveSettings();
      });
    });

    // Buttons
    els.nextBtn.addEventListener('click', () => nextItem());
    els.toggleAnswerBtn.addEventListener('click', () => setReadingVisible(els.reading.classList.contains('hidden')));
    els.speakBtn.addEventListener('click', () => {
      if (current.reading) speak(current.reading);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement && document.activeElement.tagName;
      const inInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
      const key = e.key;
      if (inInput && key !== 'Escape') return; // don't hijack while typing

      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        nextItem();
      } else if (key === 'a' || key === 'A') {
        e.preventDefault();
        setReadingVisible(els.reading.classList.contains('hidden'));
      } else if (key === 's' || key === 'S') {
        e.preventDefault();
        if (current.reading) speak(current.reading);
      } else if (key === '1') {
        settings.mode = 'numbers';
        initUIFromSettings();
        saveSettings();
      } else if (key === '2') {
        settings.mode = 'years';
        initUIFromSettings();
        saveSettings();
      }
    });

    // Voices may load async (Safari/Chrome)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
      };
    }
  }

  function init() {
    initUIFromSettings();
    bindEvents();
    nextItem();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
