const fs = require('fs');
let code = fs.readFileSync('src/components/GMap.tsx', 'utf8');

code = code.replace(/dragging: true,/, 'dragging: interactive,');
code = code.replace(/touchZoom: true,/, 'touchZoom: interactive,');
code = code.replace(/doubleClickZoom: true,/, 'doubleClickZoom: interactive,');

fs.writeFileSync('src/components/GMap.tsx', code);
