const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/ChatRoomWindow.tsx',
  'src/components/ProfileScreen.tsx',
  'src/components/HomeScreen.tsx',
  'src/components/ChatsScreen.tsx',
  'src/components/SellerProfileView.tsx',
  'src/components/SellScreen.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace dark headers with OLX brand dark teal
    code = code.replace(/bg-\[\#0B1220\]/g, 'bg-[#002f34]');
    code = code.replace(/border-\[\#18233C\]/g, 'border-white/10');
    
    fs.writeFileSync(file, code);
  }
}
