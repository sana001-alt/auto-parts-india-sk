const fs = require('fs');
let code = fs.readFileSync('src/components/EditListingModal.tsx', 'utf8');

code = code.replace(
  /const fallbackVariants = DEFAULT_MODEL_VARIANTS \|\| \["Base", "Mid", "Top Spec", "VXi", "ZXi", "SX", "Alpha", "GT", "LXi"\];/,
  'const fallbackVariants = (carModel && DEFAULT_MODEL_VARIANTS[carModel]) ? DEFAULT_MODEL_VARIANTS[carModel] : ["Base", "Mid", "Top Spec", "VXi", "ZXi", "SX", "Alpha", "GT", "LXi"];'
);

fs.writeFileSync('src/components/EditListingModal.tsx', code);
