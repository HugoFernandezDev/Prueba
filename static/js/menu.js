// =============================
// MENÚ DE PLATOS
// =============================

const entradas = [
  { nombre: "Papa a la Huancaína", desc: "Papas sancochadas con salsa de ají amarillo, queso fresco, leche y huevo duro.", img: "huancaina.png", precio: 12 },
  { nombre: "Tamal", desc: "Masa de maíz sazonada con ají y rellena de pollo, envuelta en hoja de plátano.", img: "tamal.png", precio: 10 },
  { nombre: "Ocopa", desc: "Papas bañadas con salsa de huacatay, maní, queso y ají mirasol.", img: "ocopa.png", precio: 11 },
  { nombre: "Choclo con queso", desc: "Choclo tierno acompañado con rodajas de queso fresco serrano.", img: "chocloconqueso.png", precio: 9 },
  { nombre: "Sopa de quinua", desc: "Caldo con quinua, verduras, papa y trozos de carne.", img: "sopadequinua.png", precio: 10 },
  { nombre: "Crema de calabaza", desc: "Sopa cremosa hecha con zapallo loche, cebolla, leche y pan tostado.", img: "cremacalabaza.png", precio: 10 },
  { nombre: "Picante de yuyo", desc: "Algas marinas cocidas con papa, maní molido y ají colorado.", img: "picantedeyuyo.png", precio: 11 },
  { nombre: "Ensalada de quinua con ternera", desc: "Quinua cocida con trozos de carne, tomate, cebolla y palta.", img: "ensaladadequinuaconternera.png", precio: 13 },
  { nombre: "Papa con huevo", desc: "Papas sancochadas servidas con huevo frito, cebolla y tomate.", img: "papaconhuevo.png", precio: 8 },
];

const platosFuertes = [
  { nombre: "Pachamanca a la olla", desc: "Carne de cerdo, pollo y res cocidas con hierbas andinas, papas, habas y camote.", img: "pachamanca.png", precio: 22 },
  { nombre: "Caldo de mote", desc: "Sopa espesa con mote de maíz, carne de res, papa y hierbas aromáticas.", img: "caldodemote.png", precio: 18 },
  { nombre: "Cuy chactado", desc: "Cuy frito al estilo andino, acompañado con papas doradas y ensalada criolla.", img: "cuychactado.png", precio: 25 },
  { nombre: "Rocoto relleno con pastel de papa", desc: "Rocoto relleno con carne molida, maní, pasas y acompañado con pastel de papa.", img: "rocotorelleno.png", precio: 20 },
  { nombre: "Picante de trigo", desc: "Trigo guisado con carne de res, ají panca, papa y arvejas.", img: "trigopicante.png", precio: 17 },
  { nombre: "Chanfainita", desc: "Guiso de bofe de res con papa, ají panca y cebolla.", img: "chanfainita.png", precio: 16 },
  { nombre: "Patita con maní", desc: "Patitas de cerdo cocidas con maní molido, papa y hierbas andinas.", img: "patitamani.png", precio: 18 },
  { nombre: "Trucha frita con ensalada", desc: "Trucha dorada servida con papas fritas y ensalada de cebolla y tomate.", img: "truchafrita.png", precio: 19 },
  { nombre: "Olluquito con charqui", desc: "Olluco cortado en tiras con charqui (carne seca) y ají amarillo.", img: "olluquitocharqui.png", precio: 17 },
];

const postres = [
  { nombre: "Mazamorra de calabaza", desc: "Postre hecho con calabaza, leche, canela y clavo de olor.", img: "mazamorradecalabaza.png", precio: 7 },
  { nombre: "Homuta", desc: "Dulce de maíz molido con pasas, azúcar, canela y envuelto en hoja de choclo.", img: "humita.png", precio: 6 },
  { nombre: "Dulce de quinua con leche", desc: "Postre cremoso preparado con quinua, leche, azúcar y canela.", img: "Dulcedequinuaconleche.png", precio: 7 },
  { nombre: "Chapanas", desc: "Masa de yuca con chancaca y anís, cocida envuelta en hoja de plátano.", img: "chapana.png", precio: 6 },
  { nombre: "Rosquitas de anís", desc: "Galletas suaves hechas con harina, huevo, anís y mantequilla.", img: "rosquitaanis.png", precio: 5 },
  { nombre: "Queso helado", desc: "Helado artesanal con leche, coco rallado, canela y vainilla.", img: "quesohelado.png", precio: 8 },
  { nombre: "Mazamorra de tuna", desc: "Dulce elaborado con pulpa de tuna, maicena, azúcar y clavo de olor.", img: "mazamorradetuna.png", precio: 7 },
  { nombre: "Galletas de chuño", desc: "Galletas crocantes hechas con chuño, mantequilla y azúcar rubia.", img: "galletedechuño.png", precio: 6 },
  { nombre: "Mazamorra de maíz", desc: "Tradicional postre de maíz morado con frutas secas y canela.", img: "mazamorrademaiz.png", precio: 7 },
];

