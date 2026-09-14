// presupuesto.js - Manejo de presupuestos y cotizaciones

// Variables globales para el módulo de presupuestos
let contadorVidrios = 0;

/**
 * Agrega un nuevo vidrio al formulario de presupuesto
 */
function agregarVidrio() {
    contadorVidrios++;
    const contenedor = document.getElementById('contenedor-vidrios');

    if (!contenedor) {
        console.error('No se encontró el contenedor de vidrios');
        return;
    }

    const div = document.createElement('div');
    div.className = 'fila-vidrio';
    div.id = `vid-${contadorVidrios}`;
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; padding-bottom:15px; border-bottom:2px solid #e8eaf6;">
            <h4 style="color:#667eea;">Vidrio #${contadorVidrios}</h4>
            ${contadorVidrios > 1 ? `<button class="btn-eliminar" onclick="eliminarVidrio(${contadorVidrios})">Eliminar</button>` : ''}
        </div>
        <div class="grid-4">
            <div><label>Piezas:</label><input type="number" id="pza-${contadorVidrios}" min="1" value="1" onchange="calcular(${contadorVidrios})"></div>
            <div><label>Grosor:</label><select id="gro-${contadorVidrios}" onchange="actTrabajos(${contadorVidrios})"><option value="">Seleccionar...</option><option value="6mm">6mm</option><option value="9mm">9mm</option></select></div>
            <div><label>Medida 1 (m):</label><input type="number" id="med1-${contadorVidrios}" step="0.01" placeholder="0.00" onchange="calcular(${contadorVidrios})"></div>
            <div><label>Medida 2 (m):</label><input type="number" id="med2-${contadorVidrios}" step="0.01" placeholder="0.00" onchange="calcular(${contadorVidrios})"></div>
            <div><label>Tipo:</label><select id="trab-${contadorVidrios}" onchange="actFormas(${contadorVidrios})" disabled><option value="">Seleccione grosor...</option></select></div>
            <div><label>Forma:</label><select id="form-${contadorVidrios}" onchange="calcular(${contadorVidrios})" disabled><option value="">Seleccione tipo...</option></select></div>
            <div style="grid-column:span 2;"><label>Total Base:</label><div class="precio-total" id="tot-${contadorVidrios}">$0.00</div></div>
        </div>
        <div id="selector-lados-${contadorVidrios}" class="selector-lados">
            <label>Configuración de cortes:</label>
            <select id="num-lados-${contadorVidrios}" onchange="calcular(${contadorVidrios})">
                <option value="completo">Completo (2 cabezales + 2 largueros)</option>
                <option value="2cab-1larg">2 cabezales + 1 larguero</option>
                <option value="1cab-2larg">1 cabezal + 2 largueros</option>
                <option value="2cab">2 cabezales</option>
                <option value="2larg">2 largueros</option>
                <option value="1cab-1larg">1 cabezal + 1 larguero</option>
                <option value="1cab">1 cabezal</option>
                <option value="1larg">1 larguero</option>
            </select>
        </div>
        <div id="selector-cantidad-${contadorVidrios}" class="selector-lados">
            <label>Cantidad de unidades:</label>
            <input type="number" id="cant-unidades-${contadorVidrios}" min="1" value="1" onchange="calcular(${contadorVidrios})" style="width: 120px;">
        </div>
        <div id="info-calculo-${contadorVidrios}" class="info-calculo"></div>
        
        <!-- Sección de Procesos Adicionales separada -->
        <div class="seccion-procesos">
            <button class="btn-proceso" onclick="mostrarFormProceso(${contadorVidrios})">Agregar Proceso Adicional</button>
            <div id="form-proceso-${contadorVidrios}" class="form-proceso">
                <div style="margin-bottom: 10px;">
                    <label>Tipo de Proceso:</label>
                    <select id="tipo-proceso-${contadorVidrios}" onchange="actFormaProceso(${contadorVidrios})">
                        <option value="">Seleccionar proceso...</option>
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Forma:</label>
                    <select id="forma-proceso-${contadorVidrios}" disabled>
                        <option value="">Seleccione tipo...</option>
                    </select>
                </div>
                <div id="selector-lados-proceso-${contadorVidrios}" class="selector-lados">
                    <label>Configuración de cortes:</label>
                    <select id="num-lados-proceso-${contadorVidrios}" onchange="actFormaProceso(${contadorVidrios})">
                        <option value="completo">Completo (2 cabezales + 2 largueros)</option>
                        <option value="2cab-1larg">2 cabezales + 1 larguero</option>
                        <option value="1cab-2larg">1 cabezal + 2 largueros</option>
                        <option value="2cab">2 cabezales</option>
                        <option value="2larg">2 largueros</option>
                        <option value="1cab-1larg">1 cabezal + 1 larguero</option>
                        <option value="1cab">1 cabezal</option>
                        <option value="1larg">1 larguero</option>
                    </select>
                </div>
                <div id="selector-cantidad-proceso-${contadorVidrios}" class="selector-lados">
                    <label>Cantidad de unidades:</label>
                    <input type="number" id="cant-unidades-proceso-${contadorVidrios}" min="1" value="1" onchange="actFormaProceso(${contadorVidrios})" style="width: 120px;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Precio del Proceso:</label>
                    <div class="precio-total" id="precio-proceso-${contadorVidrios}">$0.00</div>
                </div>
                <div id="info-proceso-${contadorVidrios}" class="info-calculo"></div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-confirmar" onclick="confirmarProceso(${contadorVidrios})">Agregar</button>
                    <button class="btn-cancelar" onclick="cancelarProceso(${contadorVidrios})">Cancelar</button>
                </div>
            </div>
            <div id="lista-procesos-${contadorVidrios}"></div>
            <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 10px; border: 2px solid #4CAF50;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #2e7d32; font-size: 16px;">Total con Procesos:</strong>
                    <span id="total-completo-${contadorVidrios}" style="font-size: 20px; font-weight: bold; color: #4CAF50;">$0.00</span>
                </div>
            </div>
        </div>
    `;
    contenedor.appendChild(div);
    console.log('Vidrio agregado:', contadorVidrios);
}

function eliminarVidrio(id) {
    document.getElementById(`vid-${id}`).remove();
    calcularTotal();
}

function actTrabajos(id) {
    const g = document.getElementById(`gro-${id}`).value;
    const t = document.getElementById(`trab-${id}`);
    const f = document.getElementById(`form-${id}`);
    t.innerHTML = '<option value="">Seleccionar...</option>';
    t.disabled = !g;
    f.innerHTML = '<option value="">Seleccione tipo...</option>';
    f.disabled = true;

    if (g && PRECIOS[g]) {
        Object.keys(PRECIOS[g]).forEach(k => t.innerHTML += `<option value="${k}">${k}</option>`);
        // Agregar opción personalizada
        t.innerHTML += `<option value="OTRO">Otro (Personalizado)</option>`;
    }

    // Ocultar formulario personalizado si existe
    const formPersonalizado = document.getElementById(`form-personalizado-${id}`);
    if (formPersonalizado) {
        formPersonalizado.style.display = 'none';
    }

    calcular(id);
}

function actFormas(id) {
    const g = document.getElementById(`gro-${id}`).value;
    const t = document.getElementById(`trab-${id}`).value;
    const f = document.getElementById(`form-${id}`);
    const selectorLados = document.getElementById(`selector-lados-${id}`);
    const selectorCantidad = document.getElementById(`selector-cantidad-${id}`);

    f.innerHTML = '<option value="">Seleccionar...</option>';
    f.disabled = !t;
    selectorLados.classList.remove('active');
    selectorCantidad.classList.remove('active');

    // Verificar si existe el formulario personalizado
    let formPersonalizado = document.getElementById(`form-personalizado-${id}`);

    // Si es trabajo personalizado
    if (t === 'OTRO') {
        f.disabled = true;
        f.innerHTML = '<option value="">No aplica</option>';

        // Crear formulario personalizado si no existe
        if (!formPersonalizado) {
            formPersonalizado = document.createElement('div');
            formPersonalizado.id = `form-personalizado-${id}`;
            formPersonalizado.className = 'form-personalizado';
            formPersonalizado.innerHTML = `
                <div class="personalizado-header">
                    <span class="personalizado-icon">⚙️</span>
                    <h4>Configuración de Trabajo Personalizado</h4>
                </div>
                <div class="grid-2">
                    <div>
                        <label>Nombre del Trabajo:</label>
                        <input type="text" id="nombre-personalizado-${id}" placeholder="Ej: Corte especial" onchange="calcular(${id})">
                    </div>
                    <div>
                        <label>Tipo de Cálculo:</label>
                        <select id="tipo-calculo-${id}" onchange="mostrarCamposPrecio(${id})">
                            <option value="">Seleccionar...</option>
                            <option value="m2">Metros Cuadrados (m²)</option>
                            <option value="ml">Metros Lineales (ml)</option>
                            <option value="unico">Precio Único</option>
                            <option value="unidad">Por Unidad</option>
                        </select>
                    </div>
                </div>
                <div id="campos-precio-${id}" class="campos-precio"></div>
            `;

            // Insertar después del grid-4
            const grid4 = document.querySelector(`#vid-${id} .grid-4`);
            grid4.parentNode.insertBefore(formPersonalizado, grid4.nextSibling);
        }

        formPersonalizado.style.display = 'block';
        calcular(id);
        return;
    }

    // Ocultar formulario personalizado si no es OTRO
    if (formPersonalizado) {
        formPersonalizado.style.display = 'none';
    }

    if (g && t && PRECIOS[g][t]) {
        const p = PRECIOS[g][t];
        if (p.Recto !== undefined) {
            f.innerHTML += '<option value="Recto">Recto</option><option value="Forma">Forma</option>';
            if (t === 'Canto Pulido' || t === 'Filo Muerto' || t === 'Bisel') {
                selectorLados.classList.add('active');
            }
        } else {
            f.innerHTML += '<option value="Unico">Precio único</option>';
            f.value = "Unico";
            if (t.startsWith('Saques') || t.startsWith('Perforaciones')) {
                selectorCantidad.classList.add('active');
            }
        }
    }
    calcular(id);
}

