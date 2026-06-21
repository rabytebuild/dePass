import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { getToken, setToken } from '../lib/api';
import Login from './Login';
import Dashboard from './Dashboard';
import Events from './Events';
import EventDetail from './EventDetail';
import Devices from './Devices';
import Passes from './Passes';

type View = 'login' | 'dashboard' | 'events' | 'eventDetail' | 'devices' | 'passes';

export default function App() {
  const [view, setView] = useState<View>(getToken() ? 'dashboard' : 'login');
  const [viewParams, setViewParams] = useState<Record<string, unknown>>({});

  const navigate = useCallback((target: string, params?: Record<string, unknown>) => {
    if (target === 'login') {
      setToken(null);
    }
    setView(target as View);
    if (params) {
      setViewParams(params);
    }
  }, []);

  if (view === 'login') {
    return (
      <Box height="100%">
        <Login onLogin={() => setView('dashboard')} />
      </Box>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'events':
        return <Events onNavigate={navigate} />;
      case 'eventDetail':
        return (
          <EventDetail
            eventId={viewParams.eventId as number}
            onBack={() => navigate('events')}
          />
        );
      case 'devices':
        return <Devices onBack={() => navigate('dashboard')} />;
      case 'passes':
        return <Passes onBack={() => navigate('dashboard')} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          {' '}dePass TUI{' '}
        </Text>
        <Text color="gray"> | </Text>
        <Text color="white">Admin Terminal</Text>
      </Box>

      <Box flexGrow={1} flexDirection="column" paddingX={1} paddingY={1}>
        {renderView()}
      </Box>
    </Box>
  );
}