const bebidas = [
  { nombre: "Mate de muña", desc: "Infusión natural de hojas de muña con aroma mentolado y propiedades digestivas.", img: "matedemuña.png", precio: 5 },
  { nombre: "Mate de coca", desc: "Infusión de hojas de coca con efecto energizante y antioxidante.", img: "matedecoca.png", precio: 5 },
  { nombre: "Chicha de Jora", desc: "Bebida fermentada de maíz jora con sabor ligeramente ácido.", img: "chichadejora.png", precio: 6 },
  { nombre: "Chicha de quinua", desc: "Refrescante bebida hecha con quinua cocida, piña y canela.", img: "chichadequinua.png", precio: 6 },
  { nombre: "Jugo de sauco", desc: "Jugo natural de sauco con agua, azúcar y limón.", img: "jugodesauco.png", precio: 5 },
  { nombre: "Chocolate caliente andino", desc: "Chocolate espeso preparado con leche, cacao nativo y canela.", img: "chocolateandino.png", precio: 7 },
  { nombre: "Jugo de aguaymanto", desc: "Bebida natural hecha con aguaymanto fresco y miel.", img: "jugodeaguaymanto.png", precio: 6 },
  { nombre: "Ponche de habas", desc: "Bebida caliente elaborada con habas, leche, canela y clavo de olor.", img: "ponchedehabas.png", precio: 6 },
  { nombre: "Emoliente", desc: "Infusión tibia de cebada, linaza, hierbas medicinales y limón.", img: "emoliente.png", precio: 5 },
];

// =============================
// FUNCIÓN PARA CREAR CARDS
// =============================
function generarCards(platos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  platos.forEach(plato => {
    const card = document.createElement("article");
    card.className =
      "card bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:-translate-y-2";

    card.innerHTML = `
      <img src="/static/images/menu/${plato.img}" alt="${plato.nombre}" 
           class="w-full h-56 object-cover">

      <div class="p-5 flex flex-col justify-between">
        <h3 class="text-xl font-semibold text-amber-900 mb-2 text-center">${plato.nombre}</h3>

        <p class="text-stone-600 text-left mb-2">${plato.desc}</p>
        <p class="text-stone-700 font-bold text-center mb-4">S/ ${plato.precio.toFixed(2)}</p>

        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-stone-700">Cantidad</label>
            <input type="number" 
                   class="cantidad w-16 text-center rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                   min="1" value="1" />
          </div>

          <button class="btn-pedido inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 
                         text-white px-4 py-2 rounded-lg shadow transition font-semibold">
            Agregar
          </button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

// =============================
// INICIALIZAR TODO EL MENÚ
// =============================
document.addEventListener("DOMContentLoaded", () => {
  generarCards(entradas, "entradasGrid");
  generarCards(platosFuertes, "platosFuertesGrid");
  generarCards(postres, "postresGrid");
  generarCards(bebidas, "bebidasGrid");
});

document.addEventListener("DOMContentLoaded", () => {
  const botonesAgregar = document.querySelectorAll(".btn-pedido");

  botonesAgregar.forEach(boton => {
    boton.addEventListener("click", () => {
      const card = boton.closest("article");
      const nombre = card.querySelector("h3").textContent;
      const cantidadInput = card.querySelector(".cantidad");
      const cantidad = parseInt(cantidadInput.value) || 1;

      let platos = JSON.parse(localStorage.getItem("platosSeleccionados")) || [];

      const existente = platos.find(p => p.nombre === nombre);
      if (existente) {
        existente.cantidad += cantidad;
      } else {
        platos.push({ nombre, cantidad });
      }

      localStorage.setItem("platosSeleccionados", JSON.stringify(platos));

      boton.textContent = "Agregado ✓";
      boton.classList.add("bg-green-600");
    });
  });
});

document.getElementById("verPedidoBtn")?.addEventListener("click", () => {
  window.location.href = "/reservar-mesa"; // Asegúrate que esta ruta coincida con tu Flask endpoint
});