function mostrarCamposPrecio(id) {
    const tipoCalculo = document.getElementById(`tipo-calculo-${id}`).value;
    const camposPrecio = document.getElementById(`campos-precio-${id}`);

    if (!tipoCalculo) {
        camposPrecio.innerHTML = '';
        calcular(id);
        return;
    }

    let html = '';

    if (tipoCalculo === 'm2') {
        html = `
            <div>
                <label>Precio por Metro Cuadrado (m²):</label>
                <input type="number" id="precio-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcular(${id})">
            </div>
        `;
    } else if (tipoCalculo === 'ml') {
        html = `
            <div>
                <label>Precio por Metro Lineal (ml):</label>
                <input type="number" id="precio-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcular(${id})">
            </div>
            <div id="selector-lados-personalizado-${id}" class="selector-lados active" style="margin-top: 15px;">
                <label>Configuración de cortes:</label>
                <select id="num-lados-personalizado-${id}" onchange="calcular(${id})">
                    <option value="completo">Completo (2 cabezales + 2 largueros)</option>
                    <option value="2cab-1larg">2 cabezales + 1 larguero</option>
                    <option value="1cab-2larg">1 cabezal + 2 largueros</option>
                    <option value="2cab">2 cabezales</option>
                    <option value="2larg">2 largueros</option>
                    <option value="1cab-1larg">1 cabezal + 1 larguero</option>
                    <option value="1cab">1 cabezal</option>
                    <option value="1larg">1 larguero</option>
                </select>
            </div>
        `;
    } else if (tipoCalculo === 'unico') {
        html = `
            <div>
                <label>Precio Único:</label>
                <input type="number" id="precio-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcular(${id})">
            </div>
        `;
    } else if (tipoCalculo === 'unidad') {
        html = `
            <div>
                <label>Precio por Unidad:</label>
                <input type="number" id="precio-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcular(${id})">
            </div>
            <div id="selector-cantidad-personalizado-${id}" class="selector-lados active" style="margin-top: 15px;">
                <label>Cantidad de unidades:</label>
                <input type="number" id="cant-unidades-personalizado-${id}" min="1" value="1" onchange="calcular(${id})" style="width: 120px;">
            </div>
        `;
    }

    camposPrecio.innerHTML = html;
    calcular(id);
}

