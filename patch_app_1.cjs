const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /case "notifications":\s*return "\/notifications";/,
  'case "notifications": return "/notifications";\n    case "seller_profile": return `/profile/${screen.sellerId}`;'
);

code = code.replace(
  /if \(lower === "\/notifications"\) return \[\{ type: "tab", tab: "home" \}, \{ type: "notifications" \}\];/,
  `if (lower === "/notifications") return [{ type: "tab", tab: "home" }, { type: "notifications" }];\n    if (pathname.startsWith("/profile/")) {\n      const pId = pathname.substring("/profile/".length).trim();\n      if (pId) return [{ type: "tab", tab: "home" }, { type: "seller_profile", sellerId: pId, sellerName: "User Profile" }];\n    }`
);

fs.writeFileSync('src/App.tsx', code);
