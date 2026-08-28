// Generación de PDF con metrajes individuales y totales

function generarPDF() {
    const nombre = document.getElementById('nombreCliente').value.trim();
    const tipoDocumento = document.getElementById('tipoDocumento')?.value || 'Presupuesto';
    const numeroCliente = document.getElementById('numeroCliente')?.value.trim() || '';
    
    if (!nombre) {
        msg('msg-presupuesto', 'Ingrese nombre del cliente', 'error');
        return;
    }

    const vidrios = [];
    const vidriosProcesados = new Set();

    document.querySelectorAll('.fila-vidrio').forEach(fila => {
        // Solo procesar si es un vidrio de presupuesto (no de orden ni etiquetas)
        if (!fila.id.startsWith('vid-') || fila.id.includes('orden')) {
            return;
        }

        const id = fila.id.split('-')[1];

        // Evitar procesar el mismo vidrio dos veces
        if (vidriosProcesados.has(id)) {
            return;
        }
        vidriosProcesados.add(id);

        // Verificar que todos los elementos existen antes de acceder
        const pzaElem = document.getElementById(`pza-${id}`);
        const groElem = document.getElementById(`gro-${id}`);
        const med1Elem = document.getElementById(`med1-${id}`);
        const med2Elem = document.getElementById(`med2-${id}`);
        const trabElem = document.getElementById(`trab-${id}`);
        const formElem = document.getElementById(`form-${id}`);
        const totalElem = document.getElementById(`total-completo-${id}`);

        // Si falta algún elemento, saltar esta fila
        if (!pzaElem || !groElem || !med1Elem || !med2Elem || !trabElem || !formElem || !totalElem) {
            return;
        }

        const pz = pzaElem.value;
        const g = groElem.value;
        const m1 = parseFloat(med1Elem.value);
        const m2 = parseFloat(med2Elem.value);
        const t = trabElem.value;
        const f = formElem.value;
        const tot = totalElem.textContent;
        const total = parseFloat(tot.replace(/[$,]/g, '')) || 0;

        let cantidadUnidades = 1;
        let configLados = 'completo';
        let trabajoNombre = t;
        let tipoCalculoPersonalizado = null;

        // Manejar trabajo personalizado
        if (t === 'OTRO') {
            trabajoNombre = document.getElementById(`nombre-personalizado-${id}`)?.value || 'Trabajo Personalizado';
            tipoCalculoPersonalizado = document.getElementById(`tipo-calculo-${id}`)?.value;

            if (tipoCalculoPersonalizado === 'ml') {
                configLados = document.getElementById(`num-lados-personalizado-${id}`)?.value || 'completo';
            } else if (tipoCalculoPersonalizado === 'unidad') {
                cantidadUnidades = parseInt(document.getElementById(`cant-unidades-personalizado-${id}`)?.value) || 1;
            }
        } else if (t === 'Canto Pulido' || t === 'Filo Muerto' || t === 'Bisel') {
            configLados = document.getElementById(`num-lados-${id}`).value;
        } else if (t.startsWith('Saques') || t.startsWith('Perforaciones')) {
            cantidadUnidades = parseInt(document.getElementById(`cant-unidades-${id}`).value) || 1;
        }

        const procesos = [];
        const listaProcesos = document.getElementById(`lista-procesos-${id}`);
        if (listaProcesos) {
            listaProcesos.querySelectorAll('.proceso-item').forEach(item => {
                const tipo = item.getAttribute('data-tipo');
                const precio = item.getAttribute('data-precio');
                const info = item.getAttribute('data-info');
                const cantidad = item.getAttribute('data-cantidad') || 1;
                procesos.push({ tipo, precio, info, cantidad });
            });
        }

        if (g && m1 && m2 && t && total > 0) {
            vidrios.push({
                pz,
                g,
                m1,
                m2,
                t: trabajoNombre,
                tOriginal: t,
                f,
                total: total.toFixed(2),
                procesos,
                cantidadUnidades,
                configLados,
                tipoCalculoPersonalizado
            });
        }
    });

    if (vidrios.length === 0) {
        msg('msg-presupuesto', 'Agregue al menos un vidrio', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15;
    const yHeaderStart = y;

    // ===== LOGO centrado arriba =====
    let logoAlto = 0;
    try {
        if (CONFIG.LOGO_BASE64 &&
            CONFIG.LOGO_BASE64.trim() !== "" &&
            CONFIG.LOGO_BASE64.startsWith('data:image')) {

            let formato = 'PNG';
            if (CONFIG.LOGO_BASE64.includes('jpeg') || CONFIG.LOGO_BASE64.includes('jpg')) {
                formato = 'JPEG';
            }

            const logoAncho = 61;
            logoAlto = logoAncho * (424 / 1280);
            const logoX = (210 - logoAncho) / 2;
            doc.addImage(CONFIG.LOGO_BASE64, formato, logoX, yHeaderStart, logoAncho, logoAlto);
            console.log('✓ Logo cargado correctamente');
        } else {
            console.log('ℹ Logo no configurado o inválido - continuando sin logo');
        }
    } catch (e) {
        console.error('⚠ Error al cargar logo:', e.message);
    }

    // ===== QR en esquina superior derecha =====
    let qrBloqueAlto = 0;
    try {
        if (CONFIG.QR_BASE64 &&
            CONFIG.QR_BASE64.trim() !== "" &&
            CONFIG.QR_BASE64.startsWith('data:image')) {

            const qrTam = 20; // 20x20 mm
            const qrX = 195 - qrTam; // alineado al margen derecho
            const qrY = yHeaderStart;

            doc.addImage(CONFIG.QR_BASE64, 'PNG', qrX, qrY, qrTam, qrTam);

            // Texto debajo del QR (clicable si hay QR_URL)
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);

            const textoQR = CONFIG.QR_TEXTO || 'Visítanos';
            const anchoTextoQR = doc.getTextWidth(textoQR);
            const xTextoQR = qrX + (qrTam / 2) - (anchoTextoQR / 2);
            const yTextoQR = qrY + qrTam + 3;

            if (CONFIG.QR_URL) {
                doc.textWithLink(textoQR, xTextoQR, yTextoQR, { url: CONFIG.QR_URL });
            } else {
                doc.text(textoQR, xTextoQR, yTextoQR);
            }

            qrBloqueAlto = qrTam + 5; // imagen + texto
            console.log('✓ QR cargado correctamente');
        } else {
            console.log('ℹ QR no configurado o inválido - continuando sin QR');
        }
    } catch (e) {
        console.error('⚠ Error al cargar QR:', e.message);
    }

    // Avanzamos y según el elemento más alto (logo o QR)
    const maxAltoHeader = Math.max(logoAlto, qrBloqueAlto);
    y = yHeaderStart + (maxAltoHeader > 0 ? maxAltoHeader + 8 : 5);

    const TAMANO_LETRA = 10;
    
    // LADO IZQUIERDO - Datos del cliente (en columna vertical)
    const xIzq = 15;
    
    // Formatear fecha con ceros: DD/MM/AAAA
    const fechaActual = new Date();
    const diaActual = String(fechaActual.getDate()).padStart(2, '0');
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anioActual = fechaActual.getFullYear();
    const fechaFormateada = `${diaActual}/${mesActual}/${anioActual}`;
    
    // Primera línea: Fecha con línea subrayada
    doc.setFontSize(TAMANO_LETRA);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Fecha:', xIzq, y);
    
    doc.setFont('helvetica', 'normal');
    const anchoFecha = doc.getTextWidth(fechaFormateada);
    const xFechaNum = xIzq + doc.getTextWidth('Fecha:') + 1;
    doc.text(fechaFormateada, xFechaNum, y);
    doc.setLineWidth(0.3);
    doc.line(xFechaNum, y + 0.5, xFechaNum + anchoFecha, y + 0.5);
    
    y += 5;
    
    // Segunda línea: Cliente
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', xIzq, y);
    
    doc.setFont('helvetica', 'normal');
    const anchoCliente = doc.getTextWidth(nombre);
    const xClienteNombre = xIzq + doc.getTextWidth('Cliente:') + 1;
    doc.text(nombre, xClienteNombre, y);
    doc.line(xClienteNombre, y + 0.5, xClienteNombre + anchoCliente, y + 0.5);
    
    y += 5;
    
    // Tercera línea: Teléfono
    const telCliente = numeroCliente || '_______________';
    doc.setFont('helvetica', 'bold');
    doc.text('Teléfono:', xIzq, y);
    
    doc.setFont('helvetica', 'normal');
    const xTelNum = xIzq + doc.getTextWidth('Teléfono:') + 2;
    const anchoTel = doc.getTextWidth(telCliente);
    doc.text(telCliente, xTelNum, y);
    doc.line(xTelNum, y + 0.6, xTelNum + anchoTel, y + 0.6);
    
    // LADO DERECHO - Información de la empresa
    const xDerecha = 195;
    let yDerecha = y - 10; // Ajustar para que quede alineado con la sección izquierda
    
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(CONFIG.EMPRESA.direccion, xDerecha, yDerecha, { align: 'right' });
    yDerecha += 5;
    doc.text(`Tel: ${CONFIG.EMPRESA.telefono}`, xDerecha, yDerecha, { align: 'right' });
    yDerecha += 5;
    doc.text(CONFIG.EMPRESA.email, xDerecha, yDerecha, { align: 'right' });

    y += 8;
    
    // Línea separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 8;

    // TÍTULO DINÁMICO
    const tituloDocumento = tipoDocumento === 'Nota' ? 'NOTA DE VIDRIOS' : 'PRESUPUESTO DE VIDRIOS';
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text(tituloDocumento, 105, y, { align: 'center' });
    y += 10;

    // CÁLCULO DE METRAJES TOTALES
    let totalM2 = 0;
    let totalML = 0;
    const detallesM2 = {};
    const detallesML = {};
    const detallesUnidades = {};

    function calcML(m1, m2, config) {
        const cabezal = Math.min(m1, m2);
        const larguero = Math.max(m1, m2);

        switch (config) {
            case 'completo': return (cabezal * 2) + (larguero * 2);
            case '2cab-1larg': return (cabezal * 2) + larguero;
            case '1cab-2larg': return cabezal + (larguero * 2);
            case '2cab': return cabezal * 2;
            case '2larg': return larguero * 2;
            case '1cab-1larg': return cabezal + larguero;
            case '1cab': return cabezal;
            case '1larg': return larguero;
            default: return (cabezal * 2) + (larguero * 2);
        }
    }

    const datos = vidrios.map(v => {
        const piezasNum = parseInt(v.pz);
        let trabajoCompleto = `${v.t}`;
        
        if (v.tOriginal !== 'OTRO' && v.f) {
            trabajoCompleto += ` - ${v.f}`;
        }
        
        if (v.procesos && v.procesos.length > 0) {
            trabajoCompleto += '\n' + v.procesos.map(p => `+ ${p.tipo}`).join('\n');
        }

        const m1 = parseFloat(v.m1);
        const m2 = parseFloat(v.m2);
        let metrajeUnitario = '';

        // Calcular metraje del trabajo base
        if (v.tOriginal === 'OTRO') {
            if (v.tipoCalculoPersonalizado === 'ml') {
                const mlUnitario = calcML(m1, m2, v.configLados);
                const mlTotal = mlUnitario * piezasNum;
                metrajeUnitario = `${mlUnitario.toFixed(2)} ml`;
                totalML += mlTotal;
                detallesML[v.t] = (detallesML[v.t] || 0) + mlTotal;
            } else if (v.tipoCalculoPersonalizado === 'unidad') {
                const cantidad = parseInt(v.cantidadUnidades);
                metrajeUnitario = `${cantidad} ud`;
                const totalUnidades = cantidad * piezasNum;
                detallesUnidades[v.t] = (detallesUnidades[v.t] || 0) + totalUnidades;
            } else if (v.tipoCalculoPersonalizado === 'm2') {
                const areaUnitaria = m1 * m2;
                const areaTotal = areaUnitaria * piezasNum;
                metrajeUnitario = `${areaUnitaria.toFixed(4)} m²`;
                totalM2 += areaTotal;
                detallesM2[v.t] = (detallesM2[v.t] || 0) + areaTotal;
            } else if (v.tipoCalculoPersonalizado === 'unico') {
                metrajeUnitario = 'P. Único';
            }
        } else if (v.tOriginal === 'Canto Pulido' || v.tOriginal === 'Filo Muerto' || v.tOriginal === 'Bisel') {
            const mlUnitario = calcML(m1, m2, v.configLados);
            const mlTotal = mlUnitario * piezasNum;
            metrajeUnitario = `${mlUnitario.toFixed(2)} ml`;
            totalML += mlTotal;
            detallesML[v.tOriginal] = (detallesML[v.tOriginal] || 0) + mlTotal;
        } else if (v.tOriginal.startsWith('Perforaciones') || v.tOriginal.startsWith('Saques')) {
            const cantidad = parseInt(v.cantidadUnidades);
            metrajeUnitario = `${cantidad} ud`;
            const totalUnidades = cantidad * piezasNum;
            detallesUnidades[v.tOriginal] = (detallesUnidades[v.tOriginal] || 0) + totalUnidades;
        } else {
            const areaUnitaria = m1 * m2;
            const areaTotal = areaUnitaria * piezasNum;
            metrajeUnitario = `${areaUnitaria.toFixed(4)} m²`;
            totalM2 += areaTotal;
            detallesM2[v.tOriginal] = (detallesM2[v.tOriginal] || 0) + areaTotal;
        }

        // Procesar procesos adicionales
        if (v.procesos && v.procesos.length > 0) {
            v.procesos.forEach(proc => {
                const tipoProc = proc.tipo;

                if (tipoProc.includes('Canto Pulido') || tipoProc.includes('Filo Muerto') || tipoProc.includes('Bisel')) {
                    const mlUnitario = calcML(m1, m2, v.configLados);
                    const mlTotal = mlUnitario * piezasNum;
                    totalML += mlTotal;
                    detallesML[tipoProc] = (detallesML[tipoProc] || 0) + mlTotal;
                } else if (tipoProc.startsWith('Perforaciones') || tipoProc.startsWith('Saques')) {
                    const cantidad = parseInt(proc.cantidad) || 1;
                    const totalUnidades = cantidad * piezasNum;
                    detallesUnidades[tipoProc] = (detallesUnidades[tipoProc] || 0) + totalUnidades;
                } else {
                    const areaUnitaria = m1 * m2;
                    const areaTotal = areaUnitaria * piezasNum;
                    totalM2 += areaTotal;
                    detallesM2[tipoProc] = (detallesM2[tipoProc] || 0) + areaTotal;
                }
            });
        }

        const precioUnitario = (parseFloat(v.total) / piezasNum).toFixed(2);

        return [
            v.pz,
            v.g,
            `${v.m1}x${v.m2}`,
            trabajoCompleto,
            metrajeUnitario,
            `${precioUnitario}`,
            `${v.total}`
        ];
    });

    const totalG = vidrios.reduce((s, v) => s + parseFloat(v.total), 0);

    // Tabla principal
    doc.autoTable({
        startY: y,
        head: [['Pzs', 'Grosor', 'Medidas', 'Trabajo', 'Metraje', 'P. Unit', 'Total']],
        body: datos,
        foot: [
            ['', '', '', '', '', 'TOTAL:', `${totalG.toFixed(2)}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234], fontSize: 9, fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: [76, 175, 80], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 55 },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 23, halign: 'right' },
            6: { cellWidth: 23, halign: 'right' }
        },
        styles: { font: 'helvetica', fontStyle: 'normal' },
        showHead: 'everyPage',
        showFoot: 'lastPage',
        margin: { top: 15, bottom: 25 },
        didDrawPage: function (data) {
            if (data.pageNumber > 1) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(102, 126, 234);
                doc.text(`${tituloDocumento} - Continuación`, 105, 10, { align: 'center' });
            }
        }
    });

    // ============= DESGLOSE Y FIRMA =============
    y = doc.lastAutoTable.finalY + 10;
    
    // Guardar posición inicial para la firma
    const yInicioSeccion = y;
    
    // DESGLOSE DE METRAJES (lado izquierdo con ancho controlado)
    const xDesglose = 15;
    const anchoMaxDesglose = 115; // Ancho máximo para el desglose (no invadir firma)
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('DESGLOSE DE METRAJES:', xDesglose, y);
    y += 6;

    doc.setFontSize(8);

    // Función mejorada para escribir texto con salto de línea automático
    function escribirTextoConSalto(texto, x, yPos, anchoMax) {
        const palabras = texto.split(' ');
        let linea = '';
        const lineas = [];
        
        palabras.forEach(palabra => {
            const pruebaLinea = linea + (linea ? ' ' : '') + palabra;
            const anchoLinea = doc.getTextWidth(pruebaLinea);
            
            if (anchoLinea > anchoMax && linea) {
                lineas.push(linea);
                linea = palabra;
            } else {
                linea = pruebaLinea;
            }
        });
        
        if (linea) {
            lineas.push(linea);
        }
        
        lineas.forEach((lineaTexto, index) => {
            doc.text(lineaTexto, x, yPos + (index * 3.5));
        });
        
        return lineas.length * 3.5; // Retorna la altura total usada
    }

    // Función para verificar si necesitamos nueva página
    function verificarYAjustar() {
        if (y > 270) {
            doc.addPage();
            y = 20;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(102, 126, 234);
            doc.text('DESGLOSE DE METRAJES (continuación):', xDesglose, y);
            y += 6;
            doc.setFontSize(8);
        }
    }

    // M²
    if (Object.keys(detallesM2).length > 0) {
        verificarYAjustar();
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`M²:`, xDesglose, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        Object.entries(detallesM2).forEach(([tipo, valor]) => {
            verificarYAjustar();
            const textoCompleto = `• ${tipo}: ${valor.toFixed(4)} m²`;
            const alturaUsada = escribirTextoConSalto(textoCompleto, xDesglose + 5, y, anchoMaxDesglose - 5);
            y += alturaUsada;
        });
        y += 2;
    }

    // M Lineales
    if (Object.keys(detallesML).length > 0) {
        verificarYAjustar();
        doc.setFont('helvetica', 'bold');
        doc.text(`M Lineales:`, xDesglose, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        Object.entries(detallesML).forEach(([tipo, valor]) => {
            verificarYAjustar();
            const textoCompleto = `• ${tipo}: ${valor.toFixed(2)} ml`;
            const alturaUsada = escribirTextoConSalto(textoCompleto, xDesglose + 5, y, anchoMaxDesglose - 5);
            y += alturaUsada;
        });
        y += 2;
    }

    // Unidades
    if (Object.keys(detallesUnidades).length > 0) {
        verificarYAjustar();
        doc.setFont('helvetica', 'bold');
        doc.text(`Unidades:`, xDesglose, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        Object.entries(detallesUnidades).forEach(([tipo, valor]) => {
            verificarYAjustar();
            const textoCompleto = `• ${tipo}: ${valor} ud`;
            const alturaUsada = escribirTextoConSalto(textoCompleto, xDesglose + 5, y, anchoMaxDesglose - 5);
            y += alturaUsada;
        });
    }

    // ============= FIRMA (lado derecho, más abajo del título) =============
    const xFirma = 140;
    const yFirma = yInicioSeccion + 10; // 10mm más abajo que el título de desglose
    
    // Línea para firmar
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(xFirma, yFirma, xFirma + 50, yFirma);
    
    // Texto "Firma" debajo de la línea
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Firma', xFirma + 22, yFirma + 5);

    // ============= NOTAS AL PIE =============
    const yNotas = Math.max(y + 8, yFirma + 15); // Al menos 15mm después de la firma
    
    if (yNotas > 270) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Nota: No nos hacemos responsables de maquila terminada después de 30 días.', 15, yNotas > 270 ? 20 : yNotas);
    doc.text('Toda la maquila es bajo su riesgo.', 15, (yNotas > 270 ? 20 : yNotas) + 4);

    // Guardar PDF
    const fechaArchivo = new Date();
    const diaArchivo = String(fechaArchivo.getDate()).padStart(2, '0');
    const mesArchivo = String(fechaArchivo.getMonth() + 1).padStart(2, '0');
    const anioArchivo = fechaArchivo.getFullYear();
    const fechaFormato = `${diaArchivo}-${mesArchivo}-${anioArchivo}`;
    const nombreLimpio = nombre.replace(/[^a-zA-Z0-9ñÑ ]/g, '').replace(/ /g, '_');
    const tipoDoc = tipoDocumento === 'Nota' ? 'Nota' : 'Presupuesto';
    const nombreArchivo = `${tipoDoc}_${nombreLimpio}_${fechaFormato}.pdf`;

    doc.save(nombreArchivo);
    msg('msg-presupuesto', 'PDF generado correctamente', 'exito');
}