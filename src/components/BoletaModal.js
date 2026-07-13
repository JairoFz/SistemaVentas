import { Printer, Download, Send, Mail, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { imprimirBoleta, generarHtmlBoleta } from '../utils/imprimirBoleta';
import fercordLogo from '../assets/fercord_logo.jpg';

export default function BoletaModal({ venta, onClose }) {
  const { clients, empresaConfig } = useApp();
  const clientObj = clients.find(c => c.id === venta.clienteId);
  
  const telefono = clientObj?.telefono ? clientObj.telefono.replace(/\D/g, '') : '';
  const email = clientObj?.email || '';

  const logoSrc = empresaConfig.logo ? empresaConfig.logo : fercordLogo;
  const brandName = empresaConfig.nombre || "FERCORD";
  const brandSub = empresaConfig.slogan || "Nutrición Balanceada · Aves y Cerdos";

  const handleExportPDF = async () => {
    if (!window.api || !window.api.printExportPdf) {
      alert("La exportación nativa a PDF solo está disponible en la versión de escritorio de Electron.");
      return;
    }
    const html = generarHtmlBoleta(venta, empresaConfig);
    const filename = `${venta.codigo}_${venta.clienteNombre.replace(/\s+/g, '_')}`;
    const res = await window.api.printExportPdf(html, filename);
    if (res.success) {
      alert(`PDF guardado con éxito.\nUbicación: ${res.filePath}`);
    } else if (res.error && res.error !== 'Guardado cancelado') {
      alert(`Error al guardar PDF: ${res.error}`);
    }
  };

  const handleWhatsApp = () => {
    if (!telefono) {
      alert("El cliente no tiene un celular registrado. Por favor, edítelo en el módulo Clientes.");
      return;
    }
    const cleanTel = telefono.length === 9 ? `51${telefono}` : telefono;
    
    let msg = `Hola *${venta.clienteNombre}*, gracias por tu compra en *${brandName}*.\n\n`;
    msg += `Te comparto el detalle de tu *${venta.tipo === 'factura' ? 'Factura' : 'Boleta'} ${venta.codigo}*:\n`;
    msg += `• *Total de Venta:* S/ ${venta.total.toFixed(2)}\n`;
    if (venta.estadoPago && venta.estadoPago !== 'pagado') {
      msg += `• *A cuenta:* S/ ${(venta.montoPagado || 0).toFixed(2)}\n`;
      msg += `• *Saldo pendiente:* S/ ${(venta.montoDeuda || 0).toFixed(2)}\n`;
    }

    const url = `https://api.whatsapp.com/send?phone=${cleanTel}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    if (!email) {
      alert("El cliente no tiene un correo electrónico registrado. Por favor, edítelo en el módulo Clientes.");
      return;
    }
    const subject = `Comprobante de Venta ${venta.codigo} - ${brandName}`;
    let body = `Hola ${venta.clienteNombre},\n\n`;
    body += `Le adjuntamos su comprobante de venta ${venta.tipo === 'factura' ? 'Factura' : 'Boleta'} ${venta.codigo}.\n\n`;
    body += `Detalles:\n`;
    body += `Total de la compra: S/ ${venta.total.toFixed(2)}\n`;
    if (venta.estadoPago && venta.estadoPago !== 'pagado') {
      body += `Monto cancelado: S/ ${(venta.montoPagado || 0).toFixed(2)}\n`;
      body += `Saldo pendiente de pago: S/ ${(venta.montoDeuda || 0).toFixed(2)}\n`;
    }
    body += `\nGracias por su preferencia.\n\nAtte,\n${brandName}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal boleta-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-body">
          <div className="boleta-header">
            <img src={logoSrc} alt="Logo" className="logo" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px', display: 'block' }} />
            <h3>{brandName}</h3>
            <p>{brandSub}</p>
            <hr style={{border:'none',borderTop:'1px dashed #ccc',margin:'12px 0 8px'}}/>
            <div style={{fontWeight:700,fontSize:14}}>
              {venta.tipo === 'factura' ? 'FACTURA DE VENTA' : 'BOLETA DE VENTA'}
            </div>
            <div style={{fontSize:13}}>{venta.codigo}</div>
            <div style={{fontSize:11,color:'#999',marginTop:2}}>{new Date(venta.fecha).toLocaleString('es-PE')}</div>
          </div>
          <div className="boleta-info">
            <p><strong>Cliente:</strong> {venta.clienteNombre}</p>
            <p><strong>Vendedor:</strong> {venta.vendedor}</p>
            <p><strong>Pago:</strong> {venta.metodoPago}</p>
          </div>
          <table className="boleta-table">
            <thead>
              <tr><th>Item</th><th>Cant</th><th>P.U.</th><th>Total</th></tr>
            </thead>
            <tbody>
              {venta.items.map((item,i) => {
                let descripcion = '';
                const kgPorSaco = item.kgPorSaco || 40;
                if (item.presentacion === 'saco') descripcion = `Saco ${kgPorSaco}kg`;
                else if (item.presentacion === 'medio') descripcion = `Medio ${(kgPorSaco/2).toFixed(1)}kg`;
                else if (item.presentacion === 'arroba') descripcion = `Arroba ${(11.5)}kg`;
                else if (item.presentacion === 'kilo') descripcion = `${item.cantidad} kg`;
                else if (item.presentacion === 'importe') descripcion = `Por importe`;
                else descripcion = 'Unidad';

                return (
                  <tr key={i}>
                    <td>
                      <div style={{fontWeight:500}}>{item.nombre}</div>
                      <div style={{fontSize:10,color:'#999',textTransform:'capitalize'}}>{descripcion}</div>
                    </td>
                    <td style={{textAlign:'center'}}>{item.presentacion === 'importe' ? '—' : item.cantidad}</td>
                    <td>{item.presentacion === 'importe' ? '—' : `S/ ${item.precioUnitario.toFixed(2)}`}</td>
                    <td style={{fontWeight:600}}>S/ {item.subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="boleta-total">
            <span>TOTAL</span>
            <span>S/ {venta.total.toFixed(2)}</span>
          </div>
          {venta.estadoPago && venta.estadoPago !== 'pagado' && (
            <div style={{ marginTop: 8, fontSize: 12, borderTop: '1px dotted #ccc', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>A cuenta:</span>
                <span style={{ fontWeight: 600 }}>S/ {(venta.montoPagado || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Saldo Pendiente:</span>
                <span>S/ {(venta.montoDeuda || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="boleta-gracias">¡Gracias por su compra!</div>
        </div>
        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: 6 }}>
          <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
          
          <button className="btn btn-outline" title="Guardar comprobante en PDF" onClick={handleExportPDF}>
            <Download size={14}/> PDF
          </button>
          
          <button 
            className="btn btn-outline" 
            style={{ 
              borderColor: telefono ? '#25d366' : '#ccc', 
              color: telefono ? '#25d366' : '#999',
              opacity: telefono ? 1 : 0.6
            }}
            title={telefono ? "Compartir por WhatsApp" : "El cliente no tiene celular registrado"}
            onClick={handleWhatsApp}
          >
            <Send size={14}/> WhatsApp
          </button>

          <button 
            className="btn btn-outline" 
            style={{ 
              borderColor: email ? '#ea4335' : '#ccc', 
              color: email ? '#ea4335' : '#999',
              opacity: email ? 1 : 0.6
            }}
            title={email ? "Enviar por Correo Electrónico" : "El cliente no tiene correo registrado"}
            onClick={handleEmail}
          >
            <Mail size={14}/> Correo
          </button>

          <button className="btn btn-primary" onClick={() => imprimirBoleta(venta, empresaConfig)}>
            <Printer size={14}/> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
