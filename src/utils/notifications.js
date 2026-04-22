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
    icon: '/shnoor-logo.png', // Fallback icon
    ...options,
  });

  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();
    if (options.onClick) {
      options.onClick();
    }
    notification.close();
  };

  return notification;
};
