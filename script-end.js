document.addEventListener('DOMContentLoaded', function() {
  const svgElement = document.querySelector('#mySVG');
  let angle = 0;

  function rotateSVG() {
      if (svgElement) {
          angle = (angle - 1) % 360;  // Reversed direction by changing +1 to -1
          svgElement.style.transform = `rotate(${angle}deg)`;
          requestAnimationFrame(rotateSVG);
      }
  }

  rotateSVG();
});