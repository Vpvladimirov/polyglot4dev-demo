import { useNavigate } from 'react-router-dom';
import './Home.scss';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='home-container'>
      <h1>Polyglot4dev chat app with firebase</h1>
      <div>
        <button onClick={() => navigate('/chat')}>Enter the chat</button>
      </div>
    </div>
  );
};

export default Home;
