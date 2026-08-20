const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update screenToPath
code = code.replace(
  /case "seller_profile": return `\/profile\/\$\{screen\.sellerId\}`;/,
  'case "seller_profile": return `/profile/${screen.sellerId}`;\n    case "edit_listing": return `/edit/${screen.part.id}`;'
);

// Update parseInitialScreenFromUrl
code = code.replace(
  /if \(pId\) return \[\{ type: "tab", tab: "home" \}, \{ type: "seller_profile", sellerId: pId, sellerName: "User Profile" \}\];\n    \}/,
  `if (pId) return [{ type: "tab", tab: "home" }, { type: "seller_profile", sellerId: pId, sellerName: "User Profile" }];
    }
    if (pathname.startsWith("/edit/")) {
      const eId = pathname.substring("/edit/".length).trim();
      if (eId) {
        return [
          { type: "tab", tab: "home" },
          { 
            type: "edit_listing", 
            part: { id: eId, title: "Loading...", price: 0, category: "", carBrand: "", carModel: "", description: "", condition: "Used (Good)", location: "", imageUrl: "", sellerId: "", sellerEmail: "", contactName: "", contactPhone: "", state: "", district: "", status: "approved", createdAt: Date.now() } 
          }
        ];
      }
    }`
);

fs.writeFileSync('src/App.tsx', code);
