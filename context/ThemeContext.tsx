import React, { createContext, useContext } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../constants/colours';

const ThemeContext = createContext<Theme>(darkTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    let styleEl = document.getElementById('kashe-theme-reset') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style') as HTMLStyleElement;
      styleEl.id = 'kashe-theme-reset';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      html, body, #root, [data-reactroot] {
        background-color: ${theme.background} !important;
        color: ${theme.textPrimary};
        margin: 0;
        padding: 0;
        height: 100%;
      }
      :focus { outline: none !important; }
      :focus-visible { outline: none !important; }
      input, textarea, select, button { font-family: inherit; }
    `;
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// The ONE hook every component uses. No exceptions.
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
