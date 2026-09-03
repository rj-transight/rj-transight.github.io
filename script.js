const responseBox = document.getElementById('responseBox');
const robot = document.getElementById('robot');
const bug = document.getElementById('bug');
const eyes = document.querySelectorAll('.eye');
const scoreValue = document.getElementById('scoreValue');
const moodValue = document.getElementById('moodValue');

const yesResponses = [
  'Don\'t touch it. Only God knows why it works, and even He is not answering calls.',
  'Great. Now leave it alone before the universe notices and changes its mind.',
  'Perfect. This is the kind of miracle we celebrate quietly and never test again.',
  'Well, it runs. That means the code is either lucky or cursed. We keep it as is.',
  'Amazing. Do not touch the build. Stability is a fragile thing and we are not worthy.',
  'It works. Keep it alive. The next commit is a crime against luck.'
];

const noResponses = [
  'So the code is still in its “I will not be useful” phase. Go do something productive instead.',
  'No? Then go fix the real problem. The compiler is not waiting for you to become brave.',
  'That\'s fine. Some people are better at doing other work than creating clean code.',
  'If it is not working, at least you can still be useful — maybe try a different task instead of staring at the same bug.',
  'No runtime success? Then this is a perfect time to do something else and let the code reflect on its life choices.',
  'Interesting. The program has failed, but your confidence is still trying. Let it rest.'
];

const successTexts = [
  'Nice. The bug was defeated by sheer panic and a lucky click.',
  'Clean hit. The bug has been reclassified as a cautionary tale.',
  'That was a successful squish. Even the build is impressed.',
  'Excellent work. The little menace has now entered the void.'
];

let score = 0;
let bugX = window.innerWidth * 0.62;
let bugY = window.innerHeight * 0.5;
let targetX = bugX;
let targetY = bugY;
let bugActive = true;

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getDifficulty() {
  const catchRadius = Math.max(14, 30 - score * 1.8);
  const fleeDistance = Math.max(70, 180 - score * 8);
  const fleeSpeed = 3.4 + score * 0.45;
  const bugSize = Math.max(12, 22 - score * 0.9);
  return { catchRadius, fleeDistance, fleeSpeed, bugSize };
}

function refreshBugVisuals() {
  const { bugSize } = getDifficulty();
  bug.style.width = `${bugSize}px`;
  bug.style.height = `${bugSize}px`;
}

function setMood(mood, label) {
  const validMoods = ['neutral', 'happy', 'angry', 'proud', 'suspicious'];
  if (!validMoods.includes(mood)) return;

  robot.classList.remove(...validMoods.map((item) => `mood-${item}`));
  robot.classList.add(`mood-${mood}`);
  moodValue.textContent = label || mood.charAt(0).toUpperCase() + mood.slice(1);
}

function triggerReaction(type) {
  robot.classList.add('is-reacting');
  responseBox.classList.add('active');

  if (type === 'yes') {
    setMood('happy', 'Confident');
  } else if (type === 'no') {
    setMood('angry', 'Offended');
  } else if (type === 'catch') {
    setMood('proud', 'Proud');
  } else {
    setMood('suspicious', 'Suspicious');
  }

  setTimeout(() => {
    robot.classList.remove('is-reacting');
    responseBox.classList.remove('active');
    setMood('neutral', 'Neutral');
  }, 260);
}

function updateScore() {
  scoreValue.textContent = String(score);
}

function createSpark(x, y) {
  const spark = document.createElement('span');
  spark.className = 'spark';
  spark.style.left = x + 'px';
  spark.style.top = y + 'px';
  spark.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
  spark.style.setProperty('--dy', `${(Math.random() - 0.5) * 80}px`);
  document.body.appendChild(spark);

  setTimeout(() => spark.remove(), 400);
}

function burstBug(x, y) {
  for (let i = 0; i < 12; i += 1) {
    createSpark(x, y);
  }
}

