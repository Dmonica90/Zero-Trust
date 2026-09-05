window.InitUserScripts = function () {
  var player = GetPlayer();
  var object = player.object;
  var once = player.once;
  var addToTimeline = player.addToTimeline;
  var setVar = player.SetVar;
  var getVar = player.GetVar;
  var update = player.update;
  var pointerX = player.pointerX;
  var pointerY = player.pointerY;
  var showPointer = player.showPointer;
  var hidePointer = player.hidePointer;
  var slideWidth = player.slideWidth;
  var slideHeight = player.slideHeight;
  var getKeyDown = player.getKeyDown;
  var keydown = player.keydown;
  var keyup = player.keyup;
  window.Script181 = function () {
    // 1) Llamamos al "Cerebro" de Storyline
    var player = GetPlayer();

    // 2) Leemos la variable StartAgain
    var startAgainVal = player.GetVar("StartAgain");

    // 3) Gate: sólo resetear si StartAgain está activada
    if (startAgainVal === true) {

      // --- APLICAR RESET DE VARIABLES ---

      // Control
      player.SetVar("StartAgain", false);

      // Textos
      player.SetVar("Name", "");

      // Estado de los personajes (Mía no está porque si la despides, ganas el juego)
      player.SetVar("Leo_Active", true);
      player.SetVar("Sara_Active", true);
      player.SetVar("Omar_Active", true);

      // Zooms de exploración
      player.SetVar("Zoom_Sara", false);
      player.SetVar("Zoom_Omar", false);
      player.SetVar("Zoom_Mia", false);
      player.SetVar("Zoom_Leo", false);
    }
  }

  window.Script182 = function () {
    var texto = document.querySelector("[data-acc-text='Texto_Dia']");
    var fondo = document.querySelector("[data-acc-text='Fondo_Negro']");

    if (texto && fondo) {
      // --- NUEVO: Lógica de centrado Responsive ---
      texto.style.position = "absolute";
      texto.style.top = "50%";
      texto.style.left = "50%";
      texto.style.zIndex = "9999"; // Asegura que quede por encima del fondo negro
      texto.style.transformOrigin = "center center"; // El escalado se hace desde el centro

      // 1. Animación del texto
      // Agregamos translate(-50%, -50%) a cada fotograma clave para mantener el centro perfecto
      texto.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1.5)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.4 },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.8 },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }
      ], {
        duration: 3500,
        easing: 'ease-out',
        fill: 'forwards'
      });

      // 2. Animación del fondo 
      fondo.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 1000,
        delay: 3500,
        fill: 'forwards'
      });
    }
  }

  window.Script183 = function () {
    var texto = document.querySelector("[data-acc-text='Texto_Dia']");
    var fondo = document.querySelector("[data-acc-text='Fondo_Negro']");

    if (texto && fondo) {
      // Aplicamos la misma lógica de centrado
      texto.style.position = "absolute";
      texto.style.top = "50%";
      texto.style.left = "50%";
      texto.style.zIndex = "9999";
      texto.style.transformOrigin = "center center";

      texto.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1.5)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.4 },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.8 },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }
      ], {
        duration: 3500,
        easing: 'ease-out',
        fill: 'forwards'
      });

      fondo.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 1000,
        delay: 3500,
        fill: 'forwards'
      });
    }
  }

};
