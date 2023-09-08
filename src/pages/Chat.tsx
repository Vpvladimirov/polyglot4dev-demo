import './Chat.scss';
import send from '../assets/send.svg';
import upload from '../assets/upload.svg';
import { useEffect, useState } from 'react';
import { auth, firestore, remoteConfig } from '../Firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getValue } from 'firebase/remote-config';
import {
  ImagesUrlsMap,
  Message,
  getImagesURLs,
  saveFile,
  saveMessage,
} from '../firebase-utils';

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
      await saveMessage(myUsername, newMessage);
    }

    if (file) {
      await saveFile(file, myUsername);
    }

    setNewMessage('');
    setFile(null);
  };

  const fetchImagesURLs = async (messages: Message[]) => {
    const newImagesUrlsMap = await getImagesURLs(messages);

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
  }, []);

  useEffect(() => {
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
  );
};

export default Chat;