function spawnBug() {
  const maxX = window.innerWidth - 60;
  const maxY = window.innerHeight - 60;
  let x = Math.random() * maxX;
  let y = Math.random() * maxY;

  if (Math.hypot(x - targetX, y - targetY) < 180) {
    x = Math.min(maxX, Math.max(30, targetX + 210));
    y = Math.min(maxY, Math.max(30, targetY + 210));
  }

  bugX = x;
  bugY = y;
  refreshBugVisuals();
  bug.style.left = bugX + 'px';
  bug.style.top = bugY + 'px';
  bugActive = true;
}

function updateResponse(answer) {
  const message = answer === 'yes' ? randomItem(yesResponses) : randomItem(noResponses);
  responseBox.textContent = message;
  triggerReaction(answer);
}

function handleBugCatch(event) {
  if (!bugActive) return;

  const { catchRadius } = getDifficulty();
  const distance = Math.hypot(event.clientX - bugX, event.clientY - bugY);

  if (distance > catchRadius) {
    responseBox.textContent = 'Too far. The bug dodged you again.';
    triggerReaction('suspicious');
    return;
  }

  event.preventDefault();
  bugActive = false;
  score += 1;
  updateScore();
  burstBug(event.clientX, event.clientY);
  responseBox.textContent = randomItem(successTexts);
  triggerReaction('catch');

  setTimeout(() => {
    spawnBug();
    setMood('neutral', 'Neutral');
  }, 550);
}

function followBug() {
  const { fleeDistance, fleeSpeed } = getDifficulty();
  const dx = targetX - bugX;
  const dy = targetY - bugY;
  const distance = Math.hypot(dx, dy);

  if (distance < fleeDistance) {
    const fleeX = bugX - targetX;
    const fleeY = bugY - targetY;
    const fleeLength = Math.hypot(fleeX, fleeY) || 1;
    const chaseX = (fleeX / fleeLength) * fleeSpeed;
    const chaseY = (fleeY / fleeLength) * fleeSpeed;
    bugX += chaseX;
    bugY += chaseY;
  } else {
    const angle = Math.atan2(dy, dx);
    const move = Math.min(distance, 7);
    bugX += Math.cos(angle) * move * 0.1;
    bugY += Math.sin(angle) * move * 0.1;
  }

  const maxX = window.innerWidth - 20;
  const maxY = window.innerHeight - 20;
  bugX = Math.min(maxX, Math.max(18, bugX));
  bugY = Math.min(maxY, Math.max(18, bugY));

  const angle = Math.atan2(targetY - bugY, targetX - bugX) * 180 / Math.PI;
  bug.style.left = bugX + 'px';
  bug.style.top = bugY + 'px';
  bug.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  refreshBugVisuals();

  requestAnimationFrame(followBug);
}

function updateMouseTracking(event) {
  targetX = event.clientX;
  targetY = event.clientY;

  const robotRect = robot.getBoundingClientRect();
  const centerX = robotRect.left + robotRect.width / 2;
  const centerY = robotRect.top + robotRect.height / 2;
  const offsetX = (event.clientX - centerX) / robotRect.width;
  const offsetY = (event.clientY - centerY) / robotRect.height;

  eyes.forEach((eye) => {
    const x = Math.max(-8, Math.min(8, offsetX * 12));
    const y = Math.max(-8, Math.min(8, offsetY * 10));
    eye.style.transform = `translate(${x}px, ${y}px)`;
  });
}

window.addEventListener('pointermove', updateMouseTracking);
window.addEventListener('resize', () => {
  bugX = Math.min(window.innerWidth - 20, Math.max(18, bugX));
  bugY = Math.min(window.innerHeight - 20, Math.max(18, bugY));
  bug.style.left = bugX + 'px';
  bug.style.top = bugY + 'px';
});

bug.addEventListener('click', handleBugCatch);
bug.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleBugCatch({
      preventDefault: () => {},
      clientX: bugX,
      clientY: bugY
    });
  }
});

document.querySelector('.btn.yes').addEventListener('click', () => updateResponse('yes'));
document.querySelector('.btn.no').addEventListener('click', () => updateResponse('no'));

setMood('neutral', 'Neutral');
responseBox.textContent = 'I am evaluating your confidence level.';
updateScore();
refreshBugVisuals();
requestAnimationFrame(followBug);