function calcularMetrosLineales(m1, m2, config) {
    let metrosLineales = 0;
    const cabezal = Math.min(m1, m2);
    const larguero = Math.max(m1, m2);

    switch (config) {
        case 'completo':
            metrosLineales = (cabezal * 2) + (larguero * 2);
            break;
        case '2cab-1larg':
            metrosLineales = (cabezal * 2) + larguero;
            break;
        case '1cab-2larg':
            metrosLineales = cabezal + (larguero * 2);
            break;
        case '2cab':
            metrosLineales = cabezal * 2;
            break;
        case '2larg':
            metrosLineales = larguero * 2;
            break;
        case '1cab-1larg':
            metrosLineales = cabezal + larguero;
            break;
        case '1cab':
            metrosLineales = cabezal;
            break;
        case '1larg':
            metrosLineales = larguero;
            break;
    }

    return metrosLineales;
}

function obtenerDescripcionConfig(config) {
    const descripciones = {
        'completo': '2 cabezales + 2 largueros',
        '2cab-1larg': '2 cabezales + 1 larguero',
        '1cab-2larg': '1 cabezal + 2 largueros',
        '2cab': '2 cabezales',
        '2larg': '2 largueros',
        '1cab-1larg': '1 cabezal + 1 larguero',
        '1cab': '1 cabezal',
        '1larg': '1 larguero'
    };
    return descripciones[config] || config;
}

