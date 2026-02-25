import { Plane, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer
      className="relative z-10 border-t"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-soft)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white -rotate-45" />
              </div>
              <span className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                SkyWings
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-3)' }}>
              Premium air travel to 120+ destinations worldwide. Experience comfort beyond the clouds.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: 'var(--color-surface)', color: 'var(--color-text-3)' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--color-text-4)' }}>
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', page: 'about' },
                { label: 'Our Fleet', page: 'aircraft' },
                { label: 'Destinations', page: 'flights' },
                { label: 'My Bookings', page: 'bookings' },
              ].map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--color-text-3)' }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--color-text-4)' }}>
              Support
            </h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm transition-colors hover:underline" style={{ color: 'var(--color-text-3)' }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--color-text-4)' }}>
              Stay Updated
            </h4>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-3)' }}>
              Get the latest deals and travel tips.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="input-field flex-1 text-sm"
              />
              <button className="btn-primary px-4 py-2 text-sm rounded-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
            &copy; {new Date().getFullYear()} SkyWings Airlines. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
            Crafted with care for the modern traveler.
          </p>
        </div>
      </div>
    </footer>
  );
}