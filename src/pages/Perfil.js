import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Check, AlertCircle } from 'lucide-react';

export default function Perfil() {
  const { currentUser, updateUser, changePassword } = useApp();
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [msgPerfil, setMsgPerfil] = useState(null);

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [msgPass, setMsgPass] = useState(null);

  const guardarPerfil = () => {
    if (!nombre.trim() || !email.trim()) {
      setMsgPass(null);
      setMsgPerfil({ type:'error', text:'Nombre y correo son obligatorios.' });
      return;
    }
    updateUser({ id: currentUser.id, nombre, email });
    setMsgPerfil({ type:'ok', text:'Perfil actualizado correctamente.' });
  };

  const cambiarPassword = () => {
    setMsgPass(null);
    if (!actual || !nueva || !confirmar) {
      setMsgPass({ type:'error', text:'Completa todos los campos.' });
      return;
    }
    if (nueva.length < 6) {
      setMsgPass({ type:'error', text:'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (nueva !== confirmar) {
      setMsgPass({ type:'error', text:'Las contraseñas nuevas no coinciden.' });
      return;
    }
    const ok = changePassword(currentUser.id, actual, nueva);
    if (!ok) {
      setMsgPass({ type:'error', text:'La contraseña actual es incorrecta.' });
      return;
    }
    setMsgPass({ type:'ok', text:'Contraseña actualizada correctamente.' });
    setActual(''); setNueva(''); setConfirmar('');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Mi perfil</h1>
        <p>Administra tu información personal y contraseña</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:900}}>
        {/* Datos de perfil */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20}}>
            <span className="stat-icon green"><User size={16}/></span>
            <h3 style={{fontSize:16}}>Información de la cuenta</h3>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div className="user-avatar" style={{width:48,height:48,fontSize:18}}>{currentUser.nombre[0]}</div>
            <div>
              <div style={{fontWeight:600,fontSize:15}}>{currentUser.nombre}</div>
              <span className={`badge ${currentUser.rol==='admin'?'badge-green':'badge-orange'}`}>{currentUser.rol}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={nombre} onChange={e=>setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          {msgPerfil && (
            <div style={{
              display:'flex',alignItems:'center',gap:8,
              padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16,
              background: msgPerfil.type==='ok' ? 'var(--green-light)' : 'var(--red-light)',
              color: msgPerfil.type==='ok' ? 'var(--green)' : 'var(--red)',
            }}>
              {msgPerfil.type==='ok' ? <Check size={15}/> : <AlertCircle size={15}/>}
              {msgPerfil.text}
            </div>
          )}

          <button className="btn btn-primary" onClick={guardarPerfil}>Guardar cambios</button>
        </div>

        {/* Cambio de contraseña */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20}}>
            <span className="stat-icon green"><Lock size={16}/></span>
            <h3 style={{fontSize:16}}>Cambiar contraseña</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña actual</label>
            <input className="form-input" type="password" value={actual} onChange={e=>setActual(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">Nueva contraseña</label>
            <input className="form-input" type="password" value={nueva} onChange={e=>setNueva(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar nueva contraseña</label>
            <input className="form-input" type="password" value={confirmar} onChange={e=>setConfirmar(e.target.value)} placeholder="Repite la nueva contraseña" />
          </div>

          {msgPass && (
            <div style={{
              display:'flex',alignItems:'center',gap:8,
              padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16,
              background: msgPass.type==='ok' ? 'var(--green-light)' : 'var(--red-light)',
              color: msgPass.type==='ok' ? 'var(--green)' : 'var(--red)',
            }}>
              {msgPass.type==='ok' ? <Check size={15}/> : <AlertCircle size={15}/>}
              {msgPass.text}
            </div>
          )}

          <button className="btn btn-primary" onClick={cambiarPassword}>Actualizar contraseña</button>
        </div>
      </div>
    </div>
  );
}