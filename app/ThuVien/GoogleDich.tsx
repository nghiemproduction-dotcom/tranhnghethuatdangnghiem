'use client';
import React, { useEffect, useState } from 'react';

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: 'https://flagcdn.com/w40/vn.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'zh-CN', label: 'Chinese', flag: 'https://flagcdn.com/w40/cn.png' },
  { code: 'ja', label: 'Japanese', flag: 'https://flagcdn.com/w40/jp.png' },
  { code: 'fr', label: 'French', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'de', label: 'German', flag: 'https://flagcdn.com/w40/de.png' },
];

export default function GoogleDich() {
  const [currentLang, setCurrentLang] = useState('vi');
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const googCookie = cookies.find(c => c.trim().startsWith('googtrans='));
        if (googCookie) {
            const langCode = googCookie.split('/').pop();
            if (langCode) setCurrentLang(langCode);
        }
    }

    if (!document.getElementById('google-translate-script')) {
        const addScript = document.createElement('script');
        addScript.id = 'google-translate-script';
        addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(addScript);

        // @ts-ignore
        window.googleTranslateElementInit = () => {
             // @ts-ignore
             if (window.google && window.google.translate) {
                // @ts-ignore
                new window.google.translate.TranslateElement({
                    pageLanguage: 'vi',
                    autoDisplay: false, 
                    layout: 0 
                }, 'google_translate_element');
             }
        };
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/auto/${langCode}; path=/;`;
    setCurrentLang(langCode);
    setShowMenu(false);
    window.location.reload(); 
  };

  if (!isMounted) return null;

  const currentFlag = LANGUAGES.find(l => l.code === currentLang)?.flag || LANGUAGES[0].flag;

  return (
    <div className="absolute top-6 right-6 z-50">
      <div id="google_translate_element" className="hidden" />

      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white transition-all shadow-lg active:scale-95 bg-black/50"
        >
          <img src={currentFlag} alt="Flag" className="w-full h-full object-cover" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl w-40 z-[60]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors text-left ${currentLang === lang.code ? 'bg-white/5' : ''}`}
              >
                <img src={lang.flag} alt={lang.code} className="w-6 h-4 object-cover rounded-sm" />
                <span className={`text-xs font-bold ${currentLang === lang.code ? 'text-yellow-500' : 'text-gray-300'}`}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 🟢 CSS QUAN TRỌNG: Ẩn thanh Google triệt để */}
      <style jsx global>{`
        .goog-te-banner-frame { display: none !important; }
        .skiptranslate { display: none !important; } 
        body { top: 0px !important; }
        #goog-gt-tt { display: none !important; visibility: hidden !important; }
        .goog-tooltip { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      `}</style>
    </div>
  );
}