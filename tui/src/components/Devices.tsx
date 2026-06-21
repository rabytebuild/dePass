import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { getDevices, approveDevice, revokeDevice, Device, PaginatedResponse } from '../lib/api';

interface Props {
  onBack: () => void;
}

export default function Devices({ onBack }: Props) {
  const [data, setData] = useState<PaginatedResponse<Device> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDevices(p);
      setData(res);
      setCursor(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleApprove = async () => {
    if (!data || data.data.length === 0) return;
    const device = data.data[cursor];
    if (device.status !== 'pending') {
      setMessage({ type: 'error', text: 'Device is not pending' });
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      await approveDevice(device.id);
      setMessage({ type: 'success', text: 'Device approved successfully' });
      fetchData(page);
    } catch (e: unknown) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to approve' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!data || data.data.length === 0) return;
    const device = data.data[cursor];
    if (device.status !== 'approved') {
      setMessage({ type: 'error', text: 'Only approved devices can be revoked' });
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      await revokeDevice(device.id);
      setMessage({ type: 'success', text: 'Device revoked successfully' });
      fetchData(page);
    } catch (e: unknown) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to revoke' });
    } finally {
      setActionLoading(false);
    }
  };

  useInput((input, key) => {
    if (actionLoading) return;

    if (key.upArrow && data) {
      setCursor((c) => Math.max(0, c - 1));
    }
    if (key.downArrow && data) {
      setCursor((c) => Math.min(data.data.length - 1, c + 1));
    }
    if (key.leftArrow || input === 'p') {
      setPage((p) => Math.max(1, p - 1));
    }
    if (key.rightArrow || input === 'n') {
      if (data && page < data.last_page) {
        setPage((p) => p + 1);
      }
    }
    if (input === 'a' || input === 'A') {
      handleApprove();
    }
    if (input === 'r' || input === 'R') {
      if (key.escape === undefined) {
        handleRevoke();
      }
    }
    if (key.escape) {
      onBack();
    }
  });

  if (loading) {
    return (
      <Box justifyContent="center" alignItems="center" height="100%">
        <Text color="cyan">
          <Spinner type="dots" /> Loading devices...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Text color="red">✗ {error}</Text>
        <Text color="gray">Esc to go back</Text>
      </Box>
    );
  }

  const devices = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="gray" flexDirection="column" padding={1}>
        <Text bold color="cyan">
          Devices ({total})
        </Text>

        {message && (
          <Box marginTop={1}>
            <Text color={message.type === 'success' ? 'green' : 'red'}>
              {message.type === 'success' ? '\u2713' : '\u2717'} {message.text}
            </Text>
          </Box>
        )}

        {actionLoading && (
          <Box marginTop={1}>
            <Text color="cyan">
              <Spinner type="dots" /> Processing...
            </Text>
          </Box>
        )}

        {devices.length === 0 ? (
          <Box marginTop={1}>
            <Text color="gray">No devices found</Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Box width={6}>
                <Text bold color="gray">
                  ID
                </Text>
              </Box>
              <Box width={38}>
                <Text bold color="gray">
                  UUID
                </Text>
              </Box>
              <Box width={10}>
                <Text bold color="gray">
                  Status
                </Text>
              </Box>
              <Box width={18}>
                <Text bold color="gray">
                  User
                </Text>
              </Box>
              <Box width={18}>
                <Text bold color="gray">
                  Approver
                </Text>
              </Box>
            </Box>

            {devices.map((device, i) => (
              <Box key={device.id} marginTop={0}>
                <Box width={6}>
                  <Text color={cursor === i ? 'cyan' : 'white'}>
                    {cursor === i ? '\u203A ' : '  '}
                    {device.id}
                  </Text>
                </Box>
                <Box width={38}>
                  <Text color="gray" dimColor>
                    {device.uuid.substring(0, 36)}
                  </Text>
                </Box>
                <Box width={10}>
                  <Text
                    color={
                      device.status === 'approved'
                        ? 'green'
                        : device.status === 'pending'
                          ? 'yellow'
                          : 'red'
                    }
                  >
                    {device.status}
                  </Text>
                </Box>
                <Box width={18}>
                  <Text color="gray">{device.user?.name ?? '-'}</Text>
                </Box>
                <Box width={18}>
                  <Text color="gray">{device.approver?.name ?? '-'}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          Page {page} of {lastPage} ({from}-{to} of {total}){'  '}
          {'\u2191'}{'\u2193'} select  a approve  r revoke  {'\u23CE'} Esc back
        </Text>
      </Box>
    </Box>
  );
}
