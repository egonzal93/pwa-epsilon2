// Listen for push notifications
self.addEventListener('push', (e) => {

    self.registration.showNotification( e.data.text());

})