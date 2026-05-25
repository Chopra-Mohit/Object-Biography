export type CertificateData = {
  object: string
  manufacturer: string
  dateOfDeath: string
  causeOfDeath: string
  registeredOwner: string
  certificateNo: string
  life: string
  death: string
  secondLife: string
  footerLeft: string
  footerRight: string
}

const DEMO: CertificateData = {
  object: 'Dyson V11 Cordless Vacuum',
  manufacturer: 'Dyson Ltd, Malmesbury, UK',
  dateOfDeath: 'March 2024 · Age: 3 yrs 2 mo',
  causeOfDeath: 'Battery failure — designed component',
  registeredOwner: 'Private household, Barcelona ES',
  certificateNo: 'OB-2024-00412',
  life: 'Manufactured in Malaysia, 2020. Battery cells sourced from CATL, Ningde, China. Lithium-ion pack rated at 500–800 charge cycles — approximately 18–24 months of daily use. Sold with a 2-year warranty structured to expire before the designed failure point of the battery. RRP €599. Functioned as primary household vacuum for 38 months before battery capacity fell below 40% of rated performance.',
  death: 'Battery failure at 38 months — 14 months beyond warranty expiry. Replacement battery retails at €89.99 and requires proprietary tool not included with the product. Dyson\'s battery design uses a glued cell configuration that invalidates warranty upon opening. No independent repair pathway exists without voiding manufacturer terms. Decision to use non-user-serviceable battery made at design stage, 2018. That decision was not disclosed to the consumer at point of sale.',
  secondLife: 'Had this vacuum been built with a user-replaceable battery of equivalent specification, it could have been repaired in 12 minutes at a cost of €24 using a generic Li-ion cell. At that rate, it would have served the same household for an estimated 11 years, consumed 64% less embodied energy over its lifecycle, and ended as recoverable components rather than composite waste. It wasn\'t. The decision that made this impossible was made in Malmesbury in 2018. It was never named.',
  footerLeft: 'Object Biography SL · objectbiography.com\nConfidence tier: HIGH · Sources: 4 primary, 2 secondary',
  footerRight: 'Generated 14 March 2024\nSHA-256: 9f3c…e41a',
}

interface CertificateProps {
  data?: CertificateData
  isLoading?: boolean
}

export default function Certificate({ data, isLoading }: CertificateProps) {
  const cert = data ?? DEMO

  return (
    <section id="certificate" style={{ background: 'var(--ob-bg)', borderBottom: '1px solid var(--ob-rule)', padding: '7rem 0' }}>
      <div className="ob-container">
        <span className="ob-eyebrow" style={{ marginBottom: '2.5rem' }}>02 — Specimen Certificate</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <article className="ob-cert" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            <header className="ob-cert__header">
              <div className="ob-cert__authority">Object Biography Registry &nbsp;·&nbsp; Issued under civic record</div>
              <h2 className="ob-cert__title">Certificate of Object Death</h2>
              <div className="ob-cert__subtitle">A formal material biography and record of designed failure</div>
            </header>

            <div className="ob-cert__fields">
              <div>
                <div className="ob-cert__field-label">Object</div>
                <div className="ob-cert__field-value">{cert.object}</div>
              </div>
              <div>
                <div className="ob-cert__field-label">Manufacturer</div>
                <div className="ob-cert__field-value">{cert.manufacturer}</div>
              </div>
              <div>
                <div className="ob-cert__field-label">Date of Death</div>
                <div className="ob-cert__field-value">{cert.dateOfDeath}</div>
              </div>
              <div>
                <div className="ob-cert__field-label">Cause of Death</div>
                <div className="ob-cert__field-value">{cert.causeOfDeath}</div>
              </div>
              <div className="ob-cert__field--full">
                <div className="ob-cert__field-label">Registered Owner</div>
                <div className="ob-cert__field-value">
                  {cert.registeredOwner} &nbsp;·&nbsp; Certificate No. {cert.certificateNo}
                </div>
              </div>
            </div>

            <section className="ob-cert__section">
              <h4 className="ob-cert__section-head">Life</h4>
              <p className="ob-cert__section-body">{cert.life}</p>
            </section>

            <section className="ob-cert__section">
              <h4 className="ob-cert__section-head">Death</h4>
              <p className="ob-cert__section-body">{cert.death}</p>
            </section>

            <section className="ob-cert__section">
              <h4 className="ob-cert__section-head">
                Second Life &nbsp;<span style={{ fontWeight: 400, letterSpacing: 0 }}>(counterfactual)</span>
              </h4>
              <p className="ob-cert__second-life">{cert.secondLife}</p>
            </section>

            <div className="ob-stamp">Deceased</div>

            <footer className="ob-cert__footer">
              <div style={{ whiteSpace: 'pre-line' }}>{cert.footerLeft}</div>
              <div className="ob-cert__footer-right" style={{ whiteSpace: 'pre-line' }}>{cert.footerRight}</div>
            </footer>
          </article>
        </div>
      </div>
    </section>
  )
}
