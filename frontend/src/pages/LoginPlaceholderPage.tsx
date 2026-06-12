import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

export function LoginPlaceholderPage() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <BrandLogo className="login-logo" />
        <h1 id="login-title">Masuk ke akun anda</h1>
        <form
          className="login-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            navigate('/dashboard');
          }}
        >
          <label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder=" "
            />
            <span>Email</span>
          </label>
          <label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder=" "
            />
            <span>Sandi</span>
          </label>
          <button type="submit">Masuk</button>
        </form>
        <div className="login-secondary-actions">
          <button
            className="login-text-action align-right"
            type="button"
            onClick={() => setMessage('Fitur lupa password belum tersedia.')}
          >
            Lupa Password?
          </button>
          <p className="register-prompt">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </p>
        </div>
        {message ? <p className="login-feedback">{message}</p> : null}
      </section>
    </main>
  );
}
