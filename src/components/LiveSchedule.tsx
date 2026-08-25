import { useEffect, useState } from 'react';
import { getTodayTimetable, type TimetableEntry } from '../lib/timetable';

export function LiveSchedule() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getTodayTimetable().then((result: any) => {
      if (!alive) return;
      if (result.error) setError(result.error.message || 'Unable to load schedule.');
      else setEntries((result.data || []) as TimetableEntry[]);
      setLoading(false);
    }).catch((e) => {
      if (!alive) return;
      setError(e instanceof Error ? e.message : 'Unable to load schedule.');
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  return <div className="panel"><div className="panel-head"><b>Today's schedule</b><span>Live</span></div>{error ? <div className="ops-error">Unable to load today's schedule: {error}</div> : loading ? <div className="empty-state">Loading schedule…</div> : entries.length ? entries.map((entry) => <div className="class-row" key={entry.id}><b>{entry.start_time.slice(0,5)} {entry.subjects?.name || 'Class'}</b><small>{entry.room || entry.classes?.name || '—'}</small></div>) : <div className="empty-state">No classes scheduled today.</div>}</div>;
}
