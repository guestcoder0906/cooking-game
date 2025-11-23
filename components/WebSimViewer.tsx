import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export const WebSimViewer: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Using the requested URL.
  const TARGET_URL = "https://interactive-cooking-game--frog.on.websim.com/";

  // Persistent Polling: Aggressively check for and remove the target element.
  // NOTE: This will only work if the browser allows Cross-Origin access.
  // If blocked by CORS, the Visual Mask defined in the JSX will handle the "removal" visually.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const POLLING_DURATION = 60000; // Run for 60 seconds after load/mount
    const POLLING_INTERVAL = 50; // Check very frequently (50ms)
    let startTime = Date.now();
    
    const intervalId = setInterval(() => {
      // Stop polling after duration
      if (Date.now() - startTime > POLLING_DURATION) {
        clearInterval(intervalId);
        return;
      }

      try {
        // Attempt to access internal document. 
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (doc) {
          // --- Strategy 1: Targeted ID Removal ---
          const specificLogo = doc.getElementById('websim-logo-container');
          if (specificLogo) specificLogo.remove();

          const closeBtn = doc.getElementById('websim-close-button');
          if (closeBtn) {
             (closeBtn as HTMLElement).click(); 
             closeBtn.remove();
          }

          // --- Strategy 2: Shadow DOM Host Removal ---
          if (doc.body) {
            const children = Array.from(doc.body.children) as HTMLElement[];
            for (const child of children) {
              // Check if the element hosts a shadow root
              if (child.shadowRoot) {
                child.remove();
              }
              
              // Also check for specific wrapper classes often used by overlays
              if (child.classList.contains('websim-sidebar') || 
                  child.id === 'websim-ui' || 
                  child.tagName.toLowerCase().includes('websim')) {
                child.remove();
              }
            }
          }

          // --- Strategy 3: CSS Injection ---
          if (!doc.getElementById('viewer-cleanup-styles')) {
            const style = doc.createElement('style');
            style.id = 'viewer-cleanup-styles';
            style.textContent = `
              #websim-logo-container, 
              #websim-bar, 
              .websim-sidebar,
              [id*="websim"] { 
                display: none !important; 
                opacity: 0 !important; 
                pointer-events: none !important; 
                visibility: hidden !important;
                z-index: -9999 !important;
              }
            `;
            doc.head?.appendChild(style);
          }
        }
      } catch (e) {
        // Silent catch: CORS blocked access.
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refreshKey]);

  const handleReload = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Control Overlay - Top Right */}
      <div className="absolute top-4 right-4 z-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
         <button 
          onClick={handleReload}
          className="p-2 bg-black/50 backdrop-blur text-white/70 hover:text-white rounded-full hover:bg-emerald-600 transition-all border border-white/10"
          title="Reload Game"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* VISUAL MASK: Bottom Right 
          Since browsers block script access to cross-origin iframes (CORS),
          we place a black element over the area where the logo appears to hide it.
          Pinning to 0,0 (bottom right) to cover the extreme corner edges.
          Using rounded-tl-3xl gives it a smooth interior curve while keeping the corner square.
      */}
      <div 
        className="absolute bottom-0 right-0 z-50 bg-black rounded-tl-3xl pointer-events-auto"
        style={{ width: '160px', height: '60px' }}
        aria-hidden="true"
      />

      <iframe
        key={refreshKey}
        ref={iframeRef}
        src={TARGET_URL}
        title="Interactive Cooking Game"
        className="w-full h-full border-none block bg-black"
        // Sandbox permissions needed for the game to run, but limiting some interactions
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};