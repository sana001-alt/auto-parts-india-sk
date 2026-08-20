const fs = require('fs');

let homeCode = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');
homeCode = homeCode.replace(
  /if \(window\.confirm\("Are you sure you want to permanently delete this listing\? This will delete images and data from everywhere\."\)\) \{/g,
  'if (window.confirm("Are you sure you want to permanently delete this listing?")) {'
);
fs.writeFileSync('src/components/HomeScreen.tsx', homeCode);