function calcular(id) {
    const g = document.getElementById(`gro-${id}`).value;
    const t = document.getElementById(`trab-${id}`).value;
    const f = document.getElementById(`form-${id}`).value;
    const m1 = parseFloat(document.getElementById(`med1-${id}`).value) || 0;
    const m2 = parseFloat(document.getElementById(`med2-${id}`).value) || 0;
    const pz = parseInt(document.getElementById(`pza-${id}`).value) || 1;
    const tot = document.getElementById(`tot-${id}`);
    const infoCalculo = document.getElementById(`info-calculo-${id}`);

    if (!g || !t || m1 === 0 || m2 === 0) {
        tot.textContent = '$0.00';
        infoCalculo.textContent = '';
        actualizarTotalCompleto(id);
        return;
    }

    let precio = 0;
    let total = 0;
    let info = '';

    // Manejar trabajo personalizado
    if (t === 'OTRO') {
        const nombrePersonalizado = document.getElementById(`nombre-personalizado-${id}`)?.value || '';
        const tipoCalculo = document.getElementById(`tipo-calculo-${id}`)?.value || '';
        const precioPersonalizado = parseFloat(document.getElementById(`precio-personalizado-${id}`)?.value) || 0;

        if (!nombrePersonalizado || !tipoCalculo || precioPersonalizado === 0) {
            tot.textContent = '$0.00';
            infoCalculo.textContent = 'Complete todos los campos del trabajo personalizado';
            actualizarTotalCompleto(id);
            return;
        }

        if (tipoCalculo === 'm2') {
            const area = m1 * m2;
            total = precioPersonalizado * area * pz;
            info = `${area.toFixed(4)} m² x ${pz} pza x ${nf.format(precioPersonalizado)}/m² (${nombrePersonalizado})`;
        } else if (tipoCalculo === 'ml') {
            const config = document.getElementById(`num-lados-personalizado-${id}`)?.value || 'completo';
            const metrosLineales = calcularMetrosLineales(m1, m2, config);
            total = precioPersonalizado * metrosLineales * pz;
            info = `${metrosLineales.toFixed(2)} ml (${obtenerDescripcionConfig(config)}) x ${pz} pza x ${nf.format(precioPersonalizado)}/ml (${nombrePersonalizado})`;
        } else if (tipoCalculo === 'unico') {
            total = precioPersonalizado * pz;
            info = `${pz} pza x ${nf.format(precioPersonalizado)} (${nombrePersonalizado})`;
        } else if (tipoCalculo === 'unidad') {
            const cantidad = parseInt(document.getElementById(`cant-unidades-personalizado-${id}`)?.value) || 1;
            total = precioPersonalizado * cantidad * pz;
            info = `${cantidad} unidad(es) x ${pz} pza x ${nf.format(precioPersonalizado)} (${nombrePersonalizado})`;
        }

        tot.textContent = nf.format(total);
        infoCalculo.textContent = info;
        actualizarTotalCompleto(id);
        return;
    }

    // Lógica normal para trabajos predefinidos
    if (!f) {
        tot.textContent = '$0.00';
        infoCalculo.textContent = '';
        actualizarTotalCompleto(id);
        return;
    }

    const pt = PRECIOS[g][t];
    if (pt.Recto !== undefined) precio = pt[f]; else precio = pt.precio;

    if (t === 'Canto Pulido' || t === 'Filo Muerto' || t === 'Bisel') {
        const config = document.getElementById(`num-lados-${id}`).value;
        const metrosLineales = calcularMetrosLineales(m1, m2, config);
        const metrosLinealesTotal = metrosLineales * pz;

        total = precio * metrosLineales * pz;
        info = `${metrosLineales.toFixed(2)} ml x ${pz} pza = ${metrosLinealesTotal.toFixed(2)} ml total (${obtenerDescripcionConfig(config)}) x ${nf.format(precio)}/ml`;

    } else if (t.startsWith('Perforaciones') || t.startsWith('Saques')) {
        const cantidad = parseInt(document.getElementById(`cant-unidades-${id}`).value) || 1;
        const unidadesTotal = cantidad * pz;
        total = precio * cantidad * pz;
        info = `${cantidad} ud x ${pz} pza = ${unidadesTotal} ud total x ${nf.format(precio)}`;

    } else {
        const area = m1 * m2;
        const areaTotal = area * pz;
        total = precio * area * pz;
        info = `${area.toFixed(4)} m² x ${pz} pza = ${areaTotal.toFixed(4)} m² total x ${nf.format(precio)}/m²`;
    }

    tot.textContent = nf.format(total);
    infoCalculo.textContent = info;
    actualizarTotalCompleto(id);
}

