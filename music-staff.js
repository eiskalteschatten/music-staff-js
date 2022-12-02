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
  // * 2 for the number of spaces between the lines
  const maxNotePositions = numberOfLines * 2;
  const distanceBetweenLines = canvas.height / numberOfLines;
  const distanceBetweenNotes = 60;
  const bassClefStartX = 150;

  let bassClefLoaded = false;
  const bassClef = new Image();

  function loadBassClef(cb) {
    bassClef.src = isDarkMode ? 'images/bass-clef-white.svg' : 'images/bass-clef-black.svg';
    bassClef.onload = function() {
      bassClefLoaded = true;
      cb();
    };
  }

  const wholeNote = new Image();
  const halfNote = new Image();
  const quarterNote = new Image();

  function drawBassClef() {
    const draw = () => {
      const height = canvas.height / 2;
      const width = bassClef.height * (height / bassClef.width);
      const x = bassClefStartX - timeLineX;
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

  function drawNote(image, x, y) {
    const height = distanceBetweenLines + 5;
    const width = Math.floor(image.height * (height / image.width));
    const _x = x - timeLineX;

    ctx.setTransform(1, 0, 0, 1, _x, y);
    ctx.moveTo(0, 0);
    ctx.drawImage(image, 0, 0, height, width);
  }

  const noteTypes = {
    whole: {
      beatsPerMeasure: 4,
      draw: (x, y) => {
        wholeNote.src = isDarkMode ? 'images/whole-note-white.png' : 'images/whole-note-black.png';
        wholeNote.onload = function() {
          drawNote(this, x, y);
        };
      },
      flip: false,
      image: wholeNote,
      imageOffset: .5,
    },
    half: {
      beatsPerMeasure: 2,
      draw: (x, y) => {
        halfNote.src = isDarkMode ? 'images/half-note-white.png' : 'images/half-note-black.png';
        halfNote.onload = function() {
          drawNote(this, x, y);
        };
      },
      flip: true,
      image: halfNote,
      imageOffset: .25,
    },
    quarter: {
      beatsPerMeasure: 1,
      draw: (x, y) => {
        quarterNote.src = isDarkMode ? 'images/quarter-note-white.png' : 'images/quarter-note-black.png';
        quarterNote.onload = function() {
          drawNote(this, x, y);
        };
      },
      flip: true,
      image: quarterNote,
      imageOffset: .25,
    },
  };

  function drawMeasure(measure) {
// console.log(measure);
    const measurePadding = 50;
    let x = (bassClefStartX + distanceBetweenNotes + measurePadding) - timeLineX;

    for (const { noteType, position } of measure) {
      const note = noteTypes[noteType];
      x += distanceBetweenNotes + (note.image.width / 2);
      // TODO: why 6?
// console.log(noteType, note.image.height, note.imageOffset)
      const y = ((distanceBetweenLines / 2) * position) - note.image.height * note.imageOffset;// - 6;
      note.draw(x, y);
    }
  }

  function generateMeasures() {
    const maxNumberOfMeasures = 300;
    const beatsPerMeasure = 4;
    const noteTypeKeys = Object.keys(noteTypes);

    const getRandomNote = () => {
      const randomNoteTypeIndex = Math.floor(Math.random() * noteTypeKeys.length);
      return noteTypeKeys[randomNoteTypeIndex];
    };

    for (let measureNumber = 1; measureNumber < maxNumberOfMeasures; measureNumber++) {
      let numberOfNotes = 0;
      const measure = [];

      do {
        const noteType = getRandomNote();
        const beats = noteTypes[noteType].beatsPerMeasure;

        if (beats + numberOfNotes > beatsPerMeasure) {
          continue;
        }

        measure.push({
          noteType,
          position: Math.floor(Math.random() * maxNotePositions),
        });

        numberOfNotes += beats;
      } while (numberOfNotes < beatsPerMeasure);

      drawMeasure(measure);
    }
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
    generateMeasures();
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
    // raf = window.requestAnimationFrame(animate);
  }

animate()

  // raf = window.requestAnimationFrame(animate);

  // Stop the animation after 5 minutes
  // setTimeout(() => cancelAnimationFrame(raf), 300000);
  setTimeout(() => cancelAnimationFrame(raf), 500);
}

window.onload = drawTimeline;
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawTimeline);
