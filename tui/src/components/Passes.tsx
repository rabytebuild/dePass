import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import {
  getEvents,
  getEventPasses,
  bulkGeneratePasses,
  Event,
  Pass,
  PaginatedResponse,
} from '../lib/api';

interface Props {
  onBack: () => void;
}

type Phase = 'select-event' | 'show-passes' | 'bulk-generate';

export default function Passes({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('select-event');

  // Event selection
  const [eventsData, setEventsData] = useState<PaginatedResponse<Event> | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventCursor, setEventCursor] = useState(0);

  // Passes
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [passesData, setPassesData] = useState<PaginatedResponse<Pass> | null>(null);
  const [passesLoading, setPassesLoading] = useState(false);
  const [passesError, setPassesError] = useState<string | null>(null);
  const [passCursor, setPassCursor] = useState(0);
  const [passPage, setPassPage] = useState(1);

  // Bulk generate
  const [bulkCount, setBulkCount] = useState('');
  const [bulkPrefix, setBulkPrefix] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [bulkFocused, setBulkFocused] = useState<'count' | 'prefix'>('count');

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await getEvents(1);
      setEventsData(res);
    } catch (e: unknown) {
      setEventsError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchPasses = async (eventId: number, page: number) => {
    setPassesLoading(true);
    setPassesError(null);
    try {
      const res = await getEventPasses(eventId, page);
      setPassesData(res);
      setPassCursor(0);
    } catch (e: unknown) {
      setPassesError(e instanceof Error ? e.message : 'Failed to load passes');
    } finally {
      setPassesLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setPassPage(1);
    setPhase('show-passes');
    fetchPasses(event.id, 1);
  };

  const handleBulkGenerate = async () => {
    if (!selectedEvent) return;
    const count = parseInt(bulkCount, 10);
    if (!count || count < 1 || count > 100) return;

    const eventPassTypes =
      selectedEvent.pass_types && selectedEvent.pass_types.length > 0
        ? selectedEvent.pass_types
        : null;

    if (!eventPassTypes) {
      setBulkResult('No pass types available for this event. Create pass types first.');
      return;
    }

    setBulkLoading(true);
    setBulkResult(null);

    try {
      const passes = Array.from({ length: count }, (_, i) => ({
        pass_type_id: eventPassTypes[0].id,
        attendee_name: bulkPrefix.trim()
          ? `${bulkPrefix.trim()} ${i + 1}`
          : `Attendee ${i + 1}`,
      }));

      const res = await bulkGeneratePasses(selectedEvent.id, passes);
      setBulkResult(`Generated ${res.generated_count} passes successfully`);
      setPhase('show-passes');
      fetchPasses(selectedEvent.id, 1);
    } catch (e: unknown) {
      setBulkResult(
        e instanceof Error ? e.message : 'Failed to generate passes',
      );
    } finally {
      setBulkLoading(false);
      setBulkCount('');
      setBulkPrefix('');
    }
  };

  // Event selection input
  useInput(
    (input, key) => {
      if (phase === 'select-event') {
        if (key.upArrow && eventsData) {
          setEventCursor((c) => Math.max(0, c - 1));
        }
        if (key.downArrow && eventsData) {
          setEventCursor((c) => Math.min(eventsData.data.length - 1, c + 1));
        }
        if (key.return && eventsData && eventsData.data.length > 0) {
          handleSelectEvent(eventsData.data[eventCursor]);
        }
        if (key.escape) onBack();
      }
    },
    { isActive: phase === 'select-event' },
  );

  // Passes view input
  useInput(
    (input, key) => {
      if (phase === 'show-passes') {
        if (key.upArrow && passesData) {
          setPassCursor((c) => Math.max(0, c - 1));
        }
        if (key.downArrow && passesData) {
          setPassCursor((c) => Math.min(passesData.data.length - 1, c + 1));
        }
        if (key.leftArrow || input === 'p') {
          setPassPage((p) => {
            const newPage = Math.max(1, p - 1);
            if (selectedEvent) fetchPasses(selectedEvent.id, newPage);
            return newPage;
          });
        }
        if (key.rightArrow || input === 'n') {
          if (passesData && passPage < passesData.last_page) {
            setPassPage((p) => {
              const newPage = p + 1;
              if (selectedEvent) fetchPasses(selectedEvent.id, newPage);
              return newPage;
            });
          }
        }
        if (input === 'b' || input === 'B') {
          setPhase('bulk-generate');
          setBulkCount('');
          setBulkPrefix('');
          setBulkResult(null);
          setBulkFocused('count');
        }
        if (key.escape) {
          setPhase('select-event');
          setSelectedEvent(null);
          setPassesData(null);
        }
      }
    },
    { isActive: phase === 'show-passes' },
  );

  // Bulk generate input
  useInput(
    (input, key) => {
      if (phase === 'bulk-generate') {
        if (bulkLoading) return;

        if (bulkFocused === 'count') {
          if (key.return) {
            if (bulkCount && parseInt(bulkCount, 10) > 0) {
              setBulkFocused('prefix');
            }
          } else if (key.backspace || key.delete) {
            setBulkCount((c) => c.slice(0, -1));
          } else if (
            input.length === 1 &&
            input >= '0' &&
            input <= '9'
          ) {
            setBulkCount((c) => c + input);
          }
        } else if (bulkFocused === 'prefix') {
          if (key.return) {
            handleBulkGenerate();
          } else if (key.backspace || key.delete) {
            setBulkPrefix((p) => p.slice(0, -1));
          } else if (input.length === 1 && input.charCodeAt(0) >= 32) {
            setBulkPrefix((p) => p + input);
          }
        }

        if (key.escape) {
          setPhase('show-passes');
        }
      }
    },
    { isActive: phase === 'bulk-generate' },
  );

  // Phase 1: Select Event
  if (phase === 'select-event') {
    if (eventsLoading) {
      return (
        <Box justifyContent="center" alignItems="center" height="100%">
          <Text color="cyan">
            <Spinner type="dots" /> Loading events...
          </Text>
        </Box>
      );
    }

    if (eventsError) {
      return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Text color="red">\u2717 {eventsError}</Text>
          <Text color="gray">Esc to go back</Text>
        </Box>
      );
    }

    const events = eventsData?.data ?? [];

    return (
      <Box flexDirection="column">
        <Box borderStyle="single" borderColor="gray" flexDirection="column" padding={1}>
          <Text bold color="cyan">
            Select Event to Manage Passes
          </Text>

          {events.length === 0 ? (
            <Box marginTop={1}>
              <Text color="gray">No events available</Text>
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
                <Box width={10}>
                  <Text bold color="gray">
                    Status
                  </Text>
                </Box>
              </Box>

              {events.map((event, i) => (
                <Box key={event.id} marginTop={0}>
                  <Box width={5}>
                    <Text color={eventCursor === i ? 'cyan' : 'white'}>
                      {event.id}
                    </Text>
                  </Box>
                  <Box width={30}>
                    <Text
                      color={eventCursor === i ? 'cyan' : 'white'}
                      bold={eventCursor === i}
                    >
                      {eventCursor === i ? '\u203A ' : '  '}
                      {event.name.length > 27
                        ? event.name.slice(0, 27) + '...'
                        : event.name}
                    </Text>
                  </Box>
                  <Box width={14}>
                    <Text color="gray">{event.date}</Text>
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
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box marginTop={1}>
          <Text color="gray">
            {'\u2191'}{'\u2193'} select  {'\u23CE'} choose  Esc back
          </Text>
        </Box>
      </Box>
    );
  }

  // Phase 2: Show Passes
  if (phase === 'show-passes') {
    if (passesLoading) {
      return (
        <Box justifyContent="center" alignItems="center" height="100%">
          <Text color="cyan">
            <Spinner type="dots" /> Loading passes...
          </Text>
        </Box>
      );
    }

    if (passesError) {
      return (
        <Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Text color="red">\u2717 {passesError}</Text>
          <Text color="gray">Esc to go back</Text>
        </Box>
      );
    }

    const passes = passesData?.data ?? [];
    const total = passesData?.total ?? 0;
    const lastPage = passesData?.last_page ?? 1;
    const from = passesData?.from ?? 0;
    const to = passesData?.to ?? 0;

    return (
      <Box flexDirection="column">
        <Box borderStyle="single" borderColor="cyan" flexDirection="column" padding={1}>
          <Text bold color="cyan">
            Passes for: {selectedEvent?.name ?? `Event #${selectedEvent?.id}`}
          </Text>

          {passes.length === 0 ? (
            <Box marginTop={1}>
              <Text color="gray">No passes yet. Press 'b' to bulk generate.</Text>
            </Box>
          ) : (
            <Box flexDirection="column" marginTop={1}>
              <Box>
                <Box width={6}>
                  <Text bold color="gray">
                    ID
                  </Text>
                </Box>
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
                <Box width={14}>
                  <Text bold color="gray">
                    Type
                  </Text>
                </Box>
              </Box>

              {passes.map((pass, i) => (
                <Box key={pass.id} marginTop={0}>
                  <Box width={6}>
                    <Text color={passCursor === i ? 'cyan' : 'white'}>
                      {passCursor === i ? '\u203A ' : '  '}
                      {pass.id}
                    </Text>
                  </Box>
                  <Box width={20}>
                    <Text color="gray" dimColor>
                      {pass.pass_uid.substring(0, 16)}
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
                  <Box width={14}>
                    <Text color="gray">{pass.pass_type?.name ?? '-'}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box marginTop={1}>
          <Text color="gray">
            Page {passPage} of {lastPage} ({from}-{to} of {total}){'  '}
            {'\u2191'}{'\u2193'} select  {'\u2190'}/p prev  {'\u2192'}/n next  b bulk  Esc back
          </Text>
        </Box>
      </Box>
    );
  }

  // Phase 3: Bulk Generate
  if (phase === 'bulk-generate') {
    return (
      <Box flexDirection="column">
        <Box
          borderStyle="single"
          borderColor="cyan"
          flexDirection="column"
          padding={2}
          width={60}
        >
          <Text bold color="cyan">
            Bulk Generate Passes
          </Text>
          <Box marginTop={1}>
            <Text color="gray">
              Event: {selectedEvent?.name}
            </Text>
          </Box>

          {bulkResult && (
            <Box marginTop={1}>
              <Text color={bulkResult.includes('success') ? 'green' : 'red'}>
                {bulkResult}
              </Text>
            </Box>
          )}

          {bulkLoading && (
            <Box marginTop={1}>
              <Text color="cyan">
                <Spinner type="dots" /> Generating passes...
              </Text>
            </Box>
          )}

          <Box flexDirection="column" marginTop={1}>
            <Text>Number of passes (1-100):</Text>
            <Text>
              {bulkCount || (
                <Text color="gray">Enter number</Text>
              )}
              {bulkFocused === 'count' && (
                <Text backgroundColor="white" color="black">
                  {' '}
                </Text>
              )}
            </Text>
          </Box>

          <Box flexDirection="column" marginTop={1}>
            <Text>Attendee name prefix (optional):</Text>
            <Text>
              {bulkPrefix || (
                <Text color="gray">Enter prefix (e.g. "Guest")</Text>
              )}
              {bulkFocused === 'prefix' && (
                <Text backgroundColor="white" color="black">
                  {' '}
                </Text>
              )}
            </Text>
          </Box>

          <Box marginTop={2}>
            <Text color="gray">
              Enter count, press Enter, enter prefix (optional), press Enter to generate.
              {'\n'}Esc to cancel.
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
}
