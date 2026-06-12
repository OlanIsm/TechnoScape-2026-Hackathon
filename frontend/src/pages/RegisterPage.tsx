import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { PhoneStatusBar } from '../components/PhoneStatusBar';

export function RegisterPage() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  return (
    <main className="login-page register-page">
      <PhoneStatusBar />
      <section className="login-panel register-panel" aria-labelledby="register-title">
        <BrandLogo className="login-logo" />
        <h1 id="register-title">Daftar akun</h1>
        <form
          className="login-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            navigate('/login');
          }}
        >
          <label>
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder=" "
            />
            <span>Nama Lengkap</span>
          </label>
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
              autoComplete="new-password"
              placeholder=" "
            />
            <span>Sandi</span>
          </label>
          <button type="submit">Daftar</button>
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
            Sudah punya? <Link to="/login">Login di sini</Link>
          </p>
        </div>
        {message ? <p className="login-feedback">{message}</p> : null}
      </section>
    </main>
  );
}
