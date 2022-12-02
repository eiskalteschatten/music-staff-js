function drawTimeline() {
  const canvas = document.getElementById('musicStaffCanvas');

  if (!canvas) {
    throw new Error('No canvas found!');
  }

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const ctx = canvas.getContext('2d');
  const foregroundColor = isDarkMode ? 'white' : 'black';
  const backgroundColor = isDarkMode ? 'black' : 'white';
  const fontSize = 16;

  ctx.strokeStyle = foregroundColor;
  ctx.font = `${fontSize}px sans-serif`;

  let raf;
  let timeLineX = 0;

  const distanceBetweenNotes = 40;
  const lineHeightOffset = 1;

  let bassClefLoaded = false;
  const bassClef = new Image();

  function loadBassClef(cb) {
    bassClef.src = isDarkMode ? 'images/bass-clef-white.svg' : 'images/bass-clef-black.svg';
    bassClef.onload = function() {
      bassClefLoaded = true;
      cb();
    };
  }

  function drawBassClef() {
    const draw = () => {
      const height = canvas.height / 2;
      const width = bassClef.height * (height / bassClef.width);
      const x = 150 - timeLineX;
      const y = lineHeightOffset;

      ctx.setTransform(1, 0, 0, 1, x, y);
      ctx.moveTo(0, 0);
      ctx.drawImage(bassClef, 0, 0, height, width);
    };

    if (!bassClefLoaded) {
      loadBassClef(draw);
    }
    else {
      draw();
    }
  }

  function drawStaff() {
    const numberOfLines = 5;
    const distanceBetweenLines = canvas.height / numberOfLines;

    for (let line = 0; line < numberOfLines; line++) {
      const y = line * distanceBetweenLines + lineHeightOffset;

      ctx.beginPath();
      ctx.setTransform(1, 0, 0, 1, 0, y);
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
      ctx.closePath();
    }

    drawBassClef();
  }

  // function drawYears() {
  //   let yearIndex = 0;

  //   for (let line = 1; yearIndex < years.length; line++) {
  //     const hasYear = !(line % howOftenYearsAreShown);
  //     const height = hasYear ? (canvas.height / 2) - fontSize : canvas.height / 2;
  //     const x = (line * distanceBetweenLines) - timeLineX;
  //     const y = hasYear ? (height / 2) + (fontSize / 2) : height / 2;

  //     ctx.beginPath();
  //     ctx.setTransform(1,0,0,1, x, y);
  //     ctx.moveTo(0, 0);
  //     ctx.lineTo(0, height);
  //     ctx.stroke();
  //     ctx.closePath();

  //     if (hasYear) {
  //       const year = years[yearIndex];
  //       const label = year < 0 ? 'BCE' : 'CE';
  //       ctx.setTransform(1,0,0,1, x, y);
  //       ctx.textAlign = 'center';
  //       ctx.fillStyle = foregroundColor;
  //       ctx.fillText(`${Math.abs(year)} ${label}`, 0, 55);
  //       yearIndex++;
  //     }
  //   }
  // }

  function drawGradient() {
    const transparentColor = isDarkMode ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(.25, transparentColor);
    gradient.addColorStop(.75, transparentColor);
    gradient.addColorStop(1, backgroundColor);

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawYears();
    drawStaff();
    drawGradient();
    timeLineX += 1;
    raf = window.requestAnimationFrame(animate);
  }

  raf = window.requestAnimationFrame(animate);

  // Stop the animation after 5 minutes
  setTimeout(() => cancelAnimationFrame(raf), 300000);
}

window.onload = drawTimeline;
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawTimeline);
