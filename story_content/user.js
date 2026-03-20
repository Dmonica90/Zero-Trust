window.InitUserScripts = function()
{
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
window.Script181 = function()
{
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

window.Script182 = function()
{
  // Seleccionamos los elementos usando su texto de accesibilidad
var texto = document.querySelector("[data-acc-text='Texto_Dia']");
var fondo = document.querySelector("[data-acc-text='Fondo_Negro']");

// Creamos una línea de tiempo de GSAP para secuenciar la animación
var tl = gsap.timeline();

// 1. Estado inicial: el texto está invisible y un poco más grande
gsap.set(texto, { opacity: 0, scale: 1.5 });

// 2. La secuencia Majora's Mask:
tl.to(texto, { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }) // Aparece lentamente reduciendo su tamaño
  .to(texto, { opacity: 0, duration: 1.5, delay: 2.5 })                 // Se queda en pantalla 2.5 segundos y luego se desvanece
                             // Finalmente, el fondo negro se desvanece para revelar la oficina
}

window.Script183 = function()
{
  // Seleccionamos los elementos usando su texto de accesibilidad
var texto = document.querySelector("[data-acc-text='Texto_Dia']");
var fondo = document.querySelector("[data-acc-text='Fondo_Negro']");

// Creamos una línea de tiempo de GSAP para secuenciar la animación
var tl = gsap.timeline();

// 1. Estado inicial: el texto está invisible y un poco más grande
gsap.set(texto, { opacity: 0, scale: 1.5 });

// 2. La secuencia Majora's Mask:
tl.to(texto, { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }) // Aparece lentamente reduciendo su tamaño
  .to(texto, { opacity: 0, duration: 1.5, delay: 2.5 })                 // Se queda en pantalla 2.5 segundos y luego se desvanece
                             // Finalmente, el fondo negro se desvanece para revelar la oficina
}

};
