import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { socketService } from './services/socketService';
import { useGroupNotifications } from './hooks/useGroupNotifications';
import { useAlertNotifications } from './hooks/useAlertNotifications';

function App() {

  useGroupNotifications();
  useAlertNotifications();

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (token) {
      socketService.connect(token);
    }

  }, []);

  return <AppRouter />;
}

export default App;