function mostrarFormProceso(id) {
    const g = document.getElementById(`gro-${id}`).value;
    if (!g) { alert('Primero selecciona el grosor del vidrio'); return; }

    const form = document.getElementById(`form-proceso-${id}`);
    const select = document.getElementById(`tipo-proceso-${id}`);

    select.innerHTML = '<option value="">Seleccionar proceso...</option>';
    if (PRECIOS[g]) {
        Object.keys(PRECIOS[g]).forEach(k => {
            select.innerHTML += `<option value="${k}">${k}</option>`;
        });
    }
    // Agregar opción personalizada
    select.innerHTML += `<option value="OTRO">Otro (Personalizado)</option>`;

    form.classList.add('active');
}

function actFormaProceso(id) {
    const g = document.getElementById(`gro-${id}`).value;
    const t = document.getElementById(`tipo-proceso-${id}`).value;
    const f = document.getElementById(`forma-proceso-${id}`);
    const precioDisplay = document.getElementById(`precio-proceso-${id}`);
    const infoProceso = document.getElementById(`info-proceso-${id}`);
    const selectorLadosProceso = document.getElementById(`selector-lados-proceso-${id}`);
    const selectorCantidadProceso = document.getElementById(`selector-cantidad-proceso-${id}`);

    f.innerHTML = '<option value="">Seleccionar...</option>';
    f.disabled = !t;
    precioDisplay.textContent = '$0.00';
    infoProceso.textContent = '';
    selectorLadosProceso.classList.remove('active');
    selectorCantidadProceso.classList.remove('active');

    // Verificar si existe el formulario personalizado para procesos
    let formPersonalizadoProceso = document.getElementById(`form-personalizado-proceso-${id}`);

    // Si es proceso personalizado
    if (t === 'OTRO') {
        f.disabled = true;
        f.innerHTML = '<option value="">No aplica</option>';

        // Crear formulario personalizado para proceso si no existe
        if (!formPersonalizadoProceso) {
            formPersonalizadoProceso = document.createElement('div');
            formPersonalizadoProceso.id = `form-personalizado-proceso-${id}`;
            formPersonalizadoProceso.className = 'form-personalizado-proceso';
            formPersonalizadoProceso.innerHTML = `
                <div class="personalizado-header">
                    <span class="personalizado-icon">🔧</span>
                    <h4>Proceso Personalizado</h4>
                </div>
                <div class="grid-2">
                    <div>
                        <label>Nombre del Proceso:</label>
                        <input type="text" id="nombre-proceso-personalizado-${id}" placeholder="Ej: Tratamiento especial" onchange="calcularPrecioProceso(${id})">
                    </div>
                    <div>
                        <label>Tipo de Cálculo:</label>
                        <select id="tipo-calculo-proceso-${id}" onchange="mostrarCamposPrecioProceso(${id})">
                            <option value="">Seleccionar...</option>
                            <option value="m2">Metros Cuadrados (m²)</option>
                            <option value="ml">Metros Lineales (ml)</option>
                            <option value="unico">Precio Único</option>
                            <option value="unidad">Por Unidad</option>
                        </select>
                    </div>
                </div>
                <div id="campos-precio-proceso-${id}" class="campos-precio-proceso"></div>
            `;

            // Insertar en el formulario de proceso
            const formProceso = document.getElementById(`form-proceso-${id}`);
            const formaSelect = document.getElementById(`forma-proceso-${id}`).parentNode;
            formaSelect.parentNode.insertBefore(formPersonalizadoProceso, formaSelect.nextSibling);
        }

        formPersonalizadoProceso.style.display = 'block';
        return;
    }

    // Ocultar formulario personalizado si no es OTRO
    if (formPersonalizadoProceso) {
        formPersonalizadoProceso.style.display = 'none';
    }

    if (g && t && PRECIOS[g][t]) {
        const p = PRECIOS[g][t];
        const m1 = parseFloat(document.getElementById(`med1-${id}`).value) || 0;
        const m2 = parseFloat(document.getElementById(`med2-${id}`).value) || 0;
        const pz = parseInt(document.getElementById(`pza-${id}`).value) || 1;

        if (p.Recto !== undefined) {
            f.innerHTML += '<option value="Recto">Recto</option><option value="Forma">Forma</option>';
            f.disabled = false;

            if (t === 'Canto Pulido' || t === 'Filo Muerto' || t === 'Bisel') {
                selectorLadosProceso.classList.add('active');
            }

            f.onchange = () => {
                if (f.value && m1 && m2) {
                    const precio = p[f.value];
                    const config = document.getElementById(`num-lados-proceso-${id}`).value;
                    const metrosLineales = calcularMetrosLineales(m1, m2, config);

                    const total = precio * metrosLineales * pz;
                    precioDisplay.textContent = nf.format(total);
                    infoProceso.textContent = `${metrosLineales.toFixed(2)} ml (${obtenerDescripcionConfig(config)}) x ${pz} pza`;
                }
            };
        } else {
            f.innerHTML += '<option value="Unico">Precio único</option>';
            f.value = "Unico";

            if (t.startsWith('Saques') || t.startsWith('Perforaciones')) {
                selectorCantidadProceso.classList.add('active');
            }

            let total = 0;
            let info = '';

            if (t.startsWith('Perforaciones') || t.startsWith('Saques')) {
                const cantidad = parseInt(document.getElementById(`cant-unidades-proceso-${id}`).value) || 1;
                total = p.precio * cantidad * pz;
                info = `${cantidad} unidad(es) x ${pz} pza`;
            } else {
                const area = m1 * m2;
                total = p.precio * area * pz;
                info = `${area.toFixed(4)} m² x ${pz} pza`;
            }
            precioDisplay.textContent = nf.format(total);
            infoProceso.textContent = info;
        }
    }
}

