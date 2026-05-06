import { BRAND } from '../lib/brand';

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a1a' }}>
      <div className="max-w-6xl mx-auto px-6 py-16 grid sm:grid-cols-3 gap-10 text-sm">
        {/* Brand */}
        <div>
          <img src="/logos/logo-white-md.png" alt="GoodCircles" style={{ height: 32, width: 'auto', marginBottom: 16 }} />
          <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Fira Sans', sans-serif", lineHeight: 1.6 }}>
            A community marketplace where shopping local saves you money, funds nonprofits, and strengthens the place you live.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 16, fontFamily: "'Fira Sans', sans-serif" }}>
            Launching September 2026
          </p>
        </div>

        {/* For visitors */}
        <div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
            Legal
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Privacy Policy',    href: '#' },
              { label: 'Terms of Service',  href: '#' },
              { label: 'Cookie Policy',     href: '#' },
            ].map(link => (
              <a key={link.label} href={link.href}
                 style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Fira Sans', sans-serif" }}
                 onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)'; }}
                 onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
            Get in touch
          </p>
          <div className="flex flex-col gap-3">
            <a href="mailto:hello@goodcircles.org"
               style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Fira Sans', sans-serif" }}
               onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = BRAND.gold; }}
               onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; }}>
              hello@goodcircles.org
            </a>
            <a href="mailto:press@goodcircles.org"
               style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: "'Fira Sans', sans-serif" }}
               onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = BRAND.gold; }}
               onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; }}>
              press@goodcircles.org
            </a>
          </div>
        </div>
      </div>

      <div className="border-t px-6 py-6 text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: "'Fira Sans', sans-serif" }}>
          &copy; {new Date().getFullYear()} GoodCircles. All rights reserved.
          Brand design by{' '}
          <a href="https://powerupmedia.com" target="_blank" rel="noopener noreferrer"
             style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            Powerup Media
          </a>.
        </p>
      </div>
    </footer>
  );
}
