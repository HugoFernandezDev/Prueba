document.addEventListener("DOMContentLoaded", () => {
  const secciones = document.querySelectorAll(".scroll-animado");

  const mostrarScroll = () => {
    secciones.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        if (sec.id === "seleccion-mesas") {
          sec.classList.add("scroll-visible-right");
        } else {
          sec.classList.add("scroll-visible-left");
        }
      }
    });
  };

  window.addEventListener("scroll", mostrarScroll);
  mostrarScroll();

  const mesasContainer = document.getElementById("mesas-container");
  const form = document.getElementById("reserva-form");
  const formularioSeccion = form.closest(".formulario");
  const seleccionSeccion = document.getElementById("seleccion-mesas");
  const mensajeFinal = document.getElementById("popup-final");
  const btnVolverPopup = document.getElementById("btn-volver-popup");

  const inputMesa = document.createElement("input");
  inputMesa.type = "hidden";
  inputMesa.name = "mesa";
  form.appendChild(inputMesa);

  const reiniciarFlujo = () => {
    mensajeFinal.classList.add("oculto");
    mensajeFinal.classList.remove("visible");

    seleccionSeccion.classList.add("oculto");
    seleccionSeccion.classList.remove("visible");

    formularioSeccion.classList.remove("oculto");
    formularioSeccion.classList.add("visible");

    form.reset();
    mesasContainer.innerHTML = "";
    inputMesa.value = "";
  };

  const mostrarPopup = () => {
    mensajeFinal.classList.remove("oculto");
    mensajeFinal.classList.add("visible");
  };

  btnVolverPopup.addEventListener("click", reiniciarFlujo);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    formularioSeccion.classList.add("oculto");
    seleccionSeccion.classList.remove("oculto");
    seleccionSeccion.classList.add("visible");

    mesasContainer.innerHTML = "";

    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    const ocupadas = (new Date(fecha).getDay() === 5)
      ? [2, 3, 8, 13, 17]
      : [5, 7, 12, 14, 20];

    const totalMesas = 25;

    for (let i = 1; i <= totalMesas; i++) {
      const mesa = document.createElement("div");
      mesa.classList.add("mesa");

      const img = document.createElement("img");
      img.src = "/static/icon/mesita.png";
      img.alt = `Mesa ${i}`;
      img.classList.add("mesa-icono");

      if (ocupadas.includes(i)) {
        mesa.classList.add("ocupada");
        img.style.opacity = "0.3";
        mesa.title = `Mesa ${i} (Ocupada)`;
      } else {
        mesa.classList.add("disponible");
        mesa.title = `Mesa ${i} (Disponible)`;

        mesa.addEventListener("click", () => {
          document.querySelectorAll(".mesa.seleccionada").forEach(m => m.classList.remove("seleccionada"));
          mesa.classList.add("seleccionada");
          inputMesa.value = i;

          mostrarPopup(); // ✅ solo muestra, no reinicia automáticamente
        });
      }

      mesa.appendChild(img);
      mesasContainer.appendChild(mesa);
    }

    seleccionSeccion.scrollIntoView({ behavior: "smooth" });
  });
});
