import React from 'react';
import { useRoutes } from 'react-router-dom';
import './App.css';
import routes from './routes';

const App: React.FC = () => {
  const elements = useRoutes(routes);

  return <div className='App'>{elements}</div>;
};

export default App;
