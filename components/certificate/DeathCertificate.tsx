import type { BiographyJSON } from '@/types/database'

interface Props {
  biography: BiographyJSON
  dateOfDeath: string
  registrationId: string
  shareToken?: string
}

export default function DeathCertificate({ biography, dateOfDeath, registrationId, shareToken }: Props) {
  const cert = biography.certificate_summary
  const issued = new Date().toISOString().split('T')[0]

  return (
    <div
      id="death-certificate"
      style={{
        background: '#F8F5EB',
        color: '#1B1B17',
        width: '680px',
        maxWidth: '100%',
        padding: '3rem 3.5rem',
        position: 'relative',
        fontFamily: "'Courier New', Courier, monospace",
        boxShadow: '0 0 0 1px #C8C3B0, 0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* Corner registration marks */}
      <span style={{ position: 'absolute', top: 16, left: 16, width: 18, height: 18, borderTop: '1px solid #B0AA98', borderLeft: '1px solid #B0AA98', display: 'block' }} />
      <span style={{ position: 'absolute', bottom: 16, right: 16, width: 18, height: 18, borderBottom: '1px solid #B0AA98', borderRight: '1px solid #B0AA98', display: 'block' }} />

      {/* DECEASED stamp */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '3rem',
        transform: 'translateY(-50%) rotate(-12deg)',
        fontFamily: "'Courier New', monospace",
        fontSize: '26px',
        fontWeight: 700,
        letterSpacing: '0.15em',
        color: '#C41E1E',
        border: '3px solid #C41E1E',
        padding: '0.3rem 0.7rem',
        opacity: 0.8,
        textTransform: 'uppercase',
        pointerEvents: 'none',
        zIndex: 10,
        mixBlendMode: 'multiply',
      }}>
        Deceased
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #2A2720' }}>
        <p style={{ fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7469', marginBottom: '0.75rem' }}>
          Object Biography Registry
        </p>
        <h1 style={{ fontSize: '22px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
          Certificate of Death
        </h1>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#6A655C' }}>
          A material record of an object's end
        </p>
      </div>

      {/* Identity fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #C8C3B0' }}>
        <Field label="Object" value={biography.object_name} />
        <Field label="Manufacturer" value={biography.manufacturer} />
        {biography.model && <Field label="Model" value={biography.model} />}
        {biography.year_of_manufacture && (
          <Field label="Year of manufacture" value={String(biography.year_of_manufacture)} />
        )}
        <Field label="Date of death" value={dateOfDeath} />
        <Field label="Certificate issued" value={issued} />
      </div>

      {/* Cause of death */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SectionHead label="Cause of death" />
        <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#3D3830' }}>{cert.cause_of_death}</p>
      </div>

      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #C8C3B0', paddingBottom: '1.5rem' }}>
        <SectionHead label="Design decision named" />
        <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#3D3830' }}>{cert.design_decision_named}</p>
      </div>

      {/* Material + Human cost */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #C8C3B0' }}>
        <div>
          <SectionHead label="Material cost" />
          <p style={{ fontSize: '12px', color: '#3D3830', lineHeight: 1.65 }}>{cert.material_cost_line}</p>
        </div>
        <div>
          <SectionHead label="Human cost" />
          <p style={{ fontSize: '12px', color: '#3D3830', lineHeight: 1.65 }}>{cert.human_cost_line}</p>
        </div>
      </div>

      {/* Second life summary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SectionHead label="Second life denied" />
        <div style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: '12.5px',
          lineHeight: 1.7,
          color: '#4A4540',
          background: 'rgba(0,0,0,0.03)',
          padding: '0.8rem 1rem',
          borderLeft: '2px solid #B0AA98',
        }}>
          <p>{biography.second_life.counterfactual_lifespan} possible. {biography.second_life.material_recovery_rate} recoverable. {biography.second_life.carbon_delta}.</p>
        </div>
      </div>

      {/* Material passport — biographies v2+ carry a bill of materials */}
      {biography.material_passport && biography.material_passport.length > 0 && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #C8C3B0' }}>
          <SectionHead label="Material passport" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', color: '#3D3830' }}>
            <thead>
              <tr>
                <th style={passportTh}>Material</th>
                <th style={passportTh}>Component</th>
                <th style={passportTh}>Weight</th>
                <th style={{ ...passportTh, textAlign: 'right' }}>Fate</th>
              </tr>
            </thead>
            <tbody>
              {biography.material_passport.map((m, i) => (
                <tr key={i}>
                  <td style={passportTd}>{m.material}</td>
                  <td style={{ ...passportTd, color: '#6A655C' }}>{m.component}</td>
                  <td style={{ ...passportTd, color: '#6A655C', whiteSpace: 'nowrap' }}>{m.est_weight}</td>
                  <td style={{
                    ...passportTd, textAlign: 'right', whiteSpace: 'nowrap',
                    color: m.recyclable ? '#3D6B3D' : '#C41E1E',
                    textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.12em',
                  }}>
                    {m.recyclable ? 'Recoverable' : 'Lost'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supply chain route — one line, extraction to retail */}
      {biography.supply_chain_trace && biography.supply_chain_trace.length > 0 && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #C8C3B0' }}>
          <SectionHead label="Route of manufacture" />
          <p style={{ fontSize: '11px', lineHeight: 1.8, color: '#3D3830' }}>
            {biography.supply_chain_trace.map((s, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: '#B0AA98' }}> → </span>}
                <span style={{ color: s.location.toLowerCase() === 'undisclosed' ? '#C41E1E' : '#3D3830' }}>
                  {s.location}
                </span>
                <span style={{ color: '#7A7469', fontSize: '9px' }}> ({s.stage.toLowerCase()})</span>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Repair economics */}
      {biography.repair_economics && (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #C8C3B0' }}>
          <SectionHead label="Repair economics" />
          <p style={{ fontSize: '12px', color: '#3D3830', lineHeight: 1.65, marginBottom: '0.4rem' }}>
            {biography.repair_economics.verdict}
          </p>
          <p style={{ fontSize: '10.5px', color: '#6A655C', lineHeight: 1.65 }}>
            Repair {biography.repair_economics.repair_cost} · Replacement {biography.repair_economics.replacement_cost} ·{' '}
            {biography.repair_economics.repair_time} · Parts: {biography.repair_economics.parts_availability}
          </p>
        </div>
      )}

      {/* Data quality */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #C8C3B0' }}>
        <SectionHead label="Data quality" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
            background: biography.data_quality.overall_tier === 'verified' ? '#4CAF50' : biography.data_quality.overall_tier === 'inferred' ? '#FF9800' : '#9E9E9E',
          }} />
          <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7469' }}>
            {biography.data_quality.overall_tier}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '9px', color: '#7A7469', letterSpacing: '0.1em' }}>
        <div>
          <p style={{ textTransform: 'uppercase' }}>Object Biography Registry</p>
          <p>objectbiography.com</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {shareToken && <p>Token: {shareToken}</p>}
          <p style={{ fontSize: '8px', opacity: 0.6, marginTop: '0.2rem' }}>{registrationId.slice(0, 8)}…</p>
        </div>
      </div>
    </div>
  )
}

const passportTh: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '8.5px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#7A7469',
  fontWeight: 400,
  paddingBottom: '0.35rem',
  borderBottom: '1px solid #C8C3B0',
}

const passportTd: React.CSSProperties = {
  padding: '0.35rem 0.6rem 0.35rem 0',
  borderBottom: '0.5px solid #DDD6C4',
  verticalAlign: 'top',
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '8.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7469', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontSize: '13px', color: '#2A2720', borderBottom: '1px solid #C8C3B0', paddingBottom: '0.3rem' }}>{value}</p>
    </div>
  )
}

function SectionHead({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: '9px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      fontWeight: 700,
      marginBottom: '0.5rem',
      paddingBottom: '0.3rem',
      borderBottom: '1px solid #2A2720',
      color: '#2A2720',
    }}>
      {label}
    </p>
  )
}
