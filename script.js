// Ethan Larg
// IST 237 Final Project
// Cyber Stratagem
// 7/23/2025

$(document).ready(function () {
  // Possible arrow options
  const arrows = ['⇧', '⇩', '⇦', '⇨'];

  // Game state variables
  let sequence = [];         // Current arrow sequence to memorize
  let userInput = [];        // User's input sequence
  let timer;                 // Timer interval reference
  let timeLeft = 30;         // Starting countdown time
  let score = 0;             // Player's score
  let sequenceLength = 4;    // Current length of the sequence
  let showingSequence = false; // Flag to prevent input while showing sequence
  let isPaused = false;      // Pause flag
  let revealCount = 0;       // Number of available "Reveal" uses

  // jQuery references to DOM elements
  const $sequenceBox = $('#sequence');
  const $inputBox = $('#input');
  const $timer = $('#timer');
  const $score = $('#score');
  const $startBtn = $('#startBtn');
  const $revealCount = $('#revealCount');

  // Sound effect elements
  const sfxCorrect = document.getElementById('sfx-correct');
  const sfxWrong = document.getElementById('sfx-wrong');
  const sfxLevelup = document.getElementById('sfx-levelup');

  // Music beat tracks
  let beats = [
    document.getElementById('beat1'),
    document.getElementById('beat2'),
    document.getElementById('beat3')
  ];
  let currentBeat = 0;

  // Shuffle array in place for beats
  function shuffleBeats(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Begin the game- hide intro, show game field
  $('#beginBtn').on('click', function () {
    $('#introScreen').hide();
    $('#gameField').show();
  });

  // Play background beat music in sequence and loop
  function playNextBeat() {
    if (isPaused) return;

    const beat = beats[currentBeat];
    beat.currentTime = 0;
    beat.play();

    // When track ends, play next if not paused
    beat.onended = () => {
      if (!isPaused) {
        currentBeat = (currentBeat + 1) % beats.length;
        playNextBeat();
      }
    };
  }

  // Generate a new sequence of arrow symbols
  function generateSequence() {
    sequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      const rand = arrows[Math.floor(Math.random() * arrows.length)];
      sequence.push(rand);
    }
  }

  // Display the current sequence for a short time
  function showSequence() {
    showingSequence = true;
    $sequenceBox.text(sequence.join(' '));
    setTimeout(() => {
      $sequenceBox.text('[REDACTED]');
      showingSequence = false;
    }, 3000);
  }

  // Start the countdown timer
  function startTimer() {
    timeLeft = 30;
    $timer.text(timeLeft);
    timer = setInterval(() => {
      if (!isPaused) {
        timeLeft--;
        $timer.text(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          endGame();
        }
      }
    }, 1000);
  }

  // Clear user input box and array
  function resetInput() {
    userInput = [];
    $inputBox.text('');
  }

  // End the game- show alert, stop music, reset UI
  function endGame() {
    sfxWrong.play();
    alert(`Out of Time\nFinal Score: ${score}`);
    $startBtn.prop('disabled', false);
    $sequenceBox.text('[ PRESS START ]');
    resetInput();
    beats.forEach(b => {
      b.pause();
      b.currentTime = 0;
    });
  }

  // Move to the next round: increase difficulty every 5 correct
  function nextRound() {
    resetInput();
    if (score > 0 && score % 5 === 0) {
      sequenceLength++;      // Make sequence longer
      revealCount++;         // Add a reveal credit
      $revealCount.text(revealCount);
      flashLevelUp();        // Show level up effect
    }
    generateSequence();
    showSequence();
  }

  // Show visual/sound cue on level up
  function flashLevelUp() {
    $('#levelUpMsg').text('LEVEL UP! +1 Sequence').fadeIn(200);
    sfxLevelup.play();
    setTimeout(() => {
      $('#levelUpMsg').fadeOut(300);
    }, 1200);
  }

  // Handle arrow key input from the player
  $(document).on('keydown', function (e) {
    if (showingSequence || timeLeft <= 0 || isPaused) return;

    let arrow = '';
    if (e.key === 'ArrowUp') arrow = '⇧';
    else if (e.key === 'ArrowDown') arrow = '⇩';
    else if (e.key === 'ArrowLeft') arrow = '⇦';
    else if (e.key === 'ArrowRight') arrow = '⇨';

    if (arrow) {
      userInput.push(arrow);
      $inputBox.text(userInput.join(' '));

      const index = userInput.length - 1;

      // Incorrect input
      if (userInput[index] !== sequence[index]) {
        $inputBox.text('❌ WRONG');
        $inputBox.addClass('wrong');
        sfxWrong.play();
        setTimeout(() => {
          $inputBox.removeClass('wrong');
          resetInput();
        }, 800);
        return;
      }

      // Correct full sequence
      if (userInput.length === sequence.length) {
        score++;
        $score.text(score);
        timeLeft += 5;
        $timer.text(timeLeft);
        $inputBox.addClass('correct');
        sfxCorrect.play();
        setTimeout(() => {
          $inputBox.removeClass('correct');
        }, 300);
        nextRound();
      }
    }
  });

  // Start Round button logic
  $startBtn.on('click', function () {
    score = 0;
    sequenceLength = 4;
    revealCount = 0;
    $revealCount.text(revealCount);
    $score.text(score);
    $startBtn.prop('disabled', true);

    shuffleBeats(beats);     // Shuffle background music
    currentBeat = 0;
    playNextBeat();          // Start music
    nextRound();             // Generate and show first sequence
    startTimer();            // Begin countdown
  });

  // Pause/Resume the game
  $('#pauseBtn').on('click', function () {
    isPaused = !isPaused;
    const label = isPaused ? 'Resume Game' : 'Pause Game';
    $('#pauseBtn').text(label);

    if (isPaused) {
      $sequenceBox.text('[ PAUSED ]');
      beats.forEach(b => b.pause());
    } else {
      $sequenceBox.text('[REDACTED]');
      playNextBeat(); // Resume music
    }
  });

  // End game early button
  $('#endBtn').on('click', function () {
    clearInterval(timer);
    endGame();
  });

  // Reveal button logic: show sequence if reveal available
  $('#revealBtn').on('click', function () {
    if (revealCount > 0 && !showingSequence && timeLeft > 0 && !isPaused) {
      revealCount--;
      $revealCount.text(revealCount);
      showSequence();
    }
  });
});
