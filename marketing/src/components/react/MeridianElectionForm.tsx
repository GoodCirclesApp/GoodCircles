// Meridian early-access election form (2026-07-06).
// HONESTY RULES baked in: the ballot comes ONLY from the curated seed lists
// (dropdown/chips — no free text into live lists); the optional suggestion
// box files to a moderated queue; and NOTHING here shows signup counts, vote
// totals, rankings, or any traction signal. "X of 10 picked" refers only to
// the member's own selections.
import { useEffect, useMemo, useState } from 'react';
import { getElectionSeeds, submitElection, type SeedNonprofit, type SeedBusiness } from '../../lib/api';
import { trackSignup } from '../../lib/analytics';

const NP_CATEGORY_LABELS: Record<string, string> = {
  arts: 'Arts & culture',
  youth: 'Youth & education',
  food: 'Food security',
  health: 'Health',
  housing: 'Housing & shelter',
  animals: 'Animals',
  'faith-based-service': 'Faith-based service',
  church: 'Churches & congregations',
  'civic-association': 'Civic clubs & associations',
  other: 'Community & more',
};

const BIZ_CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurants',
  coffee: 'Coffee & cafés',
  retail: 'Retail & shops',
  services: 'Services & trades',
  'salon-spa': 'Salons, spas & barbers',
  fitness: 'Fitness & movement',
  auto: 'Auto',
  entertainment: 'Entertainment & recreation',
  'health-wellness': 'Health & wellness',
  'home-garden': 'Home & garden',
  'grocery-market': 'Groceries & markets',
  'home-trades': 'Home services & trades',
  other: 'More local favorites',
};

