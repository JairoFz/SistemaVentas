import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Building, Upload, Check, AlertCircle } from 'lucide-react';
import fercordLogo from '../assets/fercord_logo.jpg';

export default function MiEmpresa() {
  const { empresaConfig, updateEmpresaConfig } = useApp();

  const [nombre, setNombre] = useState(empresaConfig.nombre || '');
  const [ruc, setRuc] = useState(empresaConfig.ruc || '');
  const [slogan, setSlogan] = useState(empresaConfig.slogan || '');
  const [direccion, setDireccion] = useState(empresaConfig.direccion || '');
  const [telefono, setTelefono] = useState(empresaConfig.telefono || '');
  const [logoBase64, setLogoBase64] = useState(empresaConfig.logo || '');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (empresaConfig) {
      setNombre(empresaConfig.nombre || '');
      setRuc(empresaConfig.ruc || '');
      setSlogan(empresaConfig.slogan || '');
      setDireccion(empresaConfig.direccion || '');
      setTelefono(empresaConfig.telefono || '');
      setLogoBase64(empresaConfig.logo || '');
    }
  }, [empresaConfig]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tamaño de archivo (Max 1MB para mantener la DB SQLite liviana)
    if (file.size > 1 * 1024 * 1024) {
      alert("El archivo es demasiado grande. El logo debe pesar menos de 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result); // Data URL con base64
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("El nombre de la empresa es obligatorio.");
      return;
    }

    updateEmpresaConfig({
      nombre,
      ruc,
      slogan,
      direccion,
      telefono,
      logo: logoBase64
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div>
      <div className="header-row page-header">
        <div>
          <h1>Configuración de Mi Empresa</h1>
          <p>Personaliza los datos impresos y el logotipo en boletas, facturas y reportes PDF</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginTop: 10 }}>
        
        {/* Lado izquierdo: Logotipo */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, textAlign: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 16 }}>LOGOTIPO DE LA EMPRESA</h3>
          
          <div style={{ position: 'relative', width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <img 
              src={logoBase64 || fercordLogo} 
              alt="Logo Vista Previa" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <Upload size={14} /> Subir nueva imagen
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange} 
              style={{ display: 'none' }} 
            />
          </label>
          
          <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 10 }}>
            Formatos sugeridos: JPG, PNG o WEBP.<br/>Tamaño recomendado: Cuadrado (1:1), máx 1MB.
          </p>

          {logoBase64 && (
            <button 
              className="action-btn del" 
              style={{ marginTop: 12, padding: '4px 10px', fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setLogoBase64('')}
            >
              Quitar Logotipo
            </button>
          )}
        </div>

        {/* Lado derecho: Formulario de Datos */}
        <form onSubmit={handleSave} className="stat-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={16} /> DATOS FISCALES Y DE CONTACTO
          </h3>

          {success && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
              <Check size={16} /> ¡Configuración guardada exitosamente! Los cambios se aplicarán en todos los comprobantes.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Razón Social / Nombre Comercial *</label>
              <input 
                className="form-input" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                placeholder="Ej. FERCORD S.A.C." 
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">RUC (Registro Único de Contribuyentes)</label>
              <input 
                className="form-input" 
                value={ruc} 
                onChange={e => setRuc(e.target.value.replace(/\D/g, ''))} 
                maxLength={11}
                placeholder="RUC de 11 dígitos" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Slogan / Actividad Comercial / Subtítulo</label>
            <input 
              className="form-input" 
              value={slogan} 
              onChange={e => setSlogan(e.target.value)} 
              placeholder="Ej. Alimentos Balanceados · Aves y Cerdos" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Dirección Fiscal / Establecimiento</label>
              <input 
                className="form-input" 
                value={direccion} 
                onChange={e => setDireccion(e.target.value)} 
                placeholder="Ej. Av. Principal 123, San Vicente de Cañete" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input 
                className="form-input" 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)} 
                placeholder="Ej. 999 999 999" 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Guardar Configuración
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