function mostrarCamposPrecioProceso(id) {
    const tipoCalculo = document.getElementById(`tipo-calculo-proceso-${id}`).value;
    const camposPrecio = document.getElementById(`campos-precio-proceso-${id}`);
    if (!tipoCalculo) {
        camposPrecio.innerHTML = '';
        calcularPrecioProceso(id);
        return;
    }

    let html = '';

    if (tipoCalculo === 'm2') {
        html = `
        <div>
            <label>Precio por Metro Cuadrado (m²):</label>
            <input type="number" id="precio-proceso-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcularPrecioProceso(${id})">
        </div>
    `;
    } else if (tipoCalculo === 'ml') {
        html = `
        <div>
            <label>Precio por Metro Lineal (ml):</label>
            <input type="number" id="precio-proceso-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcularPrecioProceso(${id})">
        </div>
        <div id="selector-lados-proceso-personalizado-${id}" class="selector-lados active" style="margin-top: 15px;">
            <label>Configuración de cortes:</label>
            <select id="num-lados-proceso-personalizado-${id}" onchange="calcularPrecioProceso(${id})">
                <option value="completo">Completo (2 cabezales + 2 largueros)</option>
                <option value="2cab-1larg">2 cabezales + 1 larguero</option>
                <option value="1cab-2larg">1 cabezal + 2 largueros</option>
                <option value="2cab">2 cabezales</option>
                <option value="2larg">2 largueros</option>
                <option value="1cab-1larg">1 cabezal + 1 larguero</option>
                <option value="1cab">1 cabezal</option>
                <option value="1larg">1 larguero</option>
            </select>
        </div>
    `;
    } else if (tipoCalculo === 'unico') {
        html = `
        <div>
            <label>Precio Único:</label>
            <input type="number" id="precio-proceso-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcularPrecioProceso(${id})">
        </div>
    `;
    } else if (tipoCalculo === 'unidad') {
        html = `
        <div>
            <label>Precio por Unidad:</label>
            <input type="number" id="precio-proceso-personalizado-${id}" step="0.01" min="0" placeholder="0.00" onchange="calcularPrecioProceso(${id})">
        </div>
        <div id="selector-cantidad-proceso-personalizado-${id}" class="selector-lados active" style="margin-top: 15px;">
            <label>Cantidad de unidades:</label>
            <input type="number" id="cant-unidades-proceso-personalizado-${id}" min="1" value="1" onchange="calcularPrecioProceso(${id})" style="width: 120px;">
        </div>
    `;
    }

    camposPrecio.innerHTML = html;
    calcularPrecioProceso(id);
}

function calcularPrecioProceso(id) {
    const tipoProceso = document.getElementById(`tipo-proceso-${id}`).value;
    if (tipoProceso !== 'OTRO') return;

    const nombreProcesoPersonalizado = document.getElementById(`nombre-proceso-personalizado-${id}`)?.value || '';
    const tipoCalculo = document.getElementById(`tipo-calculo-proceso-${id}`)?.value || '';
    const precioPersonalizado = parseFloat(document.getElementById(`precio-proceso-personalizado-${id}`)?.value) || 0;
    const precioDisplay = document.getElementById(`precio-proceso-${id}`);
    const infoProceso = document.getElementById(`info-proceso-${id}`);

    const m1 = parseFloat(document.getElementById(`med1-${id}`).value) || 0;
    const m2 = parseFloat(document.getElementById(`med2-${id}`).value) || 0;
    const pz = parseInt(document.getElementById(`pza-${id}`).value) || 1;

    if (!nombreProcesoPersonalizado || !tipoCalculo || precioPersonalizado === 0 || m1 === 0 || m2 === 0) {
        precioDisplay.textContent = '$0.00';
        infoProceso.textContent = nombreProcesoPersonalizado ? 'Complete todos los campos' : '';
        return;
    }

    let total = 0;
    let info = '';

    if (tipoCalculo === 'm2') {
        const area = m1 * m2;
        total = precioPersonalizado * area * pz;
        info = `${area.toFixed(4)} m² x ${pz} pza x ${nf.format(precioPersonalizado)}/m² (${nombreProcesoPersonalizado})`;
    } else if (tipoCalculo === 'ml') {
        const config = document.getElementById(`num-lados-proceso-personalizado-${id}`)?.value || 'completo';
        const metrosLineales = calcularMetrosLineales(m1, m2, config);
        total = precioPersonalizado * metrosLineales * pz;
        info = `${metrosLineales.toFixed(2)} ml (${obtenerDescripcionConfig(config)}) x ${pz} pza x ${nf.format(precioPersonalizado)}/ml (${nombreProcesoPersonalizado})`;
    } else if (tipoCalculo === 'unico') {
        total = precioPersonalizado * pz;
        info = `${pz} pza x ${nf.format(precioPersonalizado)} (${nombreProcesoPersonalizado})`;
    } else if (tipoCalculo === 'unidad') {
        const cantidad = parseInt(document.getElementById(`cant-unidades-proceso-personalizado-${id}`)?.value) || 1;
        total = precioPersonalizado * cantidad * pz;
        info = `${cantidad} unidad(es) x ${pz} pza x ${nf.format(precioPersonalizado)} (${nombreProcesoPersonalizado})`;
    }

    precioDisplay.textContent = nf.format(total);
    infoProceso.textContent = info;
}

