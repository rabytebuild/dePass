import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { getEvents, Event, PaginatedResponse } from '../lib/api';

interface Props {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export default function Events({ onNavigate }: Props) {
  const [data, setData] = useState<PaginatedResponse<Event> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [page, setPage] = useState(1);

  const fetchData = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEvents(p);
      setData(res);
      setCursor(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useInput((input, key) => {
    if (key.upArrow && data) {
      setCursor((c) => Math.max(0, c - 1));
    }
    if (key.downArrow && data) {
      setCursor((c) => Math.min(data.data.length - 1, c + 1));
    }
    if (key.return && data && data.data.length > 0) {
      const event = data.data[cursor];
      onNavigate('eventDetail', { eventId: event.id });
    }
    if (key.leftArrow || input === 'p') {
      setPage((p) => Math.max(1, p - 1));
    }
    if (key.rightArrow || input === 'n') {
      if (data && page < data.last_page) {
        setPage((p) => p + 1);
      }
    }
    if (input === 'r' || input === 'R') {
      fetchData(page);
    }
    if (key.escape) {
      onNavigate('dashboard');
    }
  });

  if (loading) {
    return (
      <Box justifyContent="center" alignItems="center" height="100%">
        <Text color="cyan">
          <Spinner type="dots" /> Loading events...
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

  const events = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="gray" flexDirection="column" padding={1}>
        <Text bold color="cyan">
          Events ({total})
        </Text>

        {events.length === 0 ? (
          <Box marginTop={1}>
            <Text color="gray">No events found</Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Box width={5}>
                <Text bold color="gray">
                  ID
                </Text>
              </Box>
              <Box width={30}>
                <Text bold color="gray">
                  Name
                </Text>
              </Box>
              <Box width={14}>
                <Text bold color="gray">
                  Date
                </Text>
              </Box>
              <Box width={22}>
                <Text bold color="gray">
                  Location
                </Text>
              </Box>
              <Box width={10}>
                <Text bold color="gray">
                  Status
                </Text>
              </Box>
              <Box width={20}>
                <Text bold color="gray">
                  Organization
                </Text>
              </Box>
            </Box>

            <Box flexDirection="column">
              {events.map((event, i) => (
                <Box key={event.id} marginTop={0}>
                  <Box width={5}>
                    <Text color={cursor === i ? 'cyan' : 'white'}>
                      {event.id}
                    </Text>
                  </Box>
                  <Box width={30}>
                    <Text color={cursor === i ? 'cyan' : 'white'} bold={cursor === i}>
                      {cursor === i ? '\u203A ' : '  '}
                      {event.name.length > 27
                        ? event.name.slice(0, 27) + '...'
                        : event.name}
                    </Text>
                  </Box>
                  <Box width={14}>
                    <Text color="gray">{event.date}</Text>
                  </Box>
                  <Box width={22}>
                    <Text color="gray">
                      {event.location.length > 20
                        ? event.location.slice(0, 20) + '...'
                        : event.location}
                    </Text>
                  </Box>
                  <Box width={10}>
                    <Text
                      color={
                        event.status === 'active'
                          ? 'green'
                          : event.status === 'locked'
                            ? 'yellow'
                            : 'gray'
                      }
                    >
                      {event.status}
                    </Text>
                  </Box>
                  <Box width={20}>
                    <Text color="gray">
                      {event.organization?.name ?? 'N/A'}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          Page {page} of {lastPage} ({from}-{to} of {total}){'  '}
          {'\u2190'}/p prev  {'\u2192'}/n next  {'\u23CE'} view  r refresh  Esc back
        </Text>
      </Box>
    </Box>
  );
}
