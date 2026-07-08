import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Check, AlertCircle, Database, Printer } from 'lucide-react';

export default function Perfil() {
  const { currentUser, updateUser, changePassword } = useApp();
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [msgPerfil, setMsgPerfil] = useState(null);

  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(() => localStorage.getItem('preferred_printer') || '');
  const [sunatToken, setSunatToken] = useState(() => localStorage.getItem('sunat_api_token') || '');
  const [useSilentPrint, setUseSilentPrint] = useState(() => localStorage.getItem('use_silent_print') === 'true');

  useEffect(() => {
    if (window.api && window.api.printGetPrinters) {
      window.api.printGetPrinters()
        .then(list => setPrinters(list))
        .catch(console.error);
    }
  }, []);

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

  const cambiarPassword = async () => {
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
    const ok = await changePassword(currentUser.id, actual, nueva);
    if (!ok) {
      setMsgPass({ type:'error', text:'La contraseña actual es incorrecta.' });
      return;
    }
    setMsgPass({ type:'ok', text:'Contraseña actualizada correctamente.' });
    setActual(''); setNueva(''); setConfirmar('');
  };

  const [msgBackup, setMsgBackup] = useState(null);

  const handleExportBackup = async () => {
    setMsgBackup(null);
    if (window.api && window.api.backupExport) {
      const ok = await window.api.backupExport();
      if (ok) {
        setMsgBackup({ type: 'ok', text: 'Copia de seguridad guardada correctamente.' });
      } else {
        setMsgBackup({ type: 'error', text: 'La exportación fue cancelada o falló.' });
      }
    } else {
      setMsgBackup({ type: 'error', text: 'Esta función solo está disponible en la aplicación de escritorio.' });
    }
  };

  const handleImportBackup = async () => {
    setMsgBackup(null);
    if (window.api && window.api.backupImport) {
      const confirmar = window.confirm("¿Estás seguro de restaurar una copia de seguridad? Esto reemplazará todos los datos actuales y reiniciará la aplicación.");
      if (!confirmar) return;

      const res = await window.api.backupImport();
      if (res && !res.success) {
        setMsgBackup({ type: 'error', text: res.msg || 'La restauración falló.' });
      }
    } else {
      setMsgBackup({ type: 'error', text: 'Esta función solo está disponible en la aplicación de escritorio.' });
    }
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

      {/* Administración de Base de Datos */}
      {currentUser?.rol === 'admin' && (
        <div className="card" style={{ marginTop: 20, maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span className="stat-icon green"><Database size={16} /></span>
            <h3 style={{ fontSize: 16 }}>Administración de Base de Datos</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Crea copias de seguridad de tu base de datos local SQLite o restaura una copia anterior.
            Restaurar una copia de seguridad reemplazará todos los datos actuales y reiniciará la aplicación.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={handleExportBackup}>
              Crear copia de seguridad (.db)
            </button>
            <button className="btn btn-primary" onClick={handleImportBackup} style={{ backgroundColor: '#e67e22', borderColor: '#e67e22' }}>
              Restaurar base de datos
            </button>
          </div>
          {msgBackup && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 8, fontSize: 13, marginTop: 16,
              background: msgBackup.type === 'ok' ? 'var(--green-light)' : 'var(--red-light)',
              color: msgBackup.type === 'ok' ? 'var(--green)' : 'var(--red)',
            }}>
              {msgBackup.type === 'ok' ? <Check size={15} /> : <AlertCircle size={15} />}
              {msgBackup.text}
            </div>
          )}
        </div>
      )}

      {/* Configuración de Impresión y SUNAT */}
      <div className="card" style={{ marginTop: 20, maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span className="stat-icon green"><Printer size={16} /></span>
          <h3 style={{ fontSize: 16 }}>Configuración de Impresión y SUNAT</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Impresora de Tickets (POS)</label>
            <select 
              className="form-select" 
              value={selectedPrinter} 
              onChange={e => {
                const val = e.target.value;
                setSelectedPrinter(val);
                localStorage.setItem('preferred_printer', val);
              }}
            >
              <option value="">-- Impresora predeterminada del sistema --</option>
              {printers.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} {p.isDefault ? '(Predeterminada)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Modo de Impresión</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '38px' }}>
              <input 
                type="checkbox" 
                id="chk_silent"
                checked={useSilentPrint} 
                onChange={e => {
                  const val = e.target.checked;
                  setUseSilentPrint(val);
                  localStorage.setItem('use_silent_print', val ? 'true' : 'false');
                }}
              />
              <label htmlFor="chk_silent" style={{ fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                Impresión silenciosa directa (Sin previsualización)
              </label>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Token de Consulta DNI/RUC (APIs.net.pe)</label>
          <input 
            className="form-input" 
            value={sunatToken} 
            onChange={e => {
              const val = e.target.value;
              setSunatToken(val);
              localStorage.setItem('sunat_api_token', val);
            }} 
            placeholder="Introduce tu token personal de APIs.net.pe"
          />
          <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
            Por defecto se utilizará un token demo público de la SUNAT/RENIEC. Puedes registrarte gratis en <a href="https://apis.net.pe" target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontWeight: 600 }}>APIs.net.pe</a> para obtener tu propio token si presentas límites.
          </span>
        </div>
      </div>
    </div>
  );
}