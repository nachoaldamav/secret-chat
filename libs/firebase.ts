import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Client, PushNotification } from "@twilio/conversations";

const firebaseConfig = {
  apiKey: "AIzaSyDEHPhyIncYVI0vxebB0m3XS7ZDOQpGh1A",
  authDomain: "secret-chat-7fac0.firebaseapp.com",
  projectId: "secret-chat-7fac0",
  storageBucket: "secret-chat-7fac0.appspot.com",
  messagingSenderId: "153618712697",
  appId: "1:153618712697:web:6dc8d56ff3f01073a5aca8",
  measurementId: "G-GZPGWEGVT3",
};

export const app = initializeApp(firebaseConfig);

export const initServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register(
      "firebase-messaging-sw.js"
    );
    console.log("Service Worker Registered: ", registration.scope);
  } catch (err) {
    console.log("Service Worker Error: ", err);
  }
};

export const suscribeToNotifications = async (convoClient: Client) => {
  const messaging = getMessaging(app);
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("[Notifications]: Permission not granted for Notification");
    return;
  }

  const token = await getToken(messaging);

  if (!token) {
    console.log("[Notifications]: Can't get token");
    return;
  }

  await convoClient
    .setPushRegistrationId("fcm", token)
    .then(() => {
      console.log("[Notifications]: Successfully set push registration id");
    })
    .catch((err) => {
      console.log("[Notifications]: Error: ", err);
    });

  onMessage(messaging, (payload) => {
    console.log("[Notifications]: Message received: ", payload);
    if (convoClient) {
      convoClient.handlePushNotification(payload);
    }
  });
};

export const showNotification = async (
  pushNotification: PushNotification,
  customData: any
) => {
  // eslint-disable-next-line
  // @ts-ignore
  const title = pushNotification.data.conversationTitle || "Secret Chat";

  console.log("[Notifications]: Showing notification: ", pushNotification.data);
  console.log("[Notifications]: Custom data: ", customData);

  const notificationOptions = {
    body: `[${customData.conversation}] ${customData.user}: ${customData.message}`,
    icon: "favicon.ico",
  };

  const notification = new Notification(title, notificationOptions);
  notification.onclick = (e) => {
    e.preventDefault();
    window.open(`/chat/${customData.roomId}`);
    notification.close();
  };
};
