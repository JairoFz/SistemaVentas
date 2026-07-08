import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const EMPTY = { nombre:'', dni:'', telefono:'', direccion:'' };

export default function Clientes() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);

  const consultarDoc = async () => {
    if (!window.api) {
      alert("La consulta SUNAT/RENIEC solo está disponible en la aplicación de escritorio.");
      return;
    }
    const doc = form.dni.trim();
    if (doc.length !== 8 && doc.length !== 11) return;
    
    setLoadingQuery(true);
    const token = localStorage.getItem('sunat_api_token') || '';
    
    try {
      if (doc.length === 8) {
        const res = await window.api.consultarDni(doc, token);
        if (res.success && res.data) {
          const nombreCompleto = `${res.data.nombres || ''} ${res.data.apellidoPaterno || ''} ${res.data.apellidoMaterno || ''}`.replace(/\s+/g, ' ').trim();
          setForm(prev => ({
            ...prev,
            nombre: nombreCompleto
          }));
        } else {
          alert(`Error: ${res.error || 'No se encontraron datos para este DNI.'}`);
        }
      } else {
        const res = await window.api.consultarRuc(doc, token);
        if (res.success && res.data) {
          setForm(prev => ({
            ...prev,
            nombre: res.data.razonSocial || res.data.nombre || res.data.razon_social || '',
            direccion: res.data.direccion || ''
          }));
        } else {
          alert(`Error: ${res.error || 'No se encontraron datos para este RUC.'}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error inesperado al conectar con el servidor.");
    } finally {
      setLoadingQuery(false);
    }
  };

  const open = (c=null) => { setForm(c ? {...c} : EMPTY); setEditId(c?.id||null); setModal(true); };
  const close = () => { setModal(false); setForm(EMPTY); setEditId(null); };
  const save = () => {
    if (!form.nombre.trim()) return;
    if (editId) updateClient({...form, id:editId});
    else addClient(form);
    close();
  };

  return (
    <div>
      <div className="header-row page-header">
        <div><h1>Clientes</h1><p>Cartera de compradores y registro para boletas/facturas</p></div>
        <button className="btn btn-primary" onClick={()=>open()}><Plus size={15}/>Nuevo cliente</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>DNI / RUC</th><th>Teléfono</th><th>Dirección</th><th className="text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {clients.map(c=>(
              <tr key={c.id}>
                <td><strong>{c.nombre}</strong></td>
                <td>{c.dni||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                <td>{c.telefono||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                <td>{c.direccion||<span style={{color:'var(--text-light)'}}>—</span>}</td>
                <td className="text-right" style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                  {c.id!==1&&<><button className="action-btn edit" onClick={()=>open(c)}><Pencil size={13}/></button>
                  <button className="action-btn del" onClick={()=>deleteClient(c.id)}><Trash2 size={13}/></button></>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editId?'Editar cliente':'Nuevo cliente'}</h2>
              <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-light)'}} onClick={close}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">DNI / RUC (RENIEC/SUNAT)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    className="form-input" 
                    value={form.dni} 
                    onChange={e=>setForm({...form,dni:e.target.value.replace(/\D/g, '')})} 
                    placeholder="Número de documento (8 o 11 dígitos)"
                    maxLength={11}
                  />
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0 14px', whiteSpace: 'nowrap', minHeight: 38 }}
                    onClick={consultarDoc}
                    disabled={loadingQuery || (form.dni.length !== 8 && form.dni.length !== 11)}
                  >
                    {loadingQuery ? 'Buscando...' : 'Consultar'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre / Razón social *</label>
                <input className="form-input" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre completo o razón social"/>
              </div>
              <div className="form-group"><label className="form-label">Teléfono</label>
                <input className="form-input" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="999 999 999"/></div>
              <div className="form-group"><label className="form-label">Dirección</label>
                <input className="form-input" value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} placeholder="Dirección completa"/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={close}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
