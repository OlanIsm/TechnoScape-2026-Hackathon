export function CollectiveProgress() {
  return (
    <section className="section-card collective-card">
      <div className="collective-heading">
        <h2>Collective Buying Progress</h2>
        <strong>78%</strong>
      </div>
      <div className="collective-track" aria-label="Progress 78 persen">
        <span />
      </div>
      <div className="participant-row" aria-label="Koperasi peserta">
        <span>Sumber Makmur</span>
        <span>Padiwangi</span>
        <span>Melati Jaya</span>
      </div>
      <div className="axis-row" aria-hidden="true">
        <span>5k</span>
        <span>7k</span>
        <span>10k</span>
      </div>
    </section>
  );
}
