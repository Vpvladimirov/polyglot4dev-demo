import { useNavigate } from 'react-router-dom';
import './Home.scss';
import { useState } from 'react';
import { loginAnonymously } from '../firebase-utils';

const Home = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username) {
      alert('Username is required!');
      return;
    }

    await loginAnonymously(username);

    navigate('/chat');
  };

  return (
    <div className='home-container'>
      <h1>Polyglot4dev chat app with firebase</h1>
      <div className='input-container'>
        <form onSubmit={signIn}>
          <input
            type='text'
            placeholder='Username*'
            value={username}
            onChange={handleChange}
          />
          <button type='submit'>Enter the chat</button>
        </form>
      </div>
    </div>
  );
};

export default Home;
