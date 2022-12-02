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

  const staffPadding = 10;
  const lineHeightOffset = 1;
  const lineHeightOffsetWithStaffPadding = staffPadding + lineHeightOffset;
  const numberOfLines = 5;
  // * 2 for the number of spaces between the lines
  // -2 to exclude the positions outside of the 5 staff lines:
  // Below an offset of 1 is used in the position calculation to exclude the space above the first line
  const maxNotePositions = (numberOfLines * 2) - 2;
  const distanceBetweenLines = (canvas.height - staffPadding) / numberOfLines;
  const distanceBetweenNotes = 60;
  const measurePadding = 50;
  const bassClefStartX = 150;

  let bassClefLoaded = false;
  const bassClef = new Image();

  function loadBassClef(cb) {
    bassClef.src = isDarkMode ? 'images/bass-clef-white.png' : 'images/bass-clef-black.png';
    bassClef.onload = function() {
      bassClefLoaded = true;
      cb();
    };
  }

  function drawBassClef() {
    const draw = () => {
      const height = canvas.height / 2;
      const width = bassClef.height * (height / bassClef.width);
      const x = bassClefStartX - timeLineX;
      const y = lineHeightOffsetWithStaffPadding;

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

  let noteXPos = (bassClefStartX + distanceBetweenNotes + measurePadding);

  function drawNote(image, position, imageOffset) {
    const height = distanceBetweenLines + 5;
    const width = Math.floor(image.height * (height / image.width));
    const y = Math.floor(((distanceBetweenLines / 2) * position) - (image.height * imageOffset) - lineHeightOffset) + lineHeightOffsetWithStaffPadding;
    // const y = Math.floor((distanceBetweenLines / 2) - lineHeightOffset);
console.log(image, height, width, noteXPos, y, position)

    ctx.setTransform(1, 0, 0, 1, noteXPos, y);
    ctx.drawImage(image, 0, 0, height, width);

    noteXPos += distanceBetweenNotes + (image.width / 2) - timeLineX;
  }

  const noteTypes = {
    whole: {
      beatsPerMeasure: 4,
      draw: (position) => {
        const wholeNote = new Image();
        wholeNote.src = isDarkMode ? 'images/whole-note-white.png' : 'images/whole-note-black.png';
        wholeNote.onload = function() {
          drawNote(this, position, .5);
        };
      },
      flip: false,
    },
    // half: {
    //   beatsPerMeasure: 2,
    //   draw: (position) => {
    //     const halfNote = new Image();
    //     halfNote.src = isDarkMode ? 'images/half-note-white.png' : 'images/half-note-black.png';
    //     halfNote.onload = function() {
    //       drawNote(this, position, .25);
    //     };
    //   },
    //   flip: true,
    // },
    // quarter: {
    //   beatsPerMeasure: 1,
    //   draw: (position) => {
    //     const quarterNote = new Image();
    //     quarterNote.src = isDarkMode ? 'images/quarter-note-white.png' : 'images/quarter-note-black.png';
    //     quarterNote.onload = function() {
    //       drawNote(this, position, .25);
    //     };
    //   },
    //   flip: true,
    // },
  };

  function drawMeasure(measure) {
    for (const { noteType, position } of measure) {
console.log(noteType, position);
      const note = noteTypes[noteType];
      note.draw(position);
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
          // Use 1 as an offset to make sure the space above the first line of the staff isn't used
          position: Math.floor(Math.random() * maxNotePositions) + 1,
        });

        numberOfNotes += beats;
      } while (numberOfNotes < beatsPerMeasure);

      drawMeasure(measure);
break;
    }
  }

  function drawStaff() {
    for (let line = 0; line < numberOfLines; line++) {
      const y = line * distanceBetweenLines + lineHeightOffsetWithStaffPadding;

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
