import { useEffect, useState } from 'react';
import { auth } from '../Firebase';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });
  }, []);

  return {
    isLoading,
    isLoggedIn,
  };
};

export default useAuth;
