document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 TecnoStore: Catálogo y Carrito de Compras inicializados.");

    // 1. Generación automática del Código QR para la página web
    if (document.getElementById("codigo-qr")) {
        new QRCode(document.getElementById("codigo-qr"), {
            text: window.location.href,
            width: 140,
            height: 140,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // 2. Base de Datos de Productos Tecnológicos
    const productosTecnologia = [
        { id: 1, nombre: "Laptop de Alta Gama / IA", precio: 4500.00, desc: "Procesador Intel i9 / Ryzen 9 con tarjeta NVIDIA RTX serie 40 y NPU de IA.", imagen: "imagenes/laptop.jpg" },
        { id: 2, nombre: "Tablet Profesional", precio: 1850.00, desc: "Pantalla OLED 120Hz con lápiz óptico incluido para diseño y productividad.", imagen: "imagenes/tablet.jpg" },
        { id: 3, nombre: "PC de Escritorio / Estación de Trabajo", precio: 5200.00, desc: "Torre gamer con refrigeración líquida y 32GB RAM DDR5 para renderizado 3D.", imagen: "imagenes/pc.jpg" },
        { id: 4, nombre: "Servidor Cloud / Hosting NVMe", precio: 1200.00, desc: "Infraestructura cloud dedicada con discos NVMe ultrarrápidos y SSL incluido.", imagen: "imagenes/hosting.jpg" },
        { id: 5, nombre: "Equipos de Red y Conectividad Wi-Fi 7", precio: 890.00, desc: "Router tribanda de alta velocidad para cobertura total en hogares y oficinas.", imagen: "imagenes/redes.jpg" }
    ];

    let carrito = [];

    // Renderizar Productos en el Catálogo
    const productosGrid = document.getElementById("productos-grid");
    if (productosGrid) {
        productosTecnologia.forEach(prod => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.innerHTML = `
                <img src="${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <span class="precio">S/ ${prod.precio.toFixed(2)}</span>
                <p>${prod.desc}</p>
                <button class="btn-agregar-carrito" data-id="${prod.id}">
                    <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
                </button>
            `;
            productosGrid.appendChild(card);
        });
    }

    // 3. Lógica del Carrito de Compras
    const headerCarritoBtn = document.getElementById("header-carrito-btn");
    const carritoOverlay = document.getElementById("carrito-overlay");
    const carritoCerrarBtn = document.getElementById("carrito-cerrar-btn");
    const contadorCarrito = document.getElementById("contador-carrito");
    const carritoItemsContainer = document.getElementById("carrito-items-container");
    const carritoTotalPrecio = document.getElementById("carrito-total-precio");
    const btnProcederPedido = document.getElementById("btn-proceder-pedido");

    function abrirCarrito() {
        carritoOverlay.classList.remove("carrito-hidden");
    }

    function cerrarCarrito() {
        carritoOverlay.classList.add("carrito-hidden");
    }

    if (headerCarritoBtn) headerCarritoBtn.addEventListener("click", abrirCarrito);
    if (carritoCerrarBtn) carritoCerrarBtn.addEventListener("click", cerrarCarrito);
    carritoOverlay.addEventListener("click", (e) => {
        if (e.target === carritoOverlay) cerrarCarrito();
    });

    // Agregar producto al carrito
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-agregar-carrito");
        if (btn) {
            const id = parseInt(btn.getAttribute("data-id"));
            const productoEncontrado = productosTecnologia.find(p => p.id === id);
            
            if (productoEncontrado) {
                const itemExistente = carrito.find(item => item.id === id);
                if (itemExistente) {
                    itemExistente.cantidad += 1;
                } else {
                    carrito.push({ ...productoEncontrado, cantidad: 1 });
                }
                actualizarCarritoUI();
                mostrarNotificacionFlotante(`🛒 "${productoEncontrado.nombre}" añadido al carrito.`);
            }
        }
    });

    function actualizarCarritoUI() {
        let totalItems = 0;
        let precioTotal = 0;

        carritoItemsContainer.innerHTML = "";

        if (carrito.length === 0) {
            carritoItemsContainer.innerHTML = `<div class="carrito-vacio">Tu carrito está vacío</div>`;
            btnProcederPedido.disabled = true;
        } else {
            btnProcederPedido.disabled = false;
            carrito.forEach(item => {
                totalItems += item.cantidad;
                precioTotal += item.precio * item.cantidad;

                const itemDiv = document.createElement("div");
                itemDiv.className = "carrito-item-card";
                itemDiv.innerHTML = `
                    <div class="carrito-item-info">
                        <span class="carrito-item-nombre">${item.nombre}</span>
                        <span class="carrito-item-precio">S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                    <div class="carrito-item-acciones">
                        <div class="carrito-controles-qty">
                            <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                            <span>${item.cantidad}</span>
                            <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                        </div>
                        <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})">
                            <i class="fa-solid fa-trash"></i> Quitar
                        </button>
                    </div>
                `;
                carritoItemsContainer.appendChild(itemDiv);
            });
        }

        contadorCarrito.textContent = totalItems;
        carritoTotalPrecio.textContent = `S/ ${precioTotal.toFixed(2)}`;
    }

    window.cambiarCantidad = function(id, delta) {
        const item = carrito.find(p => p.id === id);
        if (item) {
            item.cantidad += delta;
            if (item.cantidad <= 0) {
                carrito = carrito.filter(p => p.id !== id);
            }
            actualizarCarritoUI();
        }
    };

    window.eliminarDelCarrito = function(id) {
        carrito = carrito.filter(p => p.id !== id);
        actualizarCarritoUI();
        mostrarNotificacionFlotante(`🗑️ Producto eliminado del carrito.`);
    };

    // 4. Lógica de la Ventana Modal del Formulario de Pedidos
    const modalPedido = document.getElementById("modal-pedido");
    const btnAbrirForm = document.getElementById("btn-abrir-formulario");
    const menuAgendarPedido = document.getElementById("menu-agendar-pedido");
    const modalCerrarBtn = document.getElementById("modal-cerrar-btn");
    const formAgendarPedido = document.getElementById("form-agendar-pedido");
    const selectProductoForm = document.getElementById("select-producto");

    function abrirModal() {
        // Sincronizar selección si hay productos en el carrito
        if (carrito.length > 0) {
            const resumenNombres = carrito.map(i => `${i.cantidad}x ${i.nombre}`).join(", ");
            // Agregar opción temporal al selector si no existe
            let optionCustom = selectProductoForm.querySelector("option[value='Pedido del Carrito']");
            if (!optionCustom) {
                optionCustom = document.createElement("option");
                optionCustom.value = "Pedido del Carrito";
                selectProductoForm.appendChild(optionCustom);
            }
            optionCustom.textContent = `Carrito: ${resumenNombres}`;
            selectProductoForm.value = "Pedido del Carrito";
        }
        cerrarCarrito();
        modalPedido.classList.remove("modal-hidden");
    }

    function cerrarModal() {
        modalPedido.classList.add("modal-hidden");
    }

    if (btnAbrirForm) btnAbrirForm.addEventListener("click", abrirModal);
    if (menuAgendarPedido) menuAgendarPedido.addEventListener("click", abrirModal);
    if (btnProcederPedido) btnProcederPedido.addEventListener("click", abrirModal);
    if (modalCerrarBtn) modalCerrarBtn.addEventListener("click", cerrarModal);

    modalPedido.addEventListener("click", (e) => {
        if (e.target === modalPedido) cerrarModal();
    });

    // Manejar envío del formulario de pedidos
    formAgendarPedido.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("input-nombre").value.trim();
        const telefono = document.getElementById("input-telefono").value.trim();
        const correo = document.getElementById("input-correo").value.trim();
        const direccion = document.getElementById("input-direccion").value.trim();
        const producto = selectProductoForm.value;
        const sucursal = document.getElementById("select-sucursal").value;

        mostrarNotificacionFlotante(`✅ ¡Pedido agendado con éxito, ${nombre}! Te contactaremos al ${telefono}.`);
        carrito = [];
        actualizarCarritoUI();
        formAgendarPedido.reset();
        cerrarModal();
    });

    // 5. Base de datos con 50 Preguntas y Respuestas sobre Tecnologías
    const basePreguntas50 = [
        { q: "¿Qué marcas de laptops venden?", a: "Vendemos marcas líderes del mercado como ASUS, Lenovo, Dell, HP, Apple y MSI con garantía oficial." },
        { q: "¿Tienen laptops para Inteligencia Artificial?", a: "Sí, disponemos de equipos con tarjetas gráficas dedicadas NVIDIA RTX serie 4000 y unidades de procesamiento neuronal (NPU)." },
        { q: "¿Cuál es el tiempo de entrega en Lima?", a: "Los envíos en Lima Metropolitana se realizan en un plazo de 24 a 48 horas hábiles." },
        { q: "¿Hacen envíos a Chiclayo?", a: "Sí, realizamos envíos seguros a Chiclayo mediante agencias aliadas con código de seguimiento." },
        { q: "¿Hacen envíos a Tarapoto?", a: "Sí, cubrimos envíos a Tarapoto y toda la región selva con empaques especiales de protección." },
        { q: "¿Tienen sucursal en Cajamarca?", a: "Sí, contamos con un punto de recojo y atención autorizada en Cajamarca." },
        { q: "¿Tienen sucursal en Huancayo?", a: "Sí, nuestra sucursal en Huancayo ofrece soporte técnico presencial y ventas directas." },
        { q: "¿Qué procesadores tienen las PCs de escritorio?", a: "Trabajamos con procesadores Intel Core i5, i7, i9 de última generación y AMD Ryzen 5, 7 y 9." },
        { q: "¿Qué tipos de tablets ofrecen?", a: "Ofrecemos tablets para diseño gráfico, educación, lectura y productividad con lápiz óptico incluido." },
        { q: "¿Venden por mayor y menor?", a: "Sí, tenemos precios especiales por mayor para empresas, instituciones educativas y distribuidores." },
        { q: "¿Ofrecen venta por unidad?", a: "Por supuesto, puedes comprar cualquier producto por unidad directamente en nuestra web o sucursales." },
        { q: "¿Qué planes de web hosting ofrecen?", a: "Ofrecemos hosting compartido NVMe, servidores VPS optimizados y servidores dedicados cloud con alta disponibilidad." },
        { q: "¿El hosting incluye certificado SSL?", a: "Sí, todos nuestros planes de web hosting incluyen certificados SSL Let's Encrypt totalmente gratuitos e ilimitados." },
        { q: "¿Tienen garantía los equipos tecnológicos?", a: "Todos nuestros productos tecnológicos cuentan con una garantía de fábrica mínima de 12 meses." },
        { q: "¿Ofrecen soporte técnico para armado de PCs?", a: "Sí, nuestros especialistas realizan el ensamblaje personalizado y pruebas de estrés térmico gratuitas." },
        { q: "¿Cuáles son los métodos de pago aceptados?", a: "Aceptamos tarjetas de crédito/débito, transferencias bancarias, Yape, Plin y pagos contra entrega seleccionados." },
        { q: "¿Puedo solicitar factura electrónica?", a: "Sí, emitimos factura o boleta electrónica de forma automática al registrar los datos de tu empresa." },
        { q: "¿Tienen stock de discos duros SSD NVMe?", a: "Sí, disponemos de unidades SSD desde 500GB hasta 4TB con velocidades ultrarrápidas de lectura." },
        { q: "¿Venden memorias RAM para laptops y PCs?", a: "Sí, tenemos módulos DDR4 y DDR5 de alta frecuencia para gaming y estaciones de trabajo." },
        { q: "¿Ofrecen licencias de software originales?", a: "Comercializamos licencias originales de Windows Pro, Microsoft 365 y paquetes de seguridad antivirus." },
        { q: "¿Qué es el hosting administrado?", a: "Es un servicio donde nosotros nos encargamos de las actualizaciones, seguridad y respaldos de tu servidor web." },
        { q: "¿Tienen routers y equipos de red Wi-Fi 7?", a: "Sí, contamos con tecnología Wi-Fi 7 y sistemas Mesh para cobertura total en hogares y oficinas." },
        { q: "¿Realizan instalaciones de redes empresariales?", a: "Nuestros técnicos brindan asesoría y despliegue de cableado estructurado y redes corporativas." },
        { q: "¿Cómo puedo contactar a atención al cliente?", a: "Puedes escribirnos a través de nuestro chatbox, WhatsApp oficial o visitar nuestras sucursales físicas." },
        { q: "¿Cuál es el horario de atención en tiendas?", a: "Atendemos de lunes a sábado de 9:00 a.m. a 7:00 p.m. en horario corrido." },
        { q: "¿Puedo devolver un producto si no estoy satisfecho?", a: "Sí, aceptamos devoluciones dentro de los primeros 7 días calendario bajo políticas de empaque original." },
        { q: "¿Venden accesorios gamer (teclados, mouses)?", a: "Sí, contamos con periféricos mecánicos RGB, diademas con sonido espacial y mouses de alta precisión." },
        { q: "¿Tienen monitores de alta tasa de refresco?", a: "Disponemos de monitores desde 144Hz hasta 360Hz con paneles IPS y resolución 4K." },
        { q: "¿Qué ventajas tiene comprar en TecnoStore?", a: "Ofrecemos asesoría personalizada, precios competitivos, garantía directa y envíos seguros a nivel nacional." },
        { q: "¿Ofrecen soporte técnico remoto?", a: "Sí, nuestros ingenieros pueden conectarse de forma remota para solucionar incidencias de software en PCs y laptops." },
        { q: "¿Tienen tarjetas de video dedicadas separadas?", a: "Vendemos tarjetas gráficas NVIDIA GeForce RTX y AMD Radeon para gaming y renderizado 3D." },
        { q: "¿Qué capacidad de almacenamiento tienen las laptops gamer?", a: "Ofrecemos configuraciones desde 512GB SSD hasta expansiones de 2TB o más." },
        { q: "¿El servicio de hosting incluye correos corporativos?", a: "Sí, puedes crear cuentas de correo con tu propio dominio (ej. ventas@tuempresa.com)." },
        { q: "¿Cuál es la velocidad de los servidores VPS?", a: "Nuestros VPS corren sobre discos 100% NVMe con puertos de red simétricos de hasta 1Gbps." },
        { q: "¿Tienen impresoras y multifuncionales láser?", a: "Sí, contamos con impresoras láser monocromáticas y a color para oficinas de alta demanda." },
        { q: "¿Venden estabilizadores y UPS?", a: "Protege tus equipos contra apagones con nuestros reguladores de voltaje y sistemas UPS interactivos." },
        { q: "¿Cómo sé si un producto está en stock?", a: "El catálogo web se actualiza en tiempo real; si el botón de compra está activo, hay stock disponible." },
        { q: "¿Hacen cotizaciones formales para empresas?", a: "Sí, elaboramos cotizaciones detalladas con RUC y vigencia de precios para licitaciones o requerimientos corporativos." },
        { q: "¿Las laptops vienen con sistema operativo instalado?", a: "La mayoría incluye Windows 11 Home o Pro preinstalado y listo para configurar." },
        { q: "¿Ofrecen servicio de mantenimiento preventivo?", a: "Sí, realizamos limpieza de componentes, cambio de pasta térmica y optimización de sistema operativo." },
        { q: "¿Tienen webcams para streaming y clases virtuales?", a: "Contamos con cámaras web en resolución 1080p y 4K con cancelación de ruido en micrófonos." },
        { q: "¿Qué métodos de respaldo realiza el hosting?", a: "Realizamos respaldos (backups) automáticos diarios y semanales almacenados en servidores externos." },
        { q: "¿Puedo armar mi PC pieza por pieza en su web?", a: "Pronto habilitaremos nuestro cotizador de PCs a medida; por ahora puedes solicitarlo vía chat o WhatsApp." },
        { q: "¿Tienen proyectores multimedia para oficinas o aulas?", a: "Sí, disponemos de proyectores LED y Láser con conectividad inalámbrica y alta luminosidad." },
        { q: "¿Qué marcas de tablets son mejores para diseño?", a: "Recomendamos las líneas iPad Pro y Samsung Galaxy Tab con soporte para lápices de alta precisión." },
        { q: "¿Ofrecen facilidades de pago o cuotas?", a: "Trabajamos con pasarelas de pago que permiten financiar tus compras con tarjetas de crédito participantes." },
        { q: "¿El soporte técnico por chat tiene costo?", a: "No, nuestro asistente virtual y chat de consultas básicas es totalmente gratuito las 24 horas." },
        { q: "¿Tienen adaptadores y hubs USB-C?", a: "Sí, contamos con adaptadores multipuerto HDMI, lectores de tarjetas y puertos Ethernet para ultrabooks." },
        { q: "¿Cómo puedo rastrear mi pedido?", a: "Al despachar tu compra, te enviamos un enlace y número de guía por correo y WhatsApp para el seguimiento." },
        { q: "¿Por qué elegir tecnología de última generación?", a: "Te otorga mayor eficiencia energética, velocidad de procesamiento superior y compatibilidad con las últimas herramientas de IA." }
    ];

    // 6. Lógica del Chatbox con 50 Preguntas
    const chatToggleBtn = document.getElementById("chatbox-toggle-btn");
    const chatWindow = document.getElementById("chatbox-window");
    const chatCloseBtn = document.getElementById("chatbox-close-btn");
    const chatMessages = document.getElementById("chatbox-messages");
    const chatUserInput = document.getElementById("chat-user-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatSearchInput = document.getElementById("chat-search-input");
    const sugeridasList = document.getElementById("preguntas-sugeridas-list");

    chatToggleBtn.addEventListener("click", () => {
        chatWindow.classList.toggle("chatbox-hidden");
    });
    chatCloseBtn.addEventListener("click", () => {
        chatWindow.classList.add("chatbox-hidden");
    });

    function renderizarPreguntas(filtro = "") {
        sugeridasList.innerHTML = "";
        const filtradas = basePreguntas50.filter(item => 
            item.q.toLowerCase().includes(filtro.toLowerCase())
        );

        filtradas.slice(0, 15).forEach((item) => {
            const chip = document.createElement("div");
            chip.className = "pregunta-chip";
            chip.textContent = item.q;
            chip.addEventListener("click", () => {
                enviarMensajeUsuario(item.q);
                responderBot(item.a);
            });
            sugeridasList.appendChild(chip);
        });
    }

    renderizarPreguntas();

    chatSearchInput.addEventListener("input", (e) => {
        renderizarPreguntas(e.target.value);
    });

    function procesarMensajeLibre() {
        const texto = chatUserInput.value.trim();
        if (!texto) return;

        enviarMensajeUsuario(texto);
        chatUserInput.value = "";

        setTimeout(() => {
            const encontrada = basePreguntas50.find(item => 
                item.q.toLowerCase().includes(texto.toLowerCase()) || 
                texto.toLowerCase().split(' ').some(palabra => palabra.length > 3 && item.q.toLowerCase().includes(palabra))
            );

            if (encontrada) {
                responderBot(encontrada.a);
            } else {
                responderBot("Gracias por tu consulta tecnológica. Puedes revisar nuestro catálogo de productos y agregarlos a tu carrito para agendar tu pedido.");
            }
        }, 600);
    }

    chatSendBtn.addEventListener("click", procesarMensajeLibre);
    chatUserInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") procesarMensajeLibre();
    });

    function enviarMensajeUsuario(texto) {
        const div = document.createElement("div");
        div.className = "chat-msg user-msg";
        div.textContent = texto;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function responderBot(texto) {
        const div = document.createElement("div");
        div.className = "chat-msg bot-msg";
        div.textContent = texto;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

/**
 * Notificaciones flotantes estilo Toast
 */
function mostrarNotificacionFlotante(mensaje) {
    const alertaExistente = document.getElementById("alerta-dinamica");
    if (alertaExistente) alertaExistente.remove();

    const alerta = document.createElement("div");
    alerta.id = "alerta-dinamica";
    alerta.textContent = mensaje;
    
    Object.assign(alerta.style, {
        position: "fixed",
        bottom: "30px",
        left: "30px",
        backgroundColor: "#1e293b",
        color: "#f8fafc",
        padding: "1rem 1.5rem",
        borderRadius: "10px",
        border: "1px solid #2563eb",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        zIndex: "9999",
        fontWeight: "500",
        animation: "fadeIn 0.3s ease"
    });

    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.style.opacity = "0";
        alerta.style.transition = "opacity 0.5s ease";
        setTimeout(() => alerta.remove(), 500);
    }, 4000);
}