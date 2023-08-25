import './Chat.scss';
import send from '../assets/send.svg';
import { useState } from 'react';

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('newMessage', newMessage);
    setNewMessage('');
  };

  return (
    <div className='chat-container'>
      <h1>Chat room</h1>
      <div className='chat'>
        <div>This is a message</div>
        <div className='bottom-container'>
          <form onSubmit={sendMessage}>
            <input
              type='text'
              placeholder='Send a message'
              value={newMessage}
              onChange={handleChange}
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
