
var T = new Table();
var h = new CanvasHelper(T.canvas1, T.canvas1.width, T.canvas1.Height)
    h.on("click", function (x, y, e) {
    })
var help = new CanvasHelper(T.canvas, T.canvas.width, T.canvas.Height)
help.on("click", function (x, y, e) {
}).on("mousewheel", function (x, y, e) {
T.sroll(e)

})

async function initApp() { 
  T.header() 
  T.content()
}
document.addEventListener("DOMContentLoaded", () => {
  initApp();

})
