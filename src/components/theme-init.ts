/** Inline script: apply saved/system theme before paint to avoid FOUC. */
export const themeInitScript = `(()=>{try{var k='pickonomics-theme';var s=localStorage.getItem(k);var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