function groupBy<T extends { category: string }>(items: T[], labels: Record<string, string>) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const label = labels[item.category] ?? item.category;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function MeridianElectionForm() {
  const [nonprofits, setNonprofits] = useState<SeedNonprofit[]>([]);
  const [businesses, setBusinesses] = useState<SeedBusiness[]>([]);
  const [loadError, setLoadError] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [nonprofitId, setNonprofitId] = useState('');
  const [npSearch, setNpSearch] = useState('');
  const [npOpen, setNpOpen] = useState(false);
  const [businessIds, setBusinessIds] = useState<string[]>([]);
  const [bizSearch, setBizSearch] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestType, setSuggestType] = useState<'nonprofit' | 'business'>('business');
  const [suggestName, setSuggestName] = useState('');
  const [suggestNote, setSuggestNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ageOk, setAgeOk] = useState(false); // 16+ attestation (compliance audit F)
  const [done, setDone] = useState<null | { nonprofitName: string }>(null);
  const [verifiedBanner, setVerifiedBanner] = useState<null | 'ok' | 'bad'>(null);

  useEffect(() => {
    getElectionSeeds()
      .then((s) => { setNonprofits(s.nonprofits); setBusinesses(s.businesses); })
      .catch(() => setLoadError(true));
    const v = new URLSearchParams(window.location.search).get('verified');
    if (v === '1') setVerifiedBanner('ok');
    else if (v === '0') setVerifiedBanner('bad');
  }, []);

  const selectedNonprofit = nonprofits.find((n) => n.id === nonprofitId) ?? null;

  const npFiltered = useMemo(() => {
    const q = npSearch.trim().toLowerCase();
    return q ? nonprofits.filter((n) => n.name.toLowerCase().includes(q)) : nonprofits;
  }, [nonprofits, npSearch]);

  const bizFiltered = useMemo(() => {
    const q = bizSearch.trim().toLowerCase();
    return q ? businesses.filter((b) => b.name.toLowerCase().includes(q)) : businesses;
  }, [businesses, bizSearch]);

  function toggleBusiness(id: string) {
    setBusinessIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 10 ? prev : [...prev, id],
    );
  }

  // Opens the moderated-suggestion box prefilled from a no-match search —
  // suggestions never enter the live ballot directly (admin reviews first).
  function openSuggestion(type: 'nonprofit' | 'business', name: string) {
    setSuggestType(type);
    if (name.trim()) setSuggestName(name.trim());
    setSuggestOpen(true);
    setTimeout(() => document.getElementById('suggest-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (!/^\d{5}(-\d{4})?$/.test(zip)) return setError('Enter your 5-digit ZIP code.');
    if (!nonprofitId) return setError('Choose the nonprofit you want your shopping to support.');
    if (businessIds.length < 1) return setError('Pick at least 1 local business.');
    if (!ageOk) return setError('Please confirm you are 16 or older.');
    setSubmitting(true);
    try {
      const result = await submitElection({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        zip: zip.trim(),
        nonprofitId,
        businessIds,
        suggestion:
          suggestOpen && suggestName.trim().length >= 2
            ? { type: suggestType, rawName: suggestName.trim(), note: suggestNote.trim() || undefined }
            : undefined,
      });
      trackSignup('MERIDIAN_ELECTION');
      setDone({ nonprofitName: result.nonprofitName });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl p-8 text-center" style={{ background: '#FBF7FE', border: '1px solid #E7DCF2' }}>
        <p className="text-4xl mb-4" aria-hidden="true">🤝</p>
        <h3 className="text-2xl font-black mb-3" style={{ color: '#2E1B4E' }}>
          You're an early member in Meridian.
        </h3>
        <p className="text-slate-600 leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
          One step left: <strong>check your inbox</strong> and confirm your email. Your election
          counts the moment you do — and we'll let <strong>{done.nonprofitName}</strong> know
          another neighbor has their back.
        </p>
        <p className="text-sm text-slate-500" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
          Didn't get it? Check spam, or submit again with the same email to resend.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {verifiedBanner === 'ok' && (
        <div className="rounded-2xl p-5 text-center" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <p className="font-black" style={{ color: '#065F46' }}>Your election is confirmed. 🎉</p>
          <p className="text-sm text-slate-600 mt-1" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
            You're an early member in Meridian — we'll let your nonprofit know another neighbor has their back.
          </p>
        </div>
      )}
      {verifiedBanner === 'bad' && (
        <div className="rounded-2xl p-5 text-center" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p className="font-bold text-sm" style={{ color: '#991B1B', fontFamily: "'Fira Sans',sans-serif" }}>
            That confirmation link didn't work — it may already have been used. If your election
            isn't confirmed, submit the form again with the same email to get a fresh link.
          </p>
        </div>
      )}

      {loadError && (
        <p className="text-sm text-red-600" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
          The ballot couldn't load — please refresh the page.
        </p>
      )}

      {/* Step 1: you */}
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#8A6A2E' }}>First name (optional)</span>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80}
            autoComplete="given-name" placeholder="Jordan"
            className="mt-2 w-full rounded-xl px-4 py-3 text-sm" style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }} />
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#8A6A2E' }}>Email *</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" placeholder="you@example.com"
            className="mt-2 w-full rounded-xl px-4 py-3 text-sm" style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }} />
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#8A6A2E' }}>ZIP code *</span>
          <input type="text" required inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)}
            autoComplete="postal-code" placeholder="39301" maxLength={10}
            className="mt-2 w-full rounded-xl px-4 py-3 text-sm" style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }} />
        </label>
      </div>

      {/* Step 2: elect ONE nonprofit */}
      <div>
        <h3 className="text-lg font-black mb-1" style={{ color: '#2E1B4E' }}>
          Which Meridian nonprofit do you want your shopping to support?
        </h3>
        <p className="text-sm text-slate-500 mb-3" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
          Pick one — you can change it later. These organizations are on the ballot because
          they serve Meridian &amp; Lauderdale County; being listed isn't an endorsement of
          Good Circles by them.
        </p>
        {selectedNonprofit ? (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#7851A9', color: '#fff' }}>
            <span className="font-bold text-sm flex-1" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
              ✓ {selectedNonprofit.name}
            </span>
            <button type="button" onClick={() => { setNonprofitId(''); setNpOpen(true); }}
              className="text-xs font-black uppercase tracking-wider underline">Change</button>
          </div>
        ) : (
          <div className="rounded-xl" style={{ border: '2px solid #E7DCF2' }}>
            <input
              type="search"
              value={npSearch}
              onFocus={() => setNpOpen(true)}
              onChange={(e) => { setNpSearch(e.target.value); setNpOpen(true); }}
              placeholder="Search nonprofits by name…"
              aria-label="Search Meridian nonprofits"
              className="w-full rounded-t-xl px-4 py-3 text-sm"
              style={{ fontFamily: "'Fira Sans',sans-serif", borderBottom: npOpen ? '1px solid #E7DCF2' : 'none' }}
            />
            {npOpen && (
              <div className="max-h-72 overflow-y-auto p-2" role="listbox" aria-label="Meridian nonprofits">
                {groupBy(npFiltered, NP_CATEGORY_LABELS).map(([label, items]) => (
                  <div key={label}>
                    <p className="px-2 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: '#C2A76F' }}>{label}</p>
                    {items.map((n) => (
                      <button key={n.id} type="button" role="option" aria-selected={false}
                        onClick={() => { setNonprofitId(n.id); setNpOpen(false); }}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-purple-50"
                        style={{ color: '#2E1B4E', fontFamily: "'Fira Sans',sans-serif" }}>
                        {n.name}
                      </button>
                    ))}
                  </div>
                ))}
                {npFiltered.length === 0 && (
                  <div className="p-3">
                    <p className="text-sm text-slate-400 mb-2" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
                      No match on the ballot yet.
                    </p>
                    <button type="button" onClick={() => openSuggestion('nonprofit', npSearch)}
                      className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider"
                      style={{ background: '#7851A9', color: '#fff' }}>
                      Suggest {npSearch.trim() ? `"${npSearch.trim()}"` : 'an organization'} →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: pick 1-10 businesses */}
      <div>
        <h3 className="text-lg font-black mb-1" style={{ color: '#2E1B4E' }}>
          Which local businesses would you most like to see on Good Circles?
        </h3>
        <p className="text-sm text-slate-500 mb-3" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
          Pick 1 to 10 — you've picked {businessIds.length} of 10.
        </p>
        <input
          type="search"
          value={bizSearch}
          onChange={(e) => setBizSearch(e.target.value)}
          placeholder="Search businesses by name…"
          aria-label="Search Meridian businesses"
          className="w-full rounded-xl px-4 py-3 text-sm mb-3"
          style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }}
        />
        <div className="max-h-80 overflow-y-auto rounded-xl p-3" style={{ border: '2px solid #E7DCF2' }}>
          {groupBy(bizFiltered, BIZ_CATEGORY_LABELS).map(([label, items]) => (
            <div key={label} className="mb-2">
              <p className="px-1 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: '#C2A76F' }}>{label}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((b) => {
                  const picked = businessIds.includes(b.id);
                  const full = !picked && businessIds.length >= 10;
                  return (
                    <button key={b.id} type="button" onClick={() => toggleBusiness(b.id)} disabled={full}
                      aria-pressed={picked}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                      style={picked
                        ? { background: '#7851A9', color: '#fff', border: '1px solid #7851A9' }
                        : { background: '#fff', color: full ? '#bbb' : '#52407e', border: '1px solid #E7DCF2', cursor: full ? 'not-allowed' : 'pointer' }}>
                      {picked ? '✓ ' : ''}{b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {bizFiltered.length === 0 && (
            <div className="p-2">
              <p className="text-sm text-slate-400 mb-2" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
                No match on the ballot yet.
              </p>
              <button type="button" onClick={() => openSuggestion('business', bizSearch)}
                className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider"
                style={{ background: '#7851A9', color: '#fff' }}>
                Suggest {bizSearch.trim() ? `"${bizSearch.trim()}"` : 'a business'} →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optional suggestion — files to a moderated queue, never straight to the ballot */}
      <div id="suggest-box">
        {!suggestOpen ? (
          <button type="button" onClick={() => setSuggestOpen(true)}
            className="text-sm font-bold underline" style={{ color: '#7851A9', fontFamily: "'Fira Sans',sans-serif" }}>
            Don't see a nonprofit or business you love? Suggest it
          </button>
        ) : (
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#FBF7FE', border: '1px solid #E7DCF2' }}>
            <p className="text-xs text-slate-500" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
              Suggestions are reviewed before they appear on the ballot.
            </p>
            <div className="flex flex-wrap gap-3">
              <select value={suggestType} onChange={(e) => setSuggestType(e.target.value as 'nonprofit' | 'business')}
                aria-label="Suggestion type"
                className="rounded-xl px-3 py-2 text-sm" style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }}>
                <option value="business">A local business</option>
                <option value="nonprofit">A nonprofit</option>
              </select>
              <input type="text" value={suggestName} onChange={(e) => setSuggestName(e.target.value)} maxLength={160}
                placeholder="Name of the organization or business"
                className="flex-1 min-w-[220px] rounded-xl px-4 py-2 text-sm" style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }} />
            </div>
            <input type="text" value={suggestNote} onChange={(e) => setSuggestNote(e.target.value)} maxLength={500}
              placeholder="Anything we should know? (optional)"
              className="w-full rounded-xl px-4 py-2 text-sm" style={{ border: '2px solid #E7DCF2', fontFamily: "'Fira Sans',sans-serif" }} />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm font-bold text-red-600" style={{ fontFamily: "'Fira Sans',sans-serif" }}>{error}</p>
      )}

      <label className="flex items-start gap-3 cursor-pointer select-none" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
        <input type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: '#7851A9' }} />
        <span className="text-sm text-slate-600">
          I confirm I am 16 or older. (Good Circles isn't directed to children under 13.)
        </span>
      </label>

      <button type="submit" disabled={submitting || !ageOk}
        className="w-full sm:w-auto px-10 py-4 rounded-full font-black text-sm uppercase tracking-wider"
        style={{ background: '#C2A76F', color: '#241247', opacity: submitting || !ageOk ? 0.6 : 1 }}>
        {submitting ? 'Recording your election…' : 'Make my election →'}
      </button>
      <p className="text-xs text-slate-400" style={{ fontFamily: "'Fira Sans',sans-serif" }}>
        Free to join. One election per member. We'll email you a confirmation link — your
        election counts once you confirm. We never sell your data.
      </p>
    </form>
  );
}
