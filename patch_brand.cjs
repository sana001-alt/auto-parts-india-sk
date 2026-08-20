const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/HomeScreen.tsx',
  'src/components/SellScreen.tsx',
  'src/components/ProfileScreen.tsx',
  'src/components/SellerProfileView.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace all #2563EB with #002f34
    code = code.replace(/#2563EB/g, '#002f34');
    
    // Replace blue-600/700 with slate-800 for buttons to match dark OLX style
    code = code.replace(/hover:bg-blue-700/g, 'hover:bg-slate-800');
    code = code.replace(/bg-blue-600/g, 'bg-[#002f34]');
    code = code.replace(/hover:text-blue-700/g, 'hover:text-slate-800');
    
    // Replace bg-blue-50 with bg-slate-100
    code = code.replace(/bg-blue-50/g, 'bg-slate-100');
    code = code.replace(/border-blue-200/g, 'border-slate-300');
    
    fs.writeFileSync(file, code);
  }
}
