importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);
importScripts("firebase-config.js");

if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  console.log(
    `${new Date().toJSON()}  [firebase-messaging-sw] Initialized messaging`
  );

  firebase.messaging().setBackgroundMessageHandler(async (payload) => {
    if (payload.data.twi_message_type !== "twilio.conversations.new_message") {
      return;
    }

    const customData = await fetch(
      `/api/parse-message?string=${payload.data.twi_body}`
    ).then((res) => res.json());

    const notificationTitle = customData.conversation;
    const notificationOptions = {
      body: `${customData.user}: ${customData.message}`,
      icon: "favicon.ico",
    };

    self.registration
      .showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log(
          `${new Date().toJSON()}  [firebase-messaging-sw] Notification shown`
        );
      })
      .catch((err) => {
        console.error(
          `${new Date().toJSON()}  [firebase-messaging-sw] Error showing notification: ${err}`
        );
      });
  });
} else {
  console.log(
    `${new Date().toJSON()}  [firebase-messaging-sw] No firebase configuration found!`
  );
}