function confirmarProceso(id) {
    const tipo = document.getElementById(`tipo-proceso-${id}`).value;
    const forma = document.getElementById(`forma-proceso-${id}`).value;
    const precioText = document.getElementById(`precio-proceso-${id}`).textContent;
    const infoText = document.getElementById(`info-proceso-${id}`).textContent;
    const precio = parseFloat(precioText.replace(/[$,]/g, '')) || 0;
    let tipoNombre = tipo;
    let tipoOriginal = tipo;

    // Manejar proceso personalizado
    if (tipo === 'OTRO') {
        tipoNombre = document.getElementById(`nombre-proceso-personalizado-${id}`)?.value || 'Proceso Personalizado';
        const tipoCalculo = document.getElementById(`tipo-calculo-proceso-${id}`)?.value;

        if (!tipoNombre || !tipoCalculo || precio === 0) {
            alert('Complete todos los campos del proceso personalizado');
            return;
        }
    } else {
        if (!tipo || !forma || precio === 0) {
            alert('Complete todos los campos del proceso');
            return;
        }
    }

    let configInfo = '';
    let cantidadUnidades = 1;

    if (tipo === 'OTRO') {
        const tipoCalculo = document.getElementById(`tipo-calculo-proceso-${id}`)?.value;
        if (tipoCalculo === 'ml') {
            const config = document.getElementById(`num-lados-proceso-personalizado-${id}`)?.value || 'completo';
            configInfo = ` (${obtenerDescripcionConfig(config)})`;
        } else if (tipoCalculo === 'unidad') {
            cantidadUnidades = parseInt(document.getElementById(`cant-unidades-proceso-personalizado-${id}`)?.value) || 1;
            configInfo = ` (${cantidadUnidades} ud)`;
        }
    } else if (tipo === 'Canto Pulido' || tipo === 'Filo Muerto' || tipo === 'Bisel') {
        const config = document.getElementById(`num-lados-proceso-${id}`).value;
        configInfo = ` (${obtenerDescripcionConfig(config)})`;
    } else if (tipo.startsWith('Saques') || tipo.startsWith('Perforaciones')) {
        cantidadUnidades = parseInt(document.getElementById(`cant-unidades-proceso-${id}`).value) || 1;
        configInfo = ` (${cantidadUnidades} ud)`;
    }

    const lista = document.getElementById(`lista-procesos-${id}`);
    const procesoId = Date.now();

    const div = document.createElement('div');
    div.className = 'proceso-item';
    div.id = `proceso-${procesoId}`;
    div.setAttribute('data-precio', precio);
    div.setAttribute('data-tipo', tipoNombre);
    div.setAttribute('data-tipo-original', tipoOriginal);
    div.setAttribute('data-info', infoText);
    div.setAttribute('data-cantidad', cantidadUnidades);

    let formaDisplay = '';
    if (tipo !== 'OTRO') {
        formaDisplay = ` - ${forma}`;
    }

    div.innerHTML = `
    <div class="info">
        <strong>${tipoNombre}</strong>${formaDisplay}${configInfo}
        ${infoText ? `<br><small style="color:#666;">${infoText}</small>` : ''}
    </div>
    <div class="precio">${nf.format(precio)}</div>
    <button class="btn-eliminar" onclick="eliminarProceso(${id}, ${procesoId})" style="margin-left: 10px;">Eliminar</button>
`;

    lista.appendChild(div);
    cancelarProceso(id);
    actualizarTotalCompleto(id);
}

