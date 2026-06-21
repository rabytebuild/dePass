import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { getStats, getAdminDashboard, StatsResponse } from '../lib/api';

interface Props {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [adminData, setAdminData] = useState<Record<string, unknown> | null>(null);

  const menuItems = [
    { label: 'View Events', action: () => onNavigate('events') },
    { label: 'Manage Devices', action: () => onNavigate('devices') },
    { label: 'Manage Passes', action: () => onNavigate('passes') },
    { label: 'Logout', action: () => onNavigate('login') },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, admin] = await Promise.allSettled([
        getStats(),
        getAdminDashboard(),
      ]);

      if (s.status === 'fulfilled') {
        setStats(s.value);
      } else {
        setStats({ events: 0, passes: 0, devices: 0, pending_devices: 0, templates: 0 });
      }

      if (admin.status === 'fulfilled') {
        setAdminData(admin.value as unknown as Record<string, unknown>);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useInput((input, key) => {
    if (key.upArrow) setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) setCursor((c) => Math.min(menuItems.length - 1, c + 1));
    if (key.return) menuItems[cursor].action();
    if (input === 'r' || input === 'R') fetchData();
  });

  if (loading) {
    return (
      <Box justifyContent="center" alignItems="center" height="100%">
        <Text color="cyan">
          <Spinner type="dots" /> Loading dashboard...
        </Text>
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Text color="red">✗ {error}</Text>
        <Text color="gray">Press 'r' to retry</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="gray" flexDirection="column" padding={1}>
        <Text bold color="cyan">
          Dashboard Overview
        </Text>
        <Box marginTop={1}>
          <StatBox label="Events" value={stats?.events ?? 0} color="blue" />
          <StatBox label="Passes" value={stats?.passes ?? 0} color="green" />
          <StatBox
            label="Devices (Approved)"
            value={stats?.devices ?? 0}
            color="cyan"
          />
          <StatBox
            label="Pending Devices"
            value={stats?.pending_devices ?? 0}
            color="yellow"
          />
          <StatBox label="Templates" value={stats?.templates ?? 0} color="magenta" />
        </Box>
      </Box>

      {adminData && (
        <Box
          borderStyle="single"
          borderColor="gray"
          flexDirection="column"
          padding={1}
          marginTop={1}
        >
          <Text bold color="cyan">
            System Features
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {Object.entries(
              (adminData as Record<string, Record<string, unknown>>).features || {},
            ).map(([key, value]) => (
              <Text key={key}>
                <Text color="gray">  {key}: </Text>
                <Text color="green">{String(value)}</Text>
              </Text>
            ))}
          </Box>
        </Box>
      )}

      <Box
        borderStyle="single"
        borderColor="gray"
        flexDirection="column"
        padding={1}
        marginTop={1}
      >
        <Text bold color="cyan">
          Quick Actions
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {menuItems.map((item, i) => (
            <Text key={item.label} color={cursor === i ? 'cyan' : 'white'}>
              {cursor === i ? '\u203A ' : '  '}
              <Text bold={cursor === i}>{item.label}</Text>
            </Text>
          ))}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          {'\u2191'}{'\u2193'} Navigate  {'\u23CE'} Select  r Refresh  q Back
        </Text>
      </Box>
    </Box>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      borderStyle="single"
      borderColor={color}
      marginRight={1}
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      alignItems="center"
      minWidth={22}
    >
      <Text bold color="white">
        {value}
      </Text>
      <Text color={color}>{label}</Text>
    </Box>
  );
}
