import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { login } from '../lib/api';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'username' | 'password'>('username');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
      onLogin();
    } catch (e: unknown) {
      setPassword('');
      setFocused('password');
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  useInput((input, key) => {
    if (loading) return;

    if (key.tab) {
      setFocused((f) => (f === 'username' ? 'password' : 'username'));
      return;
    }

    if (focused === 'password') {
      if (key.return) {
        handleLogin();
      } else if (key.backspace || key.delete) {
        setPassword((p) => p.slice(0, -1));
      } else if (input.length === 1 && input.charCodeAt(0) >= 32) {
        setPassword((p) => p + input);
      }
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%">
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={3}
        paddingY={2}
        flexDirection="column"
        width={60}
      >
        <Text bold color="cyan">
          dePass Login
        </Text>

        {error && (
          <Box marginTop={1}>
            <Text color="red">✗ {error}</Text>
          </Box>
        )}

        <Box flexDirection="column" marginTop={1}>
          <Text>Username:</Text>
          {focused === 'username' ? (
            <TextInput
              value={username}
              onChange={setUsername}
              onSubmit={() => username.trim() && setFocused('password')}
              placeholder="Enter username"
            />
          ) : (
            <Text color="green">{username || <Text color="gray">-</Text>}</Text>
          )}
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text>Password:</Text>
          <Box>
            {focused === 'password' ? (
              <Text color="white">
                {'\u2022'.repeat(password.length)}
                <Text backgroundColor="white" color="black">
                  {' '}
                </Text>
              </Text>
            ) : (
              <Text color={password ? 'green' : 'gray'}>
                {password ? '\u2022'.repeat(password.length) : 'Press Tab to focus'}
              </Text>
            )}
          </Box>
        </Box>

        {loading && (
          <Box marginTop={1}>
            <Text color="cyan">
              <Spinner type="dots" /> Logging in...
            </Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text color="gray">
            {focused === 'username'
              ? 'Type username, Enter to confirm, Tab for password'
              : 'Type password, Enter to login, Tab for username'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
