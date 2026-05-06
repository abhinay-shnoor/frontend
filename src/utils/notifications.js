export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.warn('[Notification] This browser does not support desktop notifications');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Notification] Permission is not granted. Current state:', Notification.permission);
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: options.icon || '/shnoor-logo.png',
      badge: '/shnoor-logo.png',
      silent: false,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      // Some browsers require explicit focus on the parent/opener
      if (window.opener) {
        try {
          window.opener.focus();
        } catch (e) {
          console.warn('[Notification] Failed to focus opener window:', e);
        }
      }
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    console.log('[Notification] Successfully created and displayed desktop notification:', title);
    return notification;
  } catch (error) {
    console.error('[Notification] Error creating standard HTML5 notification:', error);
    
    // Fallback to Service Worker registration if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: options.icon || '/shnoor-logo.png',
          badge: '/shnoor-logo.png',
          ...options,
        });
        console.log('[Notification] Displayed notification via Service Worker fallback:', title);
      }).catch((swErr) => {
        console.error('[Notification] Service Worker notification fallback failed:', swErr);
      });
    }
    return null;
  }
};
