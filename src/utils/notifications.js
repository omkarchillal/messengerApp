// src/utils/notifications.js
// Small helper for Web Notifications used by the chat.
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    return false;
  }
}

export function notifyNewMessage({ senderName, content, senderId }) {
  if (!('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  const title = senderName || 'New message';
  const body = content && content.length > 120 ? content.slice(0, 120) + '…' : content;

  // Use app icon if available
  const icon = `${window.location.origin}/src/assets/appnexus-1.svg`;

  try {
    const n = new Notification(title, {
      body: body || 'You have a new message',
      icon,
      tag: `msg-${senderId}`,
      renotify: true,
    });

    n.onclick = function (ev) {
      ev.preventDefault(); // prevent the browser from focusing the Notification's tab
      try {
        if (window.focus) window.focus();
        // bring the app to front
        if (window.location.href) {
          // Optionally, you could navigate to a chat route here, e.g. /chat
          window.location.href = '/chat';
        }
      } catch (e) {
        // ignore
      }
      this.close();
    };

    return n;
  } catch (e) {
    return null;
  }
}
