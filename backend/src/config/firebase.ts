import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let appInitialized = false;

try {
  // Only attempt to initialize if we have a seemingly valid key structure
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'dummy_project',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'dummy@dummy.com',
        privateKey: privateKey,
      }),
    });
    appInitialized = true;
    console.log('✅ Firebase Admin Initialized');
  } else {
    console.warn('⚠️ Firebase Admin skipped: Missing or invalid FIREBASE_PRIVATE_KEY');
  }
} catch (error) {
  console.error('❌ Firebase initialization error', error);
}

export const messaging = appInitialized ? getMessaging() : null;

export const sendNotification = async (fcmToken: string, title: string, body: string, data?: any) => {
  if (!fcmToken || !messaging) return;

  const message = {
    notification: { title, body },
    data: data || {},
    token: fcmToken,
  };

  try {
    await messaging.send(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
