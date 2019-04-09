self.addEventListener('push', function(event) {
  const payload = event.data ? event.data.text() : 'no payload';
  event.waitUntil(
    self.registration.showNotification(payload.activity, {
      body: payload.activity,
      icon: 'img/r.png'
    })
  );
});
