import { useState } from 'react';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (!ok) setError('Correo o contraseña incorrectos');
  };
  useEffect(() => {
    const probarIPC = async () => {
      if (window.api && window.api.saludar) {
        const respuesta = await window.api.saludar();
        console.log(respuesta);
      } else {
        console.log("No estamos en entorno Electron (window.api no disponible). Fallback a LocalStorage.");
      }
    };

    probarIPC();
  }, []);

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-form-wrap">
          <div className="login-brand">
            <div className="login-brand-icon">🌾</div>
            <div>
              <div className="brand-name" style={{fontSize:18}}>FERCORD</div>
              <div className="brand-sub">Nutrición Balanceada</div>
            </div>
          </div>
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-sub">Sistema de ventas e inventario para alimentos balanceados de aves y cerdos.</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{width:'100%',justifyContent:'center',padding:'11px 16px',fontSize:14}}>
              Ingresar al sistema
            </button>
          </form>
        </div>
      </div>
      <div className="login-right">
        <div className="login-right-text">
          <h2>Caja, almacén y kárdex en un solo sistema.</h2>
          <p>Vende por saco, medio saco, arroba o kilo. Controla el stock y emite boletas al instante.</p>
        </div>
      </div>
    </div>
  );
}
