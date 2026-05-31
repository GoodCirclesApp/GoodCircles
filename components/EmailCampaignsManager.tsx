import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

// Admin email client — compose (with live preview, recipient picker, test-send),
// campaigns dashboard, and templates. Backed by /api/email/* (campaign model).
type Tab = 'compose' | 'campaigns' | 'templates';
type RecipientType = 'INDIVIDUAL' | 'ROLE_BASED' | 'SYSTEM_WIDE' | 'SEGMENT';

const ROLES = ['NEIGHBOR', 'MERCHANT', 'NONPROFIT', 'CDFI', 'MUNICIPAL'];
const ALIASES = [
  { id: 'hello', label: 'hello@ (marketing)' },
  { id: 'notifications', label: 'notifications@ (transactional)' },
  { id: 'support', label: 'support@' },
  { id: 'founder', label: 'founder@' },
];
const inputCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm';

const EmailCampaignsManager = ({ isViewer }: { isViewer?: boolean }) => {
  const [tab, setTab] = useState<Tab>('compose');

  // ── compose state ──
  const [type, setType] = useState<RecipientType>('ROLE_BASED');
  const [targetRole, setTargetRole] = useState('NEIGHBOR');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [fromAlias, setFromAlias] = useState('hello');
  const [layoutVariant, setLayoutVariant] = useState<'TRANSACTIONAL' | 'MARKETING'>('MARKETING');
  const [accentRole, setAccentRole] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('<p>Hi {{firstName}},</p>\n<p>Write your message here.</p>');
  const [previewHtml, setPreviewHtml] = useState('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testTo, setTestTo] = useState('');

  // ── data ──
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  const composePayload = () => ({
    type, subject, bodyHtml, fromAlias, layoutVariant,
    accentRole: accentRole || undefined,
    targetRole: type === 'ROLE_BASED' ? targetRole : undefined,
    recipientEmail: type === 'INDIVIDUAL' ? recipientEmail : undefined,
    recipientName: type === 'INDIVIDUAL' ? recipientName : undefined,
  });

  async function refreshPreview() {
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.post<{ recipientCount: number; samples: any[] }>('/email/campaigns/preview', composePayload());
      setRecipientCount(r.recipientCount);
      setPreviewHtml(r.samples?.[0]?.html ?? '');
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || 'Preview failed' });
    } finally { setBusy(false); }
  }

  async function loadCampaigns() {
    try { const r = await apiClient.get<{ campaigns: any[] }>('/email/campaigns'); setCampaigns(r.campaigns ?? []); } catch { /* */ }
  }
  async function loadTemplates() {
    try { const r = await apiClient.get<{ templates: any[] }>('/email/templates'); setTemplates(r.templates ?? []); } catch { /* */ }
  }
  async function openDetail(id: string) {
    try { const r = await apiClient.get<{ campaign: any }>(`/email/campaigns/${id}`); setDetail(r.campaign); } catch { /* */ }
  }

  useEffect(() => { loadCampaigns(); loadTemplates(); }, []);

  // Delivery/open/bounce stats arrive via webhook seconds-to-minutes after sending, so
  // auto-refresh the list (and any open detail) while the Campaigns tab is showing.
  useEffect(() => {
    if (tab !== 'campaigns') return;
    const t = setInterval(() => { loadCampaigns(); if (detail?.id) openDetail(detail.id); }, 15000);
    return () => clearInterval(t);
  }, [tab, detail?.id]);

  async function refreshCampaigns() { await loadCampaigns(); if (detail?.id) await openDetail(detail.id); }

  async function sendTest() {
    if (isViewer) return;
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.post<{ ok: boolean; to: string }>('/email/campaigns/test', { ...composePayload(), to: testTo || undefined });
      setMsg({ ok: r.ok, text: r.ok ? `Test sent to ${r.to}` : 'Test failed' });
    } catch (e: any) { setMsg({ ok: false, text: e?.message || 'Test failed' }); }
    finally { setBusy(false); }
  }

  async function send() {
    if (isViewer) return;
    if (!subject.trim() || !bodyHtml.trim()) { setMsg({ ok: false, text: 'Subject and body are required.' }); return; }
    if (type === 'INDIVIDUAL' && !recipientEmail.trim()) { setMsg({ ok: false, text: 'Recipient email required.' }); return; }
    if (!window.confirm(`Send this email to ${recipientCount ?? '?'} recipient(s)?`)) return;
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.post<{ campaign: any; send?: { ok: boolean; sent: number; error?: string } }>('/email/campaigns', { ...composePayload(), sendNow: true });
      if (r.send && !r.send.ok) setMsg({ ok: false, text: r.send.error || 'Send blocked' });
      else setMsg({ ok: true, text: `Sent to ${r.send?.sent ?? 0} recipient(s).` });
      loadCampaigns();
    } catch (e: any) { setMsg({ ok: false, text: e?.message || 'Send failed' }); }
    finally { setBusy(false); }
  }

  async function saveTemplate() {
    if (isViewer) return;
    const name = window.prompt('Template name?');
    if (!name) return;
    try {
      await apiClient.post('/email/templates', { name, subject, bodyHtml, category: 'OUTREACH', layoutVariant });
      loadTemplates();
      setMsg({ ok: true, text: 'Template saved.' });
    } catch (e: any) { setMsg({ ok: false, text: e?.message || 'Save failed' }); }
  }
  function useTemplate(t: any) {
    setSubject(t.subject); setBodyHtml(t.bodyHtml); setLayoutVariant(t.layoutVariant || 'MARKETING'); setTab('compose');
  }

  const insert = (snippet: string) => setBodyHtml(b => b + '\n' + snippet);

  const stat = (c: any) => `${c.sentCount}/${c.recipientCount} sent · ${c.deliveredCount} deliv · ${c.openedCount} open · ${c.bouncedCount} bounce`;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-100">
        {(['compose', 'campaigns', 'templates'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors ${tab === t ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {msg && <div className={`text-sm font-bold px-4 py-2 rounded-xl ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</div>}

      {/* ── COMPOSE ── */}
      {tab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Send to</label>
                <select className={inputCls} value={type} onChange={e => setType(e.target.value as RecipientType)}>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="ROLE_BASED">A role</option>
                  <option value="SYSTEM_WIDE">All users</option>
                </select>
              </div>
              {type === 'ROLE_BASED' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Role</label>
                  <select className={inputCls} value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              {type === 'INDIVIDUAL' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">To email</label>
                  <input className={inputCls} value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="person@example.com" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">From</label>
                <select className={inputCls} value={fromAlias} onChange={e => setFromAlias(e.target.value)}>
                  {ALIASES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Layout</label>
                <select className={inputCls} value={layoutVariant} onChange={e => setLayoutVariant(e.target.value as any)}>
                  <option value="MARKETING">Marketing (dark footer + unsubscribe)</option>
                  <option value="TRANSACTIONAL">Transactional (light footer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Subject</label>
              <input className={inputCls} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Body (HTML)</label>
              <div className="flex flex-wrap gap-1.5 my-1.5">
                <button type="button" onClick={() => insert('<h1 style="font-size:24px;font-weight:900;">Heading</h1>')} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">+ Heading</button>
                <button type="button" onClick={() => insert('<p>Paragraph text.</p>')} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">+ Paragraph</button>
                <button type="button" onClick={() => insert('<div style="text-align:center;margin:24px 0;"><a href="https://www.goodcircles.org" style="background:#7851A9;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Call to action</a></div>')} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">+ Button</button>
                <button type="button" onClick={() => insert('{{firstName}}')} className="text-[10px] font-bold px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200">{'{{firstName}}'}</button>
                <button type="button" onClick={() => insert('{{orgName}}')} className="text-[10px] font-bold px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200">{'{{orgName}}'}</button>
                <button type="button" onClick={() => insert('{{businessName}}')} className="text-[10px] font-bold px-2 py-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200">{'{{businessName}}'}</button>
              </div>
              <textarea className={inputCls + ' font-mono h-48'} value={bodyHtml} onChange={e => setBodyHtml(e.target.value)} />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button onClick={refreshPreview} disabled={busy} className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-white disabled:opacity-50">Preview & count</button>
              {!isViewer && <>
                <input className={inputCls + ' max-w-[200px]'} value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="test@ (your email)" />
                <button onClick={sendTest} disabled={busy} className="text-xs font-bold px-3 py-2 rounded-xl bg-amber-500 text-white disabled:opacity-50">Send test</button>
                <button onClick={saveTemplate} disabled={busy} className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 text-slate-700">Save template</button>
                <button onClick={send} disabled={busy} className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50">Send{recipientCount != null ? ` (${recipientCount})` : ''}</button>
              </>}
            </div>
          </div>

          {/* live preview */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase">Preview {recipientCount != null && <span className="text-emerald-600">· {recipientCount} recipient(s)</span>}</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mt-1" style={{ height: 560 }}>
              {previewHtml
                ? <iframe title="preview" srcDoc={previewHtml} style={{ width: '100%', height: '100%', border: 0 }} />
                : <div className="flex items-center justify-center h-full text-slate-300 text-sm">Click “Preview &amp; count” to render</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── CAMPAIGNS ── */}
      {tab === 'campaigns' && (
        <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Auto-refreshing every 15s</span>
          <button onClick={refreshCampaigns} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-white">↻ Refresh now</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {campaigns.length === 0 && <p className="text-slate-400 text-sm italic">No campaigns yet.</p>}
            {campaigns.map(c => (
              <button key={c.id} onClick={() => openDetail(c.id)} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{c.subject}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${c.status === 'SENT' ? 'bg-emerald-100 text-emerald-700' : c.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{c.type}{c.triggerSource ? ` · ${c.triggerSource}` : ''} · {new Date(c.createdAt).toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stat(c)}</div>
              </button>
            ))}
          </div>
          <div className="border border-slate-100 rounded-xl p-4">
            {!detail ? <p className="text-slate-300 text-sm italic">Select a campaign to see recipients.</p> : (
              <div>
                <h3 className="font-black text-sm">{detail.subject}</h3>
                <p className="text-[11px] text-slate-400 mb-3">{detail.fromName} &lt;{detail.fromAddress}&gt; · {detail.type} · {detail.status}</p>
                <div className="text-xs text-slate-600 mb-3">{stat(detail)}</div>
                <div className="max-h-80 overflow-auto divide-y divide-slate-50">
                  {(detail.recipients ?? []).map((r: any) => (
                    <div key={r.id} className="flex justify-between py-1.5 text-xs">
                      <span className="text-slate-600">{r.emailAddress}</span>
                      <span className="font-bold text-slate-500">{r.status}{r.linkedInboundEmailId ? ' · replied' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {tab === 'templates' && (
        <div className="space-y-2">
          {templates.length === 0 && <p className="text-slate-400 text-sm italic">No saved templates.</p>}
          {templates.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-[11px] text-slate-400">{t.category} · {t.subject}</div>
              </div>
              <button onClick={() => useTemplate(t)} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white">Use</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailCampaignsManager;
