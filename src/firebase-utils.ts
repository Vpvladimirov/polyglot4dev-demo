import { Timestamp, addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { analytics, auth, firestore, storage } from './Firebase';
import { logEvent } from 'firebase/analytics';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

export interface ImagesUrlsMap {
  [index: string]: string;
}

export interface Message {
  id: string;
  username: string;
  text: string;
  date: Timestamp;
  isImage: boolean;
}

export const loginAnonymously = async (username: string) => {
  try {
    const res = await signInAnonymously(auth);

    await setDoc(doc(firestore, 'users', res.user.uid), {
      username,
    });

    logEvent(analytics, 'user_sign_in', {
      username,
    });
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(`Error signing in with code ${errorCode}: ${errorMessage}`);
  }
};

export const saveMessage = async (username: string, message: string) => {
  await addDoc(collection(firestore, 'messages'), {
    username,
    text: message,
    date: new Date(),
    isImage: false,
  });

  logEvent(analytics, 'message_written', {
    text: message,
  });
};

export const saveFile = async (file: File, username: string) => {
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);

  await addDoc(collection(firestore, 'messages'), {
    username,
    text: fileName,
    date: new Date(),
    isImage: true,
  });

  logEvent(analytics, 'file_uploaded');
};

export const getImagesURLs = async (messages: Message[]) => {
  const newImagesUrlsMap: ImagesUrlsMap = {};

  for (const message of messages) {
    if (message.isImage) {
      const imageRef = ref(storage, message.text);
      try {
        const url = await getDownloadURL(imageRef);
        newImagesUrlsMap[message.text] = url;
      } catch (e: any) {
        switch (e.code) {
          case 'storage/object-not-found':
            console.log('File does not exist.');
            break;
          case 'storage/unauthorized':
            console.log('No permission to access the file.');
            break;
          case 'storage/canceled':
            console.log('User has canceled the upload.');
            break;
          case 'storage/unknown':
            console.log('Unknown error');
            break;
        }
      }
    }
  }

  return newImagesUrlsMap;
};
