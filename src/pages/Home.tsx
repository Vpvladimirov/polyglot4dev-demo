import { useNavigate } from 'react-router-dom';
import './Home.scss';
import { signInAnonymously } from 'firebase/auth';
import { auth, firestore } from '../Firebase';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const signIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username) {
      alert('Username is required!');
      return;
    }

    signInAnonymously(auth)
      .then(async (param) => {
        await setDoc(doc(firestore, 'users', param.user.uid), {
          username,
        });

        navigate('/chat');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`Error signing in with code ${errorCode}: ${errorMessage}`);
      });
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
