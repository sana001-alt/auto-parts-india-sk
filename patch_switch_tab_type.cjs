const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /const switchTab = useCallback\(\(tab: string\) => \{/,
  'const switchTab = useCallback((tab: "home" | "search" | "sell" | "messages" | "profile" | "chats" | "chat" | "myads" | "account") => {'
);
fs.writeFileSync('src/App.tsx', code);
