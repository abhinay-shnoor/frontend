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
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: options.icon || '/shnoor-logo.png',
    badge: '/shnoor-logo.png',
    silent: false,
    ...options,
  });

  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();
    // Some browsers require explicit focus on the parent/opener
    if (window.opener) {
      window.opener.focus();
    }
    if (options.onClick) {
      options.onClick();
    }
    notification.close();
  };

  return notification;
};
