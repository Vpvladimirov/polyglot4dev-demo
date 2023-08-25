import ProtectedRoute from './components/ProtectedRoute';
import Chat from './pages/Chat';
import Home from './pages/Home';

const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
];

export default routes;
