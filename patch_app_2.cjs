const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace usages of setViewingPublicUser
code = code.replace(
  /onOpenUserProfile=\{\(id, name\) => setViewingPublicUser\(\{ id, name \}\)\}/g,
  'onOpenUserProfile={(id, name) => pushScreen({ type: "seller_profile", sellerId: id, sellerName: name })}'
);

code = code.replace(
  /onOpenUserProfile=\{\(id, name\) =>\s*setViewingPublicUser\(\{ id, name \}\)\s*\}/g,
  'onOpenUserProfile={(id, name) => pushScreen({ type: "seller_profile", sellerId: id, sellerName: name })}'
);

code = code.replace(
  /setViewingPublicUser\(\{ id: detailedPart\.sellerId, name: detailedPart\.sellerName \|\| "" \}\)/g,
  'pushScreen({ type: "seller_profile", sellerId: detailedPart.sellerId, sellerName: detailedPart.sellerName || detailedPart.contactName || "" })'
);

code = code.replace(
  /setViewingPublicUser\(\{ id: part.sellerId, name: part.sellerName \|\| "" \}\)/g,
  'pushScreen({ type: "seller_profile", sellerId: part.sellerId, sellerName: part.sellerName || part.contactName || "" })'
);

code = code.replace(
  /setShowDetailedReviews\(true\)/g,
  'pushScreen({ type: "seller_profile", sellerId: detailedPart.sellerId, sellerName: detailedPart.contactName || detailedPart.sellerName || "" })'
);

// We should also replace the rendering block for viewingPublicUser
const oldRenderBlock = `{/* Public User / Seller Profile Overlay */}
          {viewingPublicUser && (
            <SellerProfileView
              key={\`public-profile-\${viewingPublicUser.id}\`}
              sellerId={viewingPublicUser.id}
              sellerName={viewingPublicUser.name}
              currentUser={currentUser}
              onClose={() => setViewingPublicUser(null)}
              onStartChat={handleStartChat}
              allParts={parts}
              onSelectPart={(part) => {
                setViewingPublicUser(null);
                pushScreen({ type: "part_detail", part });
              }}
            />
          )}

          {/* Seller Profile Overlay */}
          {showDetailedReviews && detailedPart && !viewingPublicUser && (
            <SellerProfileView
              key="seller-profile-app-overlay"
              sellerId={detailedPart.sellerId}
              sellerName={detailedPart.contactName}
              currentUser={currentUser}
              onClose={() => setShowDetailedReviews(false)}
              onStartChat={handleStartChat}
              allParts={parts}
              onSelectPart={(part) => {
                setShowDetailedReviews(false);
                pushScreen({ type: "part_detail", part });
              }}
            />
          )}`;

const newRenderBlock = `{/* Seller Profile Screen */}
          {currentScreen.type === "seller_profile" && (
            <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col">
              <SellerProfileView
                key={\`seller-profile-\${currentScreen.sellerId}\`}
                sellerId={currentScreen.sellerId}
                sellerName={currentScreen.sellerName}
                currentUser={currentUser}
                onClose={goBack}
                onStartChat={handleStartChat}
                allParts={parts}
                onSelectPart={(part) => {
                  pushScreen({ type: "part_detail", part });
                }}
              />
            </div>
          )}`;

code = code.replace(oldRenderBlock, newRenderBlock);

fs.writeFileSync('src/App.tsx', code);
