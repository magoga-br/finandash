export const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var initialTheme = theme || systemTheme;
      
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initialTheme);
    } catch (e) {
      document.documentElement.classList.add('light');
    }
  })();
`
