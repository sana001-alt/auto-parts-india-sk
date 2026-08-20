const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const switchTabFn = `
  const switchTab = useCallback((tab: string) => {
    const newScreen: NavScreen = { type: "tab", tab };
    setNavStack([newScreen]);
    const path = screenToPath(newScreen);
    try {
      window.history.pushState({ index: 0, screen: newScreen }, "", path);
    } catch (e) {
      console.warn("Failed to push history state:", e);
    }
  }, []);

  const goBack = useCallback(() => {`;

code = code.replace(/  const goBack = useCallback\(\(\) => \{/, switchTabFn);

// Now replace all pushScreen({ type: "tab", tab: "some" }) with switchTab("some")
code = code.replace(/pushScreen\(\{\s*type:\s*"tab",\s*tab:\s*"([^"]+)"\s*\}\)/g, 'switchTab("$1")');

// And replace pushScreen({ type: "tab", tab }) with switchTab(tab)
code = code.replace(/pushScreen\(\{\s*type:\s*"tab",\s*tab\s*\}\)/g, 'switchTab(tab)');

fs.writeFileSync('src/App.tsx', code);
