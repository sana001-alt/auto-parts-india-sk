const fs = require('fs');
let code = fs.readFileSync('src/components/SellerProfileView.tsx', 'utf8');

code = code.replace(
  /<UserAvatar\s+userId=\{sellerId\}\s+name=\{displayName\}\s+photoURL=\{displayPhoto\}\s+size="xl"\s+showVerifiedBadge=\{false\}\s+\/>/g,
  `{displayPhoto ? (
              <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-6xl font-black text-slate-400">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}`
);

fs.writeFileSync('src/components/SellerProfileView.tsx', code);
