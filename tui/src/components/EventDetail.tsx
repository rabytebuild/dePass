import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { getEvent, Event } from '../lib/api';

interface Props {
  eventId: number;
  onBack: () => void;
}

export default function EventDetail({ eventId, onBack }: Props) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEvent(eventId);
      setEvent(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack();
    }
    if (input === 'r' || input === 'R') {
      fetchData();
    }
  });

  if (loading) {
    return (
      <Box justifyContent="center" alignItems="center" height="100%">
        <Text color="cyan">
          <Spinner type="dots" /> Loading event...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Text color="red">✗ {error}</Text>
        <Text color="gray">Press 'r' to retry, Esc to go back</Text>
      </Box>
    );
  }

  if (!event) return null;

  const passes = event.passes ?? [];
  const passTypes = event.pass_types ?? [];

  const statusColor =
    event.status === 'active'
      ? 'green'
      : event.status === 'locked'
        ? 'yellow'
        : 'gray';

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="cyan" flexDirection="column" padding={1}>
        <Text bold color="cyan">
          {event.name}
        </Text>

        <Box marginTop={1}>
          <Box flexDirection="column" marginRight={4}>
            <Text>
              <Text color="gray">Date: </Text>
              {event.date}
            </Text>
            <Text>
              <Text color="gray">Location: </Text>
              {event.location}
            </Text>
          </Box>
          <Box flexDirection="column">
            <Text>
              <Text color="gray">Status: </Text>
              <Text color={statusColor}>{event.status}</Text>
            </Text>
            <Text>
              <Text color="gray">Organization: </Text>
              {event.organization?.name ?? 'N/A'}
            </Text>
          </Box>
        </Box>
      </Box>

      {passTypes.length > 0 && (
        <Box
          borderStyle="single"
          borderColor="gray"
          flexDirection="column"
          padding={1}
          marginTop={1}
        >
          <Text bold color="cyan">
            Pass Types
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {passTypes.map((pt) => (
              <Text key={pt.id}>
                <Text color="white">{pt.name}</Text>
                {pt.price !== null && (
                  <Text color="gray"> ({pt.price} {pt.max_quantity ? `/ ${pt.max_quantity}` : ''})</Text>
                )}
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
          Passes ({passes.length})
        </Text>

        {passes.length === 0 ? (
          <Box marginTop={1}>
            <Text color="gray">No passes for this event</Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Box width={20}>
                <Text bold color="gray">
                  UID
                </Text>
              </Box>
              <Box width={20}>
                <Text bold color="gray">
                  Attendee
                </Text>
              </Box>
              <Box width={16}>
                <Text bold color="gray">
                  Company
                </Text>
              </Box>
              <Box width={10}>
                <Text bold color="gray">
                  Status
                </Text>
              </Box>
              <Box width={8}>
                <Text bold color="gray">
                  Scans
                </Text>
              </Box>
              <Box width={16}>
                <Text bold color="gray">
                  Pass Type
                </Text>
              </Box>
            </Box>

            {passes.map((pass) => (
              <Box key={pass.id} marginTop={0}>
                <Box width={20}>
                  <Text color="gray" dimColor>
                    {pass.pass_uid}
                  </Text>
                </Box>
                <Box width={20}>
                  <Text>{pass.attendee_name ?? '-'}</Text>
                </Box>
                <Box width={16}>
                  <Text color="gray">{pass.company ?? '-'}</Text>
                </Box>
                <Box width={10}>
                  <Text
                    color={
                      pass.status === 'active'
                        ? 'green'
                        : pass.status === 'used'
                          ? 'blue'
                          : 'red'
                    }
                  >
                    {pass.status}
                  </Text>
                </Box>
                <Box width={8}>
                  <Text color="gray">{pass.scan_count}</Text>
                </Box>
                <Box width={16}>
                  <Text color="gray">{pass.pass_type?.name ?? '-'}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Esc back  r Refresh</Text>
      </Box>
    </Box>
  );
}
