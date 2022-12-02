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

  const lineHeightOffset = 1;
  const numberOfLines = 5;
  const distanceBetweenLines = canvas.height / numberOfLines;
  const distanceBetweenNotes = 40;

  let bassClefLoaded = false;
  const bassClef = new Image();

  function loadBassClef(cb) {
    bassClef.src = isDarkMode ? 'images/bass-clef-white.svg' : 'images/bass-clef-black.svg';
    bassClef.onload = function() {
      bassClefLoaded = true;
      cb();
    };
  }

  let wholeNoteLoaded = false;
  const wholeNote = new Image();

  function loadWholeNote(cb) {
    wholeNote.src = isDarkMode ? 'images/whole-note-white.svg' : 'images/whole-note-black.svg';
    wholeNote.onload = function() {
      wholeNoteLoaded = true;
      cb();
    };
  }

  let halfNoteLoaded = false;
  const halfNote = new Image();

  function loadHalfNote(cb) {
    halfNote.src = isDarkMode ? 'images/half-note-white.svg' : 'images/half-note-black.svg';
    halfNote.onload = function() {
      halfNoteLoaded = true;
      cb();
    };
  }

  let quarterNoteLoaded = false;
  const quarterNote = new Image();

  function loadQuarterNote(cb) {
    quarterNote.src = isDarkMode ? 'images/quarter-note-white.svg' : 'images/quarter-note-black.svg';
    quarterNote.onload = function() {
      quarterNoteLoaded = true;
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

  function drawWholeNote(x, y) {
    const draw = () => {
      const height = canvas.height / 2;
      const width = wholeNote.height * (height / wholeNote.width);
      const x = x - timeLineX;

      ctx.setTransform(1, 0, 0, 1, x, y);
      ctx.moveTo(0, 0);
      ctx.drawImage(wholeNote, 0, 0, height, width);
    };

    if (!wholeNoteLoaded) {
      loadWholeNote(draw);
    }
    else {
      draw();
    }
  }

  function drawHalfNote(x, y) {
    const draw = () => {
      const height = canvas.height / 2;
      const width = halfNote.height * (height / halfNote.width);
      const x = x - timeLineX;

      ctx.setTransform(1, 0, 0, 1, x, y);
      ctx.moveTo(0, 0);
      ctx.drawImage(halfNote, 0, 0, height, width);
    };

    if (!halfNoteLoaded) {
      loadHalfNote(draw);
    }
    else {
      draw();
    }
  }

  function drawQuarterNote(x, y) {
    const draw = () => {
      const height = canvas.height / 2;
      const width = quarterNote.height * (height / quarterNote.width);
      const x = x - timeLineX;

      ctx.setTransform(1, 0, 0, 1, x, y);
      ctx.moveTo(0, 0);
      ctx.drawImage(quarterNote, 0, 0, height, width);
    };

    if (!quarterNoteLoaded) {
      loadQuarterNote(draw);
    }
    else {
      draw();
    }
  }

  function composeSong() {
    const beatsPerMeasure = 4;
  }

  function drawStaff() {
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
    composeSong();
  }

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
