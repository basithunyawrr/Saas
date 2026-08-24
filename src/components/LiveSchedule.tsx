import { useEffect, useState } from 'react';
import { getTodaySchedule } from '../lib/timetable';

type Entry = { id: string; start_time: string; end_time: string; room: string | null; subject?: { name?: string } | null; class?: { name?: string } | null };

export function LiveSchedule() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getTodaySchedule().then((result: any) => {
      if (result.error) setError(result.error.message || 'Unable to load schedule.');
      else setEntries(result.data || []);
      setLoading(false);
    });
  }, []);
  return <div className="panel"><div className="panel-head"><b>Today's schedule</b><span>Live</span></div>{error ? <div className="ops-error">Unable to load today's schedule: {error}</div> : loading ? <div className="empty-state">Loading schedule…</div> : entries.length ? entries.map((entry) => <div className="class-row" key={entry.id}><b>{entry.start_time.slice(0,5)} {entry.subject?.name || 'Class'}</b><small>{entry.room || entry.class?.name || '—'}</small></div>) : <div className="empty-state">No classes scheduled today.</div>}</div>;
}
