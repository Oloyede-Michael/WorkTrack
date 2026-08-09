import { useEffect, useState } from 'react';

export default function DigitalClock({ className = '' }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={className}>
      <div className="font-mono text-4xl md:text-5xl font-semibold tracking-tight tabular-nums">
        {time}
      </div>
      <div className="text-sm text-white/70 mt-1">{date} &middot; LG Server Time</div>
    </div>
  );
}
