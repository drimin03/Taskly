// Register the service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(registration) {
        console.log('Service Worker registration successful with scope: ', registration.scope);
        
        // Request notification permission after service worker is registered
        if ('Notification' in window) {
          Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
              console.log('Notification permission granted.');
              // Get FCM token if Firebase Messaging is available
              initializeFirebaseMessaging();
            }
          });
        }
      },
      function(err) {
        console.log('Service Worker registration failed: ', err);
      }
    );
  });
}

// Initialize Firebase Messaging (simplified version)
function initializeFirebaseMessaging() {
  // In a real implementation, you would initialize Firebase Messaging here
  // and get the FCM token to send to your server
  console.log('Firebase Messaging would be initialized here');
}