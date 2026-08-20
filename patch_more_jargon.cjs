const fs = require('fs');

let profileCode = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');
profileCode = profileCode.replace(
  /Delete listing permanently from Firestore\? This action is irreversible\./g,
  'Delete listing permanently? This action cannot be undone.'
);
profileCode = profileCode.replace(
  /Checking Firestore\.\.\./g,
  'Checking for updates...'
);
fs.writeFileSync('src/components/ProfileScreen.tsx', profileCode);

let sellCode = fs.readFileSync('src/components/SellScreen.tsx', 'utf8');
sellCode = sellCode.replace(
  /Cloudinary upload failed\/timed out, using direct image fallback/g,
  'Image upload failed/timed out, using direct image fallback'
);
fs.writeFileSync('src/components/SellScreen.tsx', sellCode);

let editCode = fs.readFileSync('src/components/EditListingModal.tsx', 'utf8');
editCode = editCode.replace(
  /Cloudinary upload failed\/timeout; using compressed image fallback/g,
  'Image upload failed/timeout; using compressed image fallback'
);
fs.writeFileSync('src/components/EditListingModal.tsx', editCode);

