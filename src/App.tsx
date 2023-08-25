import React from 'react';
import { useRoutes } from 'react-router-dom';
import './App.scss';
import routes from './routes';
import { auth } from './Firebase';
import useAuth from './hooks/useAuth';

const App: React.FC = () => {
  const elements = useRoutes(routes);

  const { isLoading, isLoggedIn } = useAuth();

  const logout = async () => {
    return auth.signOut();
  };

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
