import Chat from './pages/Chat';
import Home from './pages/Home';

const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/chat',
    element: <Chat />,
  },
];

export default routes;
