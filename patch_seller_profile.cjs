const fs = require('fs');

let code = fs.readFileSync('src/components/SellerProfileView.tsx', 'utf8');

// Insert the state variable
code = code.replace(
  /const \[followingCount, setFollowingCount\] = useState\(0\);/,
  'const [followingCount, setFollowingCount] = useState(0);\n  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);'
);

// Add onClick to the avatar container
code = code.replace(
  /<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white ring-2 ring-slate-100 shadow-sm relative bg-slate-100 flex items-center justify-center">/g,
  '<div \n                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white ring-2 ring-slate-100 shadow-sm relative bg-slate-100 flex items-center justify-center cursor-pointer"\n                    onClick={() => setIsAvatarModalOpen(true)}\n                  >'
);

// Append the modal JSX right before the last closing div/element in the component
const modalJSX = `
      {/* Full Screen Avatar Modal */}
      {isAvatarModalOpen && (
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 left-6 w-10 h-10 bg-slate-800/50 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsAvatarModalOpen(false);
            }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div 
            className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl relative bg-slate-900 flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <UserAvatar
              userId={sellerId}
              name={displayName}
              photoURL={displayPhoto}
              size="xl"
              showVerifiedBadge={false}
            />
          </div>
          
          <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            {sellerProfile?.email && <p className="text-sm text-slate-400 mt-1">{sellerProfile.email}</p>}
          </div>
        </div>
      )}
`;

code = code.replace(/    <\/div>\s*<\/div>\s*\);\s*\}\s*$/m, `${modalJSX}\n    </div>\n  </div>\n);\n}`);

fs.writeFileSync('src/components/SellerProfileView.tsx', code);
