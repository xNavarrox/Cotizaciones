// Generación de PDF con metrajes individuales y totales
// MODIFICADO: QR más pequeño + doble comprobante (ORIGINAL / COPIA) en la misma hoja + nota más separada

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
        if (!fila.id.startsWith('vid-') || fila.id.includes('orden')) {
            return;
        }

        const id = fila.id.split('-')[1];

        if (vidriosProcesados.has(id)) {
            return;
        }
        vidriosProcesados.add(id);

        const pzaElem = document.getElementById(`pza-${id}`);
        const groElem = document.getElementById(`gro-${id}`);
        const med1Elem = document.getElementById(`med1-${id}`);
        const med2Elem = document.getElementById(`med2-${id}`);
        const trabElem = document.getElementById(`trab-${id}`);
        const formElem = document.getElementById(`form-${id}`);
        const totalElem = document.getElementById(`total-completo-${id}`);

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
                pz, g, m1, m2,
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

    // ============================================================
    // CÁLCULOS (se hacen UNA sola vez, se reutilizan para ambas copias)
    // ============================================================
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
            v.pz, v.g, `${v.m1}x${v.m2}`, trabajoCompleto,
            metrajeUnitario, `${precioUnitario}`, `${v.total}`
        ];
    });

    const totalG = vidrios.reduce((s, v) => s + parseFloat(v.total), 0);

    // Fecha formateada (una sola vez)
    const fechaActual = new Date();
    const fechaFormateada = `${String(fechaActual.getDate()).padStart(2, '0')}/${String(fechaActual.getMonth() + 1).padStart(2, '0')}/${fechaActual.getFullYear()}`;
    const tituloDocumento = tipoDocumento === 'Nota' ? 'NOTA DE VIDRIOS' : 'PRESUPUESTO DE VIDRIOS';

    // ============================================================
    // ARMADO DEL PDF: 2 comprobantes (ORIGINAL arriba / COPIA abajo)
    // ============================================================
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const ANCHO_PAGINA = 210;
    const ALTO_PAGINA = 297;
    const ALTO_MITAD = ALTO_PAGINA / 2; // 148.5mm

    // Separación mínima que debe quedar entre el desglose de material y la nota de pie
    const SEPARACION_NOTAS_MIN = 10; // mm -> ajusta aquí si quieres más o menos aire

    // Espacio aproximado que ocupan encabezado (logo/qr/cliente/título) y pie (desglose+firma+nota)
    // Se usan solo para DECIDIR si el comprobante cabe en media hoja o necesita hoja completa.
    const ESPACIO_HEADER_APROX = 50; // mm desde el borde superior del bloque hasta donde arranca la tabla
    const ESPACIO_PIE_APROX = 38;    // mm que necesita desglose + firma + nota como mínimo

    // ---------- Medición previa de la tabla (para saber su altura real sin dibujarla) ----------
    function medirAlturaTabla() {
        const docTemp = new jsPDF();
        docTemp.autoTable({
            startY: 0,
            head: [['Pzs', 'Grosor', 'Medidas', 'Trabajo', 'Metraje', 'P. Unit', 'Total']],
            body: datos,
            foot: [['', '', '', '', '', 'TOTAL:', `${totalG.toFixed(2)}`]],
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
            footStyles: { fillColor: [76, 175, 80], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 11, halign: 'center' },
                1: { cellWidth: 14, halign: 'center' },
                2: { cellWidth: 18, halign: 'center' },
                3: { cellWidth: 50 },
                4: { cellWidth: 18, halign: 'center' },
                5: { cellWidth: 21, halign: 'right' },
                6: { cellWidth: 21, halign: 'right' }
            },
            styles: { font: 'helvetica', fontStyle: 'normal' },
            margin: { top: 0, bottom: 0, left: 15, right: 15 },
            tableWidth: 'wrap'
        });
        return docTemp.lastAutoTable.finalY; // altura total de la tabla (empezó en startY:0)
    }

    const alturaTabla = medirAlturaTabla();
    const espacioDisponibleTablaMitad = ALTO_MITAD - ESPACIO_HEADER_APROX - ESPACIO_PIE_APROX;

    // Si la tabla no cabe holgada en media hoja (quedaría casi pegada a la Nota), usamos hoja completa por copia
    const modoPaginaCompleta = alturaTabla > espacioDisponibleTablaMitad;

    // ---------- Función que dibuja UN comprobante completo dentro de una franja ----------
    function dibujarComprobante(offsetY, limiteInferior, etiqueta) {
        let y = offsetY + 10;
        const yHeaderStart = y;

        // LOGO
        let logoAlto = 0;
        try {
            if (CONFIG.LOGO_BASE64 && CONFIG.LOGO_BASE64.trim() !== "" && CONFIG.LOGO_BASE64.startsWith('data:image')) {
                let formato = 'PNG';
                if (CONFIG.LOGO_BASE64.includes('jpeg') || CONFIG.LOGO_BASE64.includes('jpg')) formato = 'JPEG';
                const logoAncho = modoPaginaCompleta ? 55 : 48; // un poco más grande que antes
                logoAlto = logoAncho * (424 / 1280);
                const logoX = (ANCHO_PAGINA - logoAncho) / 2;
                doc.addImage(CONFIG.LOGO_BASE64, formato, logoX, yHeaderStart, logoAncho, logoAlto);
            }
        } catch (e) {
            console.error('⚠ Error al cargar logo:', e.message);
        }

        // QR (MÁS PEQUEÑO que antes: 13mm en vez de 20mm)
        let qrBloqueAlto = 0;
        try {
            if (CONFIG.QR_BASE64 && CONFIG.QR_BASE64.trim() !== "" && CONFIG.QR_BASE64.startsWith('data:image')) {
                const qrTam = 13; // <- antes era 20
                const qrX = (ANCHO_PAGINA - 15) - qrTam;
                const qrY = yHeaderStart;

                doc.addImage(CONFIG.QR_BASE64, 'PNG', qrX, qrY, qrTam, qrTam);

                doc.setFontSize(5.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);

                const textoQR = CONFIG.QR_TEXTO || 'Visítanos';
                const anchoTextoQR = doc.getTextWidth(textoQR);
                const xTextoQR = qrX + (qrTam / 2) - (anchoTextoQR / 2);
                const yTextoQR = qrY + qrTam + 2.5;

                if (CONFIG.QR_URL) {
                    doc.textWithLink(textoQR, xTextoQR, yTextoQR, { url: CONFIG.QR_URL });
                } else {
                    doc.text(textoQR, xTextoQR, yTextoQR);
                }
                qrBloqueAlto = qrTam + 4;
            }
        } catch (e) {
            console.error('⚠ Error al cargar QR:', e.message);
        }

        const maxAltoHeader = Math.max(logoAlto, qrBloqueAlto);
        y = yHeaderStart + (maxAltoHeader > 0 ? maxAltoHeader + 5 : 4);

        const TAMANO_LETRA = 8.5;
        const xIzq = 15;

        // Etiqueta ORIGINAL/COPIA chica junto a la fecha, además de la marca de agua
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 120);
        doc.text(etiqueta, ANCHO_PAGINA - 15, yHeaderStart - 3, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(TAMANO_LETRA);
        doc.setFont('helvetica', 'bold');
        doc.text('Fecha:', xIzq, y);
        doc.setFont('helvetica', 'normal');
        const anchoFecha = doc.getTextWidth(fechaFormateada);
        const xFechaNum = xIzq + doc.getTextWidth('Fecha:') + 1;
        doc.text(fechaFormateada, xFechaNum, y);
        doc.setLineWidth(0.3);
        doc.line(xFechaNum, y + 0.5, xFechaNum + anchoFecha, y + 0.5);

        y += 4.5;
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente:', xIzq, y);
        doc.setFont('helvetica', 'normal');
        const anchoCliente = doc.getTextWidth(nombre);
        const xClienteNombre = xIzq + doc.getTextWidth('Cliente:') + 1;
        doc.text(nombre, xClienteNombre, y);
        doc.line(xClienteNombre, y + 0.5, xClienteNombre + anchoCliente, y + 0.5);

        y += 4.5;
        const telCliente = numeroCliente || '_______________';
        doc.setFont('helvetica', 'bold');
        doc.text('Teléfono:', xIzq, y);
        doc.setFont('helvetica', 'normal');
        const xTelNum = xIzq + doc.getTextWidth('Teléfono:') + 2;
        const anchoTel = doc.getTextWidth(telCliente);
        doc.text(telCliente, xTelNum, y);
        doc.line(xTelNum, y + 0.6, xTelNum + anchoTel, y + 0.6);

        // Datos de empresa a la derecha
        const xDerecha = ANCHO_PAGINA - 15;
        let yDerecha = y - 8;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(CONFIG.EMPRESA.direccion, xDerecha, yDerecha, { align: 'right' });
        yDerecha += 4;
        doc.text(`Tel: ${CONFIG.EMPRESA.telefono}`, xDerecha, yDerecha, { align: 'right' });
        yDerecha += 4;
        doc.text(CONFIG.EMPRESA.email, xDerecha, yDerecha, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        y += 5;
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(0.4);
        doc.line(15, y, ANCHO_PAGINA - 15, y);
        y += 6;

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text(tituloDocumento, ANCHO_PAGINA / 2, y, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        y += 6;

        // ---- Marca de agua (ORIGINAL/COPIA), centrada en el borde inferior estimado de la tabla ----
        // Se dibuja ANTES de la tabla para que la tabla (fondo blanco opaco) tape la mitad de arriba
        // y solo se vea la mitad de abajo, como si la tabla la estuviera cubriendo.
        const yBordeInferiorTablaEstimado = y + alturaTabla;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(42);
        doc.setTextColor(225, 225, 225);
        doc.text(etiqueta, ANCHO_PAGINA / 2, yBordeInferiorTablaEstimado, { align: 'center', baseline: 'middle' });
        doc.setTextColor(0, 0, 0);

        // Tabla
        doc.autoTable({
            startY: y,
            head: [['Pzs', 'Grosor', 'Medidas', 'Trabajo', 'Metraje', 'P. Unit', 'Total']],
            body: datos,
            foot: [['', '', '', '', '', 'TOTAL:', `${totalG.toFixed(2)}`]],
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
            footStyles: { fillColor: [76, 175, 80], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 11, halign: 'center' },
                1: { cellWidth: 14, halign: 'center' },
                2: { cellWidth: 18, halign: 'center' },
                3: { cellWidth: 50 },
                4: { cellWidth: 18, halign: 'center' },
                5: { cellWidth: 21, halign: 'right' },
                6: { cellWidth: 21, halign: 'right' }
            },
            styles: { font: 'helvetica', fontStyle: 'normal' },
            margin: { top: offsetY + 5, bottom: (ALTO_PAGINA - limiteInferior) + 5, left: 15, right: 15 },
            tableWidth: 'wrap'
        });

        y = doc.lastAutoTable.finalY + 8;
        const yInicioSeccion = y;

        // Desglose de metrajes
        const xDesglose = 15;
        const anchoMaxDesglose = 100;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('DESGLOSE DE METRAJES:', xDesglose, y);
        doc.setTextColor(0, 0, 0);
        y += 4.5;

        doc.setFontSize(7);

        function escribirTextoConSalto(texto, x, yPos, anchoMax) {
            const palabras = texto.split(' ');
            let linea = '';
            const lineas = [];
            palabras.forEach(palabra => {
                const pruebaLinea = linea + (linea ? ' ' : '') + palabra;
                if (doc.getTextWidth(pruebaLinea) > anchoMax && linea) {
                    lineas.push(linea);
                    linea = palabra;
                } else {
                    linea = pruebaLinea;
                }
            });
            if (linea) lineas.push(linea);
            lineas.forEach((lineaTexto, index) => doc.text(lineaTexto, x, yPos + (index * 3)));
            return lineas.length * 3;
        }

        if (Object.keys(detallesM2).length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('M²:', xDesglose, y);
            y += 3.5;
            doc.setFont('helvetica', 'normal');
            Object.entries(detallesM2).forEach(([tipo, valor]) => {
                y += escribirTextoConSalto(`• ${tipo}: ${valor.toFixed(4)} m²`, xDesglose + 5, y, anchoMaxDesglose - 5);
            });
            y += 1.5;
        }

        if (Object.keys(detallesML).length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('M Lineales:', xDesglose, y);
            y += 3.5;
            doc.setFont('helvetica', 'normal');
            Object.entries(detallesML).forEach(([tipo, valor]) => {
                y += escribirTextoConSalto(`• ${tipo}: ${valor.toFixed(2)} ml`, xDesglose + 5, y, anchoMaxDesglose - 5);
            });
            y += 1.5;
        }

        if (Object.keys(detallesUnidades).length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Unidades:', xDesglose, y);
            y += 3.5;
            doc.setFont('helvetica', 'normal');
            Object.entries(detallesUnidades).forEach(([tipo, valor]) => {
                y += escribirTextoConSalto(`• ${tipo}: ${valor} ud`, xDesglose + 5, y, anchoMaxDesglose - 5);
            });
        }

        // Firma
        const xFirma = 130;
        const yFirma = yInicioSeccion + 8;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(xFirma, yFirma, xFirma + 45, yFirma);
        doc.setFontSize(7.5);
        doc.setTextColor(0, 0, 0);
        doc.text('Firma', xFirma + 19, yFirma + 4);

        // Nota al pie: fija cerca del borde inferior del bloque, bien separada del desglose
        const yNotaIdeal = limiteInferior - 9; // pegada al fondo de la mitad
        const yNotaConSeparacion = Math.max(y, yFirma) + SEPARACION_NOTAS_MIN;
        const yNotas = Math.max(yNotaIdeal, yNotaConSeparacion);

        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text('Nota: No nos hacemos responsables de maquila terminada después de 30 días.', 15, yNotas);
        doc.text('Toda la maquila es bajo su riesgo.', 15, yNotas + 3.5);
        doc.setTextColor(0, 0, 0);
    }

    if (modoPaginaCompleta) {
        // Hay muchos trabajos: cada comprobante ocupa su propia hoja completa
        dibujarComprobante(0, ALTO_PAGINA, 'ORIGINAL');
        doc.addPage();
        dibujarComprobante(0, ALTO_PAGINA, 'COPIA');
    } else {
        // Cabe holgado: ORIGINAL arriba y COPIA abajo en la misma hoja
        // Línea guía de corte entre las dos mitades
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.2);
        if (doc.setLineDashPattern) doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(8, ALTO_MITAD, ANCHO_PAGINA - 8, ALTO_MITAD);
        if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);

        dibujarComprobante(0, ALTO_MITAD, 'ORIGINAL');
        dibujarComprobante(ALTO_MITAD, ALTO_PAGINA, 'COPIA');
    }

    // Guardar PDF
    const fechaArchivo = new Date();
    const fechaFormato = `${String(fechaArchivo.getDate()).padStart(2, '0')}-${String(fechaArchivo.getMonth() + 1).padStart(2, '0')}-${fechaArchivo.getFullYear()}`;
    const nombreLimpio = nombre.replace(/[^a-zA-Z0-9ñÑ ]/g, '').replace(/ /g, '_');
    const tipoDoc = tipoDocumento === 'Nota' ? 'Nota' : 'Presupuesto';
    const nombreArchivo = `${tipoDoc}_${nombreLimpio}_${fechaFormato}.pdf`;

    doc.save(nombreArchivo);
    msg('msg-presupuesto', 'PDF generado correctamente', 'exito');
}