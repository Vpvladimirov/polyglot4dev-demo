import './Chat.scss';
import send from '../assets/send.svg';
import upload from '../assets/upload.svg';
import { useEffect, useState } from 'react';
import { analytics, auth, firestore, remoteConfig, storage } from '../Firebase';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { getValue } from 'firebase/remote-config';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

interface Message {
  id: string;
  username: string;
  text: string;
  date: Timestamp;
  isImage: boolean;
}

interface ImagesUrlsMap {
  [index: string]: string;
}

const Chat = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [myUsername, setMyUsername] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagesUrlsMap, setImagesUrlsMap] = useState<ImagesUrlsMap>({});

  const chatTitle = getValue(remoteConfig, 'chat_title').asString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newMessage) {
      await addDoc(collection(firestore, 'messages'), {
        username: myUsername,
        text: newMessage,
        date: new Date(),
        isImage: false,
      });

      logEvent(analytics, 'message_written', {
        text: newMessage,
      });
    }

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);

      await addDoc(collection(firestore, 'messages'), {
        username: myUsername,
        text: fileName,
        date: new Date(),
        isImage: true,
      });

      logEvent(analytics, 'file_uploaded');
    }

    setNewMessage('');
    setFile(null);
  };

  const fetchImagesURLs = async (messages: Message[]) => {
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

    setImagesUrlsMap(newImagesUrlsMap);
  };

  const sortByDate = (a: Message, b: Message) => {
    if (a.date.seconds < b.date.seconds) {
      return 1;
    }
    if (a.date.seconds > b.date.seconds) {
      return -1;
    }
    return 0;
  };

  useEffect(() => {
    const fetchUsername = async () => {
      if (!auth.currentUser) {
        return;
      }

      const docSnapshot = await getDoc(
        doc(firestore, 'users', auth.currentUser?.uid)
      );

      if (docSnapshot.exists()) {
        const user = docSnapshot.data();
        console.log('Document data:', user);
        setMyUsername(user.username);
      } else {
        console.log('The user does not exist!');
      }
    };

    fetchUsername();

    const unsubscribe = onSnapshot(
      collection(firestore, 'messages'),
      (querySnapshot) => {
        let newMessages: any[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        newMessages = newMessages.sort(sortByDate);
        setAllMessages(newMessages);
        fetchImagesURLs(newMessages);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className='chat-container'>
      <h1>{chatTitle}</h1>
      <div className='chat'>
        <div className='messages-container'>
          {allMessages.map((message) => (
            <div
              className='message'
              key={message.id}
              title={message.date.toDate().toLocaleString()}
            >
              <span className='username'>{message.username}</span>
              {message.isImage ? (
                <img src={imagesUrlsMap[message.text]} alt={message.text} />
              ) : (
                <span>{message.text}</span>
              )}
            </div>
          ))}
        </div>
        <div className='bottom-container'>
          <form onSubmit={sendMessage}>
            <div className='upload-container'>
              <label htmlFor='upload-photo'>
                <span className='upload-title'>
                  {file ? file.name : 'Upload'}
                </span>
                <img src={upload} alt='upload' />
              </label>
              <input
                type='file'
                name='photo'
                accept='image/*'
                id='upload-photo'
                onChange={handleFileChange}
              />
            </div>
            <input
              type='text'
              placeholder='Send a message'
              value={newMessage}
              onChange={handleChange}
              autoFocus
            />
            <button type='submit'>
              <img src={send} alt='send' />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
