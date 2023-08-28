import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import './App.scss';
import routes from './routes';
import { auth, remoteConfig } from './Firebase';
import useAuth from './hooks/useAuth';
import { fetchAndActivate } from 'firebase/remote-config';

const App: React.FC = () => {
  const elements = useRoutes(routes);

  const { isLoading, isLoggedIn } = useAuth();

  const logout = async () => {
    return auth.signOut();
  };

  useEffect(() => {
    fetchAndActivate(remoteConfig)
      .then(() => {
        console.log('Successfully fetched firebase remote config data');
      })
      .catch((err) => {
        console.log('Error fetching the firebase remote config data', err);
      });
  }, []);

  return (
    <div className='App'>
      {isLoading && <div>Loading...</div>}
      {isLoggedIn && (
        <button className='logout-button' onClick={logout}>
          Logout
        </button>
      )}
      {elements}
    </div>
  );
};

export default App;
