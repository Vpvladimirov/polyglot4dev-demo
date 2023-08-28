import './Chat.scss';
import send from '../assets/send.svg';
import { useEffect, useState } from 'react';
import { analytics, auth, firestore, remoteConfig } from '../Firebase';
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

interface Message {
  id: string;
  username: string;
  text: string;
  date: Timestamp;
}

const Chat = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [myUsername, setMyUsername] = useState('');

  const chatTitle = getValue(remoteConfig, 'chat_title').asString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await await addDoc(collection(firestore, 'messages'), {
      username: myUsername,
      text: newMessage,
      date: new Date(),
    });

    logEvent(analytics, 'message_written', {
      text: newMessage,
    });

    setNewMessage('');
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
        console.log('newMessages', newMessages);
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
              <span>{message.text}</span>
            </div>
          ))}
        </div>
        <div className='bottom-container'>
          <form onSubmit={sendMessage}>
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
