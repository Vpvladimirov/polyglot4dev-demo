import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB2HMaI2zE16HjuiP-QKOChvLe2bW4yM60',
  authDomain: 'polyglot4dev-demo.firebaseapp.com',
  projectId: 'polyglot4dev-demo',
  storageBucket: 'polyglot4dev-demo.appspot.com',
  messagingSenderId: '352750729471',
  appId: '1:352750729471:web:48ad84ee1acf238febf4ca',
  measurementId: 'G-XK9V46Q723',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const firestore = getFirestore(app);
export const storage = getStorage();
export const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 10000;
remoteConfig.defaultConfig = {
  chat_title: 'Chat room',
};
export const analytics = getAnalytics(app);
