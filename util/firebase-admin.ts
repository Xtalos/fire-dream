import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from 'firebase-admin/auth';

const { private_key } = JSON.parse(process.env.NEXT_PRIVATE_FIREBASE_ADMIN_PRIVATE_KEY as string);
initializeApp({
    credential: cert({
        privateKey: private_key,
        clientEmail: process.env.NEXT_PRIVATE_FIREBASE_ADMIN_CLIENT_EMAIL,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
});

export { getAuth };