import { useEffect, useState } from 'react';

function fetchJson(url) {
    return fetch(url, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' },
    }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });
}

function AdminCard({ title, value, subtitle }) {
    return (
        <div className="rounded-3xl border border-[#e8e5df] bg-white p-6 shadow-sm shadow-[#00000005] dark:border-[#31302b] dark:bg-[#111111]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#8a8579]">{title}</p>
            <p className="mt-4 text-3xl font-semibold text-[#1b1b18] dark:text-[#f8f4ef]">{value}</p>
            <p className="mt-3 text-sm text-[#6f6b61] dark:text-[#a9a79f]">{subtitle}</p>
        </div>
    );
}

function EventRow({ event }) {
    const eventDate = event.date || event.start_date || '-';
    const eventEnd = event.end_date || eventDate;

    return (
        <tr className="border-b border-[#ece9e1] last:border-b-0 dark:border-[#2a2923]">
            <td className="py-4 text-sm text-[#1b1b18] dark:text-[#f8f4ef]">{event.name ?? 'Unnamed Event'}</td>
            <td className="py-4 text-sm text-[#6f6b61] dark:text-[#a9a79f]">{event.status ?? '-'}</td>
            <td className="py-4 text-sm text-[#6f6b61] dark:text-[#a9a79f]">{eventDate}</td>
            <td className="py-4 text-sm text-[#6f6b61] dark:text-[#a9a79f]">{eventEnd}</td>
        </tr>
    );
}

export default function App() {
    const [events, setEvents] = useState([]);
    const [totals, setTotals] = useState({ events: 0, passes: 0, devices: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJson('/api/events')
            .then((data) => {
                const eventItems = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                setEvents(eventItems);
                setTotals((prev) => ({
                    ...prev,
                    events: data.meta?.total ?? eventItems.length,
                }));
            })
            .catch(() => setError('Unable to load events.'));

        fetchJson('/api/stats')
            .then((data) => setTotals((prev) => ({
                ...prev,
                passes: data.passes ?? prev.passes,
                devices: data.devices ?? prev.devices,
            })))
            .catch(() => {});
    }, []);

    return (
        <main className="min-h-screen bg-[#F7F5F0] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#F8F4EF]">
            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-[#9d988b] dark:text-[#b8b5ad]">Admin dashboard</p>
                        <h1 className="mt-3 text-4xl font-semibold text-[#1b1b18] dark:text-[#f8f4ef]">GatePassX operations</h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f6b61] dark:text-[#b2afa7]">
                            Monitor events, passes, packages, and approved devices from your Laravel backend.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-[#e8e5df] bg-white p-5 shadow-sm shadow-[#00000005] dark:border-[#31302b] dark:bg-[#111111]">
                        <p className="text-xs uppercase tracking-[0.24em] text-[#8a8579]">Status</p>
                        <p className="mt-3 text-2xl font-semibold text-[#1b1b18] dark:text-[#f8f4ef]">Live</p>
                        <p className="mt-2 text-sm text-[#6f6b61] dark:text-[#a9a79f]">Connected to backend APIs</p>
                    </div>
                </div>

                {error ? (
                    <div className="mt-8 rounded-3xl border border-[#f2d7d5] bg-[#fff4f2] p-6 text-sm text-[#b02a1d] dark:border-[#5f2119] dark:bg-[#2b140f] dark:text-[#f5c7bf]">
                        {error}
                    </div>
                ) : null}

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                    <AdminCard title="Events" value={totals.events} subtitle="Total event records in system" />
                    <AdminCard title="Passes" value={totals.passes} subtitle="Generated passes across events" />
                    <AdminCard title="Approved devices" value={totals.devices} subtitle="Active device bindings" />
                </div>

                <section className="mt-10 overflow-hidden rounded-[2rem] border border-[#e6e2d8] bg-white shadow-sm shadow-[#00000005] dark:border-[#2f2d27] dark:bg-[#121212]">
                    <div className="border-b border-[#ece9e1] px-6 py-5 dark:border-[#2a2923]">
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#f8f4ef]">Recent events</h2>
                        <p className="mt-1 text-sm text-[#6f6b61] dark:text-[#a9a79f]">Latest event details and schedule from your API.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm leading-6">
                            <thead className="bg-[#f2efe9] text-[#6f6b61] dark:bg-[#161615] dark:text-[#a9a79f]">
                                <tr>
                                    <th className="px-6 py-4 font-medium uppercase tracking-[0.16em]">Event</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-[0.16em]">Status</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-[0.16em]">Start</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-[0.16em]">End</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length > 0 ? events.map((event) => <EventRow key={event.id} event={event} />) : (
                                    <tr>
                                        <td className="px-6 py-6 text-sm text-[#6f6b61] dark:text-[#a9a79f]" colSpan="4">
                                            No events available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
