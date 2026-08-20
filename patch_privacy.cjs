const fs = require('fs');

let code = fs.readFileSync('src/components/SellerProfileView.tsx', 'utf8');

// Remove the email line from the full screen avatar modal
code = code.replace(
  /\{sellerProfile\?\.email && <p className="text-sm text-slate-400 mt-1">\{sellerProfile\.email\}<\/p>\}/g,
  ''
);

fs.writeFileSync('src/components/SellerProfileView.tsx', code);
