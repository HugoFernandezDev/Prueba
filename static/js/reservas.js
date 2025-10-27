document.addEventListener("DOMContentLoaded", () => {
    
    // IDs correctos del HTML
    const formReserva = document.getElementById("formReserva");
    const inputMesaDisplay = document.getElementById("mesa_display"); 
    const inputMesaId = document.getElementById("mesa_id");           
    const contenedorMesas = document.getElementById("contenedorMesas");
    const contenedorMesasContainer = document.getElementById("contenedorMesasContainer");
    const numPersonasElement = document.getElementById("num_personas");
    const fechaElement = document.getElementById("fecha_reserva"); 
    const horaElement = document.getElementById("hora_reserva");   
    const listaPlatos = document.getElementById("listaPlatos");

    // Configuración fija de mesas (igual que tu código)
    const configMesas = Array.from({ length: 14 }, (_, i) => ({
        num: i + 1, // Este 'num' es el ID que enviaremos al backend
        capacidad: [4, 6, 2, 4, 6, 4, 8, 4, 4, 6, 2, 2, 4, 4][i]
    }));

    let mesaSeleccionada = null; // Guardará el NOMBRE de la mesa seleccionada (ej: "Mesa 1")
    let mesasOcupadas = [];      // Guardará los IDs de las mesas ocupadas (ej: [3, 7])

    // --- Cargar selección previa al inicio (Ahora sí funcionará) ---
    function cargarSeleccionGuardada() {
        let reservaGuardada = null;
        try {
            // Intentar cargar la mesa guardada
            reservaGuardada = JSON.parse(localStorage.getItem("reservaActual")); 
        } catch (e) {
            console.error("Error parsing reservaActual from localStorage", e);
        }

        if (reservaGuardada && reservaGuardada.id && reservaGuardada.nombre) {
            // Restaurar la selección si existe
            mesaSeleccionada = reservaGuardada.nombre; 
            if (inputMesaId) inputMesaId.value = reservaGuardada.id;         
            if (inputMesaDisplay) inputMesaDisplay.value = reservaGuardada.nombre;
            console.log("Mesa guardada cargada:", mesaSeleccionada); // Log para depurar
        }
    }
    // --- FIN ---


    function inicializarFechas() {
        const hoy = new Date();
        const offset = hoy.getTimezoneOffset() * 60000; 
        const fechaLocal = new Date(hoy.getTime() - offset);
        const fechaISO = fechaLocal.toISOString().split('T')[0];

        if (fechaElement) { 
            fechaElement.min = fechaISO;
            // Solo establecer valor por defecto si NO hay uno guardado (podrías guardarlo en localStorage también)
            if (!fechaElement.value) { 
                fechaElement.value = fechaISO;
            }
        }

        if (horaElement) { 
            // Solo establecer valor por defecto si NO hay uno guardado
            if (!horaElement.value) {
                const horaActual = String(hoy.getHours()).padStart(2, '0');
                const minutoActual = String(hoy.getMinutes()).padStart(2, '0');
                horaElement.value = `${horaActual}:${minutoActual}`; 
            }
        }
    }


    function cargarMesasOcupadas() {
        if (!contenedorMesas) return; 
        const dataOcupadas = contenedorMesas.getAttribute('data-mesas-ocupadas');
        try {
            mesasOcupadas = dataOcupadas ? JSON.parse(dataOcupadas) : []; 
        } catch (e) {
            console.error("Error parsing mesas ocupadas", e)
            mesasOcupadas = [];
        }
        generarMesas(); // Volver a dibujar las mesas con la info actualizada
    }

    function generarMesas() {
        if (!contenedorMesas) return;
        contenedorMesas.innerHTML = ''; 

        configMesas.forEach(mesa => {
            const mesaNombre = `Mesa ${mesa.num}`;
            const estaOcupada = mesasOcupadas.includes(mesa.num); 
            // Comparamos el nombre para el estilo visual (restaurado desde localStorage)
            const esSeleccionada = mesaSeleccionada === mesaNombre; 

            const mesaElemento = document.createElement('div');
            mesaElemento.className = `
                flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg shadow 
                transition-all duration-200 transform text-center text-gray-800 
                ${estaOcupada 
                    ? 'opacity-40 cursor-not-allowed bg-gray-200' 
                    : esSeleccionada 
                        ? 'ring-2 ring-offset-2 ring-amber-500 bg-amber-100 scale-105 shadow-lg' 
                        : 'bg-white hover:bg-amber-50 cursor-pointer hover:scale-105'
                }
            `;
            mesaElemento.dataset.id = mesa.num; 
            mesaElemento.dataset.nombre = mesaNombre;

            mesaElemento.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 mb-1 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 2a1 1 0 00-1 1v1H2.5A1.5 1.5 0 001 5.5V9a1 1 0 001 1h12a1 1 0 001-1V5.5A1.5 1.5 0 0013.5 4H12V3a1 1 0 00-1-1H5zM2 11v3.5A1.5 1.5 0 003.5 16h11a1.5 1.5 0 001.5-1.5V11H2z" />
                </svg>
                <p class="text-xs sm:text-sm font-semibold">${mesaNombre}</p>
                <p class="text-xs text-gray-600">${mesa.capacidad} pers.</p>
                ${estaOcupada ? '<p class="text-xs text-red-600 font-bold mt-1">Ocupada</p>' : ''}
            `;

            if (!estaOcupada) {
                mesaElemento.addEventListener('click', () => {
                    // Actualizar estado visual
                    document.querySelectorAll('#contenedorMesas > div').forEach(m => {
                        m.classList.remove('ring-2', 'ring-offset-2', 'ring-amber-500', 'bg-amber-100', 'scale-105', 'shadow-lg');
                        if (!m.classList.contains('opacity-40')) {
                           m.classList.add('bg-white', 'hover:bg-amber-50'); 
                        }
                    });

                    mesaElemento.classList.remove('bg-white', 'hover:bg-amber-50');
                    mesaElemento.classList.add('ring-2', 'ring-offset-2', 'ring-amber-500', 'bg-amber-100', 'scale-105', 'shadow-lg');
                    
                    mesaSeleccionada = mesaNombre; 
                    const mesaIdSeleccionada = mesa.num; 

                    if (inputMesaDisplay) inputMesaDisplay.value = mesaSeleccionada;
                    if (inputMesaId) inputMesaId.value = mesaIdSeleccionada;

                    // --- REACTIVADO: Guardar selección en localStorage ---
                    const reservaParaGuardar = {
                        id: mesaIdSeleccionada,
                        nombre: mesaSeleccionada
                    };
                    localStorage.setItem("reservaActual", JSON.stringify(reservaParaGuardar)); 
                    console.log("Mesa guardada en localStorage:", reservaParaGuardar); // Log
                    // --- FIN REACTIVADO ---

                    ocultarMesas(); 
                });
            }

            contenedorMesas.appendChild(mesaElemento);
        });
    }

    function mostrarMesas() {
        if (contenedorMesasContainer) {
            contenedorMesasContainer.classList.remove("hidden");
            // Aquí idealmente harías un fetch para actualizar mesasOcupadas 
            // basado en fechaElement.value y horaElement.value
            // y luego llamarías a generarMesas(). Por ahora, solo redibuja.
            generarMesas(); 
        }
    }

    function ocultarMesas() {
        if (contenedorMesasContainer) {
            contenedorMesasContainer.classList.add("hidden");
        }
    }

    if (inputMesaDisplay) {
        inputMesaDisplay.addEventListener("click", mostrarMesas);
    }
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") ocultarMesas();
    });

    if (formReserva) {
        formReserva.addEventListener("submit", (e) => {
            if (!inputMesaId || !inputMesaId.value) { 
                e.preventDefault();
                alert("Por favor selecciona una mesa antes de confirmar.");
                mostrarMesas(); 
            } else {
               // Limpiar localStorage DESPUÉS de enviar exitosamente.
               // Es más seguro hacerlo aquí que al inicio.
               localStorage.removeItem("platosSeleccionados"); 
               localStorage.removeItem("reservaActual");     
               console.log("LocalStorage limpiado después de enviar reserva."); // Log
            }
        });
    }

    function mostrarPlatosSeleccionados() {
      if (!listaPlatos) return;

      // Esto ahora puede tener datos si el usuario fue al menú y volvió
      const platos = JSON.parse(localStorage.getItem("platosSeleccionados")) || []; 
      console.log("Platos cargados de localStorage:", platos); // Log

      if (platos.length === 0) {
        listaPlatos.innerHTML = "<p class='text-amber-300/70 italic'>No has añadido platos desde el menú.</p>";
        return;
      }

      // Mostrar platos si existen
      listaPlatos.innerHTML = platos.map(p => `
        <div class="bg-black/30 p-3 rounded-lg border border-amber-700/30 flex justify-between items-center text-sm">
          <div>
            <span class="font-semibold text-amber-100">${p.cantidad} ×</span> 
            <span class="ml-2">${p.nombre}</span>
          </div>
          <span class="text-amber-300 font-medium">S/. ${(p.precio * p.cantidad).toFixed(2)}</span>
        </div>
      `).join("");
    }

    // --- INICIALIZACIÓN ---
    cargarSeleccionGuardada(); // Cargar ANTES de inicializar fechas o mesas
    inicializarFechas();       
    cargarMesasOcupadas();     // Dibuja las mesas, marcando la guardada si existe
    mostrarPlatosSeleccionados(); // Cargar platos
});

