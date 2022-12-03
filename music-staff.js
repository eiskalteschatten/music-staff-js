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
  const bassClefStartX = 100;

  let wholeNoteLoaded = false;
  const wholeNote = new Image();
  wholeNote.src = isDarkMode ? 'images/whole-note-white.png' : 'images/whole-note-black.png';
  wholeNote.onload = function() {
    wholeNoteLoaded = true;
    attemptToDraw();
  };

  let halfNoteLoaded = false;
  const halfNote = new Image();
  halfNote.src = isDarkMode ? 'images/half-note-white.png' : 'images/half-note-black.png';
  halfNote.onload = function() {
    halfNoteLoaded = true;
    attemptToDraw();
  };

  let quarterNoteLoaded = false;
  const quarterNote = new Image();
  quarterNote.src = isDarkMode ? 'images/quarter-note-white.png' : 'images/quarter-note-black.png';
  quarterNote.onload = function() {
    quarterNoteLoaded = true;
    attemptToDraw();
  };

  let bassClefLoaded = false;
  const bassClef = new Image();
  bassClef.src = isDarkMode ? 'images/bass-clef-white.png' : 'images/bass-clef-black.png';
  bassClef.onload = function() {
    bassClefLoaded = true;
    attemptToDraw();
  };

  function drawBassClef() {
    const height = canvas.height / 2;
    const width = bassClef.height * (height / bassClef.width);
    const x = bassClefStartX;
    const y = lineHeightOffsetWithStaffPadding;

    ctx.setTransform(1, 0, 0, 1, x, y);
    ctx.moveTo(0, 0);
    ctx.drawImage(bassClef, 0, 0, height, width);
  }

  const noteXStartPos = bassClefStartX + distanceBetweenNotes + measurePadding;
  let noteXPos = noteXStartPos;

  function drawNote(image, position, imageOffset, flipOffset = undefined) {
    const height = distanceBetweenLines + 5;
    const width = Math.floor(image.height * (height / image.width));
    const flipNote = flipOffset && position <= 5;

    const x = flipNote
      ? noteXPos + (image.width * .5)
      : noteXPos;

    const y = flipNote
      ? Math.floor(((distanceBetweenLines / 2) * position) + (image.height * flipOffset)) - lineHeightOffsetWithStaffPadding
      : Math.floor(((distanceBetweenLines / 2) * position) - (image.height * imageOffset)) + lineHeightOffsetWithStaffPadding;

    ctx.setTransform(1, 0, 0, 1, x, y);

    if (flipNote) {
      ctx.rotate(Math.PI);
    }

    ctx.drawImage(image, 0, 0, height, width);

    noteXPos += distanceBetweenNotes + (image.width / 2);
  }

  const noteTypes = {
    whole: {
      beatsPerMeasure: 4,
      draw: (position) => {
        drawNote(wholeNote, position, .5);
      },
    },
    half: {
      beatsPerMeasure: 2,
      draw: (position) => {
        drawNote(halfNote, position, .45, .48);
      },
    },
    quarter: {
      beatsPerMeasure: 1,
      draw: (position) => {
        drawNote(quarterNote, position, .45, .48);
      },
    },
  };

  function drawMeasure(measure) {
    for (const { noteType, position } of measure) {
      const note = noteTypes[noteType];
      note.draw(position);
    }

    const dividerPosition = noteXPos + measurePadding / 2;

    ctx.beginPath();
    ctx.setTransform(1, 0, 0, 1, dividerPosition, lineHeightOffsetWithStaffPadding);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height - (lineHeightOffsetWithStaffPadding * 2) - 6);
    ctx.stroke();
    ctx.closePath();

    noteXPos += measurePadding * 2;
  }

  function generateMeasures() {
    const maxNumberOfMeasures = 100;
    const beatsPerMeasure = 4;
    const noteTypeKeys = Object.keys(noteTypes);

    const getRandomNote = () => {
      const randomNoteTypeIndex = Math.floor(Math.random() * noteTypeKeys.length);
      return noteTypeKeys[randomNoteTypeIndex];
    };

    for (let measureNumber = 1; measureNumber <= maxNumberOfMeasures; measureNumber++) {
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

  function attemptToDraw() {
    if (
      bassClefLoaded &&
      wholeNoteLoaded &&
      halfNoteLoaded &&
      quarterNoteLoaded
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStaff();
      generateMeasures();
      drawGradient();
    }
  }
}

window.onload = drawTimeline;
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawTimeline);
