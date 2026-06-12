export function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Admin Koperasi</p>
        <h1>Masuk ke VolumeMate</h1>
        <form className="auth-form">
          <label className="field">
            <span>Email</span>
            <input type="email" placeholder="admin@koperasi.id" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" placeholder="********" />
          </label>
          <button type="button">Masuk</button>
        </form>
      </div>
    </section>
  );
}
