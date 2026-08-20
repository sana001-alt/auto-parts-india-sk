const fs = require('fs');

let adminRnCode = fs.readFileSync('react-native-app/src/screens/AdminScreen.tsx', 'utf8');
adminRnCode = adminRnCode.replace(
  /No banners configured in Firestore\./g,
  'No banners configured.'
);
fs.writeFileSync('react-native-app/src/screens/AdminScreen.tsx', adminRnCode);
