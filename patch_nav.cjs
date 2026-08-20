const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update Bottom Nav wrapper container
code = code.replace(
  /className="fixed bottom-0 inset-x-0 z-\[1000\] px-3 pt-1 max-w-md mx-auto w-full pointer-events-auto shrink-0"/g,
  'className="fixed bottom-0 inset-x-0 z-[1000] max-w-md mx-auto w-full pointer-events-auto shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"'
);

// Update Bottom Nav inner container
code = code.replace(
  /className="h-14 bg-white\/95 dark:bg-slate-900\/95 backdrop-blur-md border border-slate-200\/90 dark:border-slate-800 rounded-2xl flex flex-row items-center justify-around px-1 relative shadow-lg shadow-slate-950\/10"/g,
  'className="h-[60px] flex flex-row items-center justify-around px-2 relative"'
);

// Change active tab colors from blue-600/amber to slate-900 (native look)
code = code.replace(/text-\[\#2563EB\]/g, 'text-slate-900 dark:text-white');
code = code.replace(/text-amber-600/g, 'text-slate-900');
code = code.replace(/text-slate-500/g, 'text-slate-400');

// Update Sell button
code = code.replace(
  /className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center p-0 border-2 border-white dark:border-slate-900 shadow-md hover:scale-105 active:scale-90 transition-transform cursor-pointer"/g,
  'className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center p-0 border-[4px] border-slate-100 dark:border-slate-950 shadow-sm hover:scale-105 active:scale-90 transition-transform cursor-pointer"'
);

code = code.replace(
  /className="text-slate-950"/g, // for the Plus icon inside sell
  'className="text-slate-900 dark:text-white"'
);

code = code.replace(
  /<div className="flex-1 flex flex-col items-center justify-center relative -mt-3.5">/g,
  '<div className="flex-1 flex flex-col items-center justify-center relative -mt-5">'
);

fs.writeFileSync('src/App.tsx', code);
