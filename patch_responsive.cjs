const fs = require('fs');
const file = 'src/App.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace all instances of 'max-w-md' with 'max-w-[100vw]' or just remove it.
  // Actually, replacing 'max-w-md' with 'max-w-full' works.
  // Also remove 'mx-auto' from the bottom nav so it spans full width.
  // And remove 'border-x' which was used to border the mobile container on desktop.
  code = code.replace(/max-w-md/g, 'max-w-full');
  code = code.replace(/ mx-auto /g, ' ');
  code = code.replace(/ border-x border-slate-800\/20/g, '');
  code = code.replace(/ border-x border-slate-800\/40/g, '');
  
  fs.writeFileSync(file, code);
  console.log('App.tsx patched for responsiveness');
}
