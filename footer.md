# Shrine Solar Light Theme Footer

This is the standard, responsive light-themed footer component designed for the Shrine Solar website. It contains the company description, quick links, contact info, and copyright bar.

```jsx
      {/* ── Footer ── flows naturally at the end of content */}
      <footer
        style={{
          position: 'relative',
          width: '100%',
          zIndex: 5,
          background: 'linear-gradient(180deg, #FFF9C4 0%, #FFFFFF 100%)',
          borderTop: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        {/* Gold accent line at top */}
        <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)' }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 40px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          justifyContent: 'space-between',
        }}>
          {/* Column 1: Logo & Description */}
          <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src="/apple-touch-icon.png" alt="Shrine Solar" style={{ width: '50px', height: '50px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#111111',
              }}>SHRINE SOLAR</span>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              lineHeight: 1.7,
              color: 'rgba(0,0,0,0.65)',
              maxWidth: '300px',
            }}>
              Empowering homes and businesses in Dapitan City with reliable, affordable solar energy solutions. Your trusted partner for panel installation and electrical maintenance.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ flex: '0 1 160px' }}>
            <h4 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#111111',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >Home</span>
              </li>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}
                  onClick={() => { Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Shop'))?.click(); }}
                >Shop</span>
              </li>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}
                  onClick={() => { navigate('/my-cart'); }}
                >My Carts</span>
              </li>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}
                  onClick={() => { Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Inquiry'))?.click(); }}
                >Inquiry</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div style={{ flex: '0 1 250px' }}>
            <h4 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#111111',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s',
              }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}>
                <img src="/fblogo.png" alt="FB" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                ShrineSolar
              </a>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <img src="/phonelogo.png" alt="Phone" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                09171842499
              </span>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s',
              }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}>
                <img src="/gmaillogo.png" alt="Gmail" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Shrinesolar2022@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.1)',
          padding: '20px 40px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: 'rgba(0,0,0,0.5)',
            textAlign: 'center',
          }}>
            © {new Date().getFullYear()} Shrine Solar. All rights reserved. · #1 Panel & Electrical Installations in Dapitan City
          </p>
        </div>
      </footer>
```
