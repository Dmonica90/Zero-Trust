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
    var player = GetPlayer();

    // Gate: sólo resetear si StartAgain está activada
    if (player.GetVar("StartAgain")) {

      player.SetVar("StartAgain", false);
      player.SetVar("Name", "");

      // Resetear personajes activos usando un Array
      var personajes = ["Leo", "Sara", "Omar"];
      personajes.forEach(function (p) {
        player.SetVar(p + "_Active", true);
      });

      // Resetear zooms usando un Array
      var zooms = ["Sara", "Omar", "Mia", "Leo"];
      zooms.forEach(function (z) {
        player.SetVar("Zoom_" + z, false);
      });
    }
  }

  window.Script182 = function () {
    var texto = document.querySelector("[data-acc-text='Texto_Dia']");
    var fondo = document.querySelector("[data-acc-text='Fondo_Negro']");

    if (texto && fondo) { // Prevención de errores si el DOM no ha cargado
      // 1. Animación del texto (Aparece, se mantiene y desaparece)
      texto.animate([
        { opacity: 0, transform: 'scale(1.5)' },
        { opacity: 1, transform: 'scale(1)', offset: 0.4 }, // Aparece a los 1.4s
        { opacity: 1, transform: 'scale(1)', offset: 0.8 }, // Se mantiene en pantalla
        { opacity: 0, transform: 'scale(1)' }               // Desaparece
      ], {
        duration: 3500, // Equivale a tus 2s + 1.5s originales
        easing: 'ease-out',
        fill: 'forwards'
      });

      // 2. Animación del fondo (Opcional, si también querías desvanecerlo como dice tu comentario)
      fondo.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 1000,
        delay: 3500, // Espera a que termine el texto
        fill: 'forwards'
      });
    }                             // Finalmente, el fondo negro se desvanece para revelar la oficina
  }

  window.Script183 = function () {
    var texto = document.querySelector("[data-acc-text='Texto_Dia']");
    var fondo = document.querySelector("[data-acc-text='Fondo_Negro']");

    if (texto && fondo) { // Prevención de errores si el DOM no ha cargado
      // 1. Animación del texto (Aparece, se mantiene y desaparece)
      texto.animate([
        { opacity: 0, transform: 'scale(1.5)' },
        { opacity: 1, transform: 'scale(1)', offset: 0.4 }, // Aparece a los 1.4s
        { opacity: 1, transform: 'scale(1)', offset: 0.8 }, // Se mantiene en pantalla
        { opacity: 0, transform: 'scale(1)' }               // Desaparece
      ], {
        duration: 3500, // Equivale a tus 2s + 1.5s originales
        easing: 'ease-out',
        fill: 'forwards'
      });

      // 2. Animación del fondo (Opcional, si también querías desvanecerlo como dice tu comentario)
      fondo.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 1000,
        delay: 3500, // Espera a que termine el texto
        fill: 'forwards'
      });
    }
  }

};