function eliminarProceso(vidrioId, procesoId) {
    document.getElementById(`proceso-${procesoId}`).remove();
    actualizarTotalCompleto(vidrioId);
}

function cancelarProceso(id) {
    const form = document.getElementById(`form-proceso-${id}`);
    form.classList.remove('active');
    document.getElementById(`tipo-proceso-${id}`).value = '';
    document.getElementById(`forma-proceso-${id}`).value = '';
    document.getElementById(`precio-proceso-${id}`).textContent = '$0.00';
    document.getElementById(`info-proceso-${id}`).textContent = '';
    document.getElementById(`selector-lados-proceso-${id}`).classList.remove('active');
    document.getElementById(`selector-cantidad-proceso-${id}`).classList.remove('active');
    // Ocultar formulario personalizado de proceso si existe
    const formPersonalizadoProceso = document.getElementById(`form-personalizado-proceso-${id}`);
    if (formPersonalizadoProceso) {
        formPersonalizadoProceso.style.display = 'none';
    }
}

function actualizarTotalCompleto(id) {
    const totalBaseText = document.getElementById(`tot-${id}`).textContent;
    const totalBase = parseFloat(totalBaseText.replace(/[$,]/g, '')) || 0;
    const lista = document.getElementById(`lista-procesos-${id}`);
    const procesos = lista.querySelectorAll('.proceso-item');

    let totalProcesos = 0;
    procesos.forEach(p => { totalProcesos += parseFloat(p.getAttribute('data-precio')) || 0; });

    const totalCompleto = totalBase + totalProcesos;
    document.getElementById(`total-completo-${id}`).textContent = nf.format(totalCompleto);
    calcularTotal();
}

function calcularTotal() {
    let total = 0;
    // Solo buscar vidrios dentro del contenedor de presupuestos
    const contenedor = document.getElementById('contenedor-vidrios');
    if (!contenedor) {
        console.log('No se encontró el contenedor de vidrios');
        return 0;
    }
    
    const vidrios = contenedor.querySelectorAll('.fila-vidrio');
    
    console.log('=== CALCULANDO TOTAL ===');
    console.log('Número de vidrios encontrados:', vidrios.length);
    
    vidrios.forEach(fila => {
        const id = fila.id.split('-')[1];
        const totalCompletoElement = document.getElementById(`total-completo-${id}`);
        if (totalCompletoElement) {
            const txt = totalCompletoElement.textContent;
            const valor = parseFloat(txt.replace(/[$,]/g, '')) || 0;
            console.log(`Vidrio ${id}: ${txt} = ${valor}`);
            total += valor;
        } else {
            console.log(`Vidrio ${id}: No se encontró el elemento total-completo`);
        }
    });
    
    console.log('Total calculado:', total);
    console.log('======================');
    
    // Actualizar subtotal y total
    const subtotalElement = document.getElementById('subtotal-display');
    const totalElement = document.getElementById('total-presupuesto');

    if (subtotalElement) {
        subtotalElement.textContent = nf.format(total);
    }
    if (totalElement) {
        totalElement.textContent = nf.format(total);
    }

    return total;
}
// Inicializar con un vidrio por defecto
document.addEventListener('DOMContentLoaded', function () {
    const contenedor = document.getElementById('contenedor-vidrios');
    if (contenedor) {
        agregarVidrio();
    }
});

/**
 * Limpia todo el presupuesto: datos del cliente, todos los vidrios agregados,
 * procesos, totales y mensajes. Pide confirmación antes de borrar.
 */
function limpiarPresupuesto() {
    const confirmar = confirm('¿Seguro que quieres limpiar el presupuesto?\nSe perderán todos los datos ingresados.');
    if (!confirmar) return;

    // Limpiar datos del cliente
    const nombreEl = document.getElementById('nombreCliente');
    const numeroEl = document.getElementById('numeroCliente');
    const tipoEl = document.getElementById('tipoDocumento');
    if (nombreEl) nombreEl.value = '';
    if (numeroEl) numeroEl.value = '';
    if (tipoEl) tipoEl.value = 'Presupuesto';

    // Eliminar todos los vidrios agregados (de golpe, sin ir uno por uno)
    const contenedor = document.getElementById('contenedor-vidrios');
    if (contenedor) {
        contenedor.innerHTML = '';
    }
    contadorVidrios = 0;

    // Dejar un vidrio vacío listo para empezar de nuevo
    agregarVidrio();

    // Resetear el total mostrado
    calcularTotal();

    // Limpiar cualquier mensaje de éxito/error que hubiera quedado
    const msgEl = document.getElementById('msg-presupuesto');
    if (msgEl) {
        msgEl.textContent = '';
        msgEl.className = '';
    }
}