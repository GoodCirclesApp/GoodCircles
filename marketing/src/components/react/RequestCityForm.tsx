import { useState } from 'react';
import { submitWaitlist } from '../../lib/api';
import { trackSignup } from '../../lib/analytics';

// "Request Good Circles in [City]" capture. Posts to the existing waitlist API
// (which already accepts city/state) — no backend changes. Each submission is
// a weighted vote for where to expand.
interface Props {
  defaultCity?: string;
  defaultState?: string;
}

export default function RequestCityForm({ defaultCity = '', defaultState = '' }: Props) {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [state, setState] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !city) {
      setError('Please enter your email and your city.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitWaitlist({ role: 'NEIGHBOR', email, city, state: state || undefined });
      trackSignup('REQUEST_CITY', { city, state });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="p-8 rounded-3xl text-center" style={{ background: '#edf8f2', border: '1px solid #bbe3cf' }}>
        <p className="font-black text-slate-900 text-xl mb-2">
          {city} is on the map. You're in line.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
          We'll email you when Good Circles gets closer to {city} — and you'll get early founding
          access when it launches. Want it sooner? Tell a neighbor to request {city} too.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        aria-label="Your email address"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-6 py-4 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-400/30 text-base font-medium placeholder-slate-400 transition-all"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          aria-label="Your city"
          placeholder="Your city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-400/30 text-base font-medium placeholder-slate-400 transition-all"
        />
        <input
          type="text"
          aria-label="State (optional)"
          placeholder="State (optional)"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-400/30 text-base font-medium placeholder-slate-400 transition-all"
        />
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #7851A9, #5B3D8F)' }}
      >
        {loading ? 'Adding your city…' : 'Request your city (free) →'}
      </button>
      <p className="text-center text-xs text-slate-400" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
        Free. One email when your city moves up the list. Unsubscribe anytime.
      </p>
    </form>
  );
}
