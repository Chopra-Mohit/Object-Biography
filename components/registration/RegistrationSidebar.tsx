'use client'

import type { DBRegistration } from '@/types/database'

interface Props {
  registrations: DBRegistration[]
}

export default function RegistrationSidebar({ registrations }: Props) {
  return (
    <aside className="ob-register-sidebar" style={{
      borderLeft: '1px solid var(--ob-rule)',
      paddingLeft: 'var(--ob-space-10)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ob-space-6)',
    }}>
      <div style={{ paddingBottom: 'var(--ob-space-5)', borderBottom: '1px solid var(--ob-rule)' }}>
        <span className="ob-eyebrow" style={{ marginBottom: 'var(--ob-space-2)' }}>
          Your registry
        </span>
        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-meta)',
          color: 'var(--ob-fg-faint)',
          letterSpacing: 'var(--ob-ls-wide)',
        }}>
          {registrations.length === 0
            ? 'No objects registered yet.'
            : `${registrations.length} object${registrations.length === 1 ? '' : 's'} on record.`}
        </p>
      </div>

      {registrations.length === 0 ? (
        <p style={{
          fontFamily: 'var(--ob-font-mono)',
          fontSize: 'var(--ob-fs-small)',
          color: 'var(--ob-fg-faint)',
          lineHeight: 'var(--ob-lh-relaxed)',
        }}>
          Register your first object using the form.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--ob-space-2)' }}>
          {registrations.map(reg => (
            <li key={reg.id}>
              <a
                href={`/biography/${reg.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{
                  padding: 'var(--ob-space-4) var(--ob-space-5)',
                  border: '1px solid var(--ob-rule)',
                  transition: 'border-color 0.15s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ob-fg-dim)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ob-rule)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ob-space-2)' }}>
                    <span style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: 'var(--ob-fs-small)',
                      color: 'var(--ob-fg)',
                      lineHeight: 1.3,
                    }}>
                      {reg.manual_product_name ?? 'Unknown object'}
                    </span>
                    {reg.biography_generated && (
                      <span style={{
                        fontFamily: 'var(--ob-font-mono)',
                        fontSize: '9px',
                        letterSpacing: 'var(--ob-ls-stamp)',
                        textTransform: 'uppercase',
                        color: '#4CAF50',
                        whiteSpace: 'nowrap',
                        marginLeft: 'var(--ob-space-3)',
                      }}>
                        ● Filed
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: 'var(--ob-fs-meta)',
                      color: 'var(--ob-fg-faint)',
                      letterSpacing: 'var(--ob-ls-wide)',
                    }}>
                      {reg.manual_brand ?? '—'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--ob-font-mono)',
                      fontSize: 'var(--ob-fs-meta)',
                      color: 'var(--ob-fg-faint)',
                      letterSpacing: 'var(--ob-ls-wide)',
                    }}>
                      {reg.date_of_death}
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
