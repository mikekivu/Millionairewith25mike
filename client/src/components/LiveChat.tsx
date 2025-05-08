import React, { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: any;
  }
}

export default function LiveChat() {
  useEffect(() => {
    (function(){
      // Safety check to avoid duplicate scripts
      if (window.Tawk_API) {
        return;
      }
      
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/YOUR_TAWK_ID/default'; // Replace with your actual Tawk.to ID
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode?.insertBefore(s1, s0);
      
      window.Tawk_API = {};
      window.Tawk_LoadStart = new Date();
    })();
    
    // Cleanup on unmount
    return () => {
      if (window.Tawk_API) {
        // End the chat session when component unmounts
        window.Tawk_API.hideWidget();
      }
    };
  }, []);
  
  // There's no visible component, as Tawk.to creates its own UI
  return null;
}