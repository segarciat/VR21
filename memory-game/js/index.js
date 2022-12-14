"use strict";

/**
 * Global constants.
 */
const BACK_CARD_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/d/d8/Atlas_deck_card_back_blue_and_brown.svg";
const UNIQUE_IMAGES_SRC = [
  "https://i.giphy.com/media/bMSaGMYM8OvsN2gKb6/giphy.webp",
  "https://i.giphy.com/media/t3cL1iKETUqlBaQ6YV/giphy.webp",
  "https://i.giphy.com/media/cnWLVExrejEiZz5xa9/giphy.webp",
  "https://i.giphy.com/media/jqIhAXf3SBpMxVpYsB/giphy.webp",
  "https://i.giphy.com/media/ZSJCdxWnrXuJG6vDbB/giphy.webp",
  "https://i.giphy.com/media/XVC9ElNTFmZ8yxyBOW/giphy.webp",
  "https://i.giphy.com/media/jOywF6yzPBJ2D9KK1x/giphy.webp",
  "https://i.giphy.com/media/VbtUysLNF86UaOwxKm/giphy.webp",
];
const MAX_CARDS = 16;
const UNFLIP_DELAY = 2000;
const FLIP_CARD_CLS = "flip-card";
const VICTORY_ID = "victoryInfo";

// Possible states card can be in.
const REVEALED = "revealed";
const HIDDEN = "hidden";
const MATCHED = "matched";

/**
 * Global state.
 */
let currentCard; // First card clicked.
let mismatchTimeoutId; // Delayed unflip timeout ID upon mismatch.
let matchAttempts = 0; // Used for scoring.

window.addEventListener("load", (e) => {
  addAllCardsToUI();
  document.getElementById("restartBtn").addEventListener("click", restart);
});

function addAllCardsToUI() {
  // Picked half of MAX_CARDS src strings.
  const srcs = UNIQUE_IMAGES_SRC.slice(0, MAX_CARDS / 2);
  const shuffledSrcs = shuffle(srcs.concat(srcs));
  shuffledSrcs.forEach((src) => addCardToUI(src));
}

function addCardToUI(src) {
  const col = document.createElement("div");
  col.classList = "col-3 p-1";
  col.style.aspectRatio = "1/1"; // Lifesaver property right here.
  col.innerHTML = `
  <div class="flip-card">
    <div class="flip-card-inner">
      <div class="flip-card-back">
        <div class="card-back-img bg-danger">
        </div>
      </div>
      <div class="flip-card-front">
        <img
          src="${src}"
          alt="Matching-card"
        />
      </div>
    </div>
  </div>
  `;

  // By default, flip cards are not revealed.
  const card = col.querySelector(`.${FLIP_CARD_CLS}`);
  card.state = HIDDEN;
  card.addEventListener("click", handleCardClick);
  document.getElementById("cardContainer").append(col);
}

function handleCardClick(e) {
  const card = e.target.closest(`.${FLIP_CARD_CLS}`);

  // Immediately hide the mismatched pair.
  if (mismatchTimeoutId) {
    clearTimeout(mismatchTimeoutId);
    const pair = Array.from(document.querySelectorAll(`.${FLIP_CARD_CLS}`));
    const card = pair.find((c) => c.state === REVEALED && c != currentCard);
    processMismatch(card);
  }

  if (card.state === HIDDEN) {
    handleHiddenCardClick(card);
  }
}

/**
 * Reavel card if hidden, or hide if revealed.
 */
function flip(card) {
  const inner = card.querySelector(".flip-card-inner");
  const isRevealed = card.state === REVEALED;
  inner.style.transform = isRevealed ? "" : "rotateY(180deg)";
  card.state = isRevealed ? HIDDEN : REVEALED;
}

/**
 * See if cards have matching URLs.
 */
function checkMatch(cardOne, cardTwo) {
  matchAttempts++;
  let src1 = cardOne.querySelector(".flip-card-front img").getAttribute("src");
  let src2 = cardTwo.querySelector(".flip-card-front img").getAttribute("src");
  return src1 === src2;
}

function handleHiddenCardClick(card) {
  flip(card); // Reveal card.
  if (!currentCard) {
    currentCard = card;
  } else if (checkMatch(card, currentCard)) {
    handleMatch(card);
  } else {
    mismatchTimeoutId = setTimeout(() => processMismatch(card), UNFLIP_DELAY);
  }
}

/**
 * Set card state to MATCHED, disallow further clicks, unset currentCard.
 */
function handleMatch(card) {
  card.removeEventListener("click", handleCardClick);
  currentCard.removeEventListener("click", handleCardClick);
  card.state = MATCHED;
  currentCard.state = MATCHED;
  currentCard = null;
  checkVictory();
}

/**
 * Unflip mismatched cards, unset currentCard and timeout ID.
 */
function processMismatch(card) {
  flip(card);
  flip(currentCard);
  mismatchTimeoutId = null;
  currentCard = null;
}

function checkVictory() {
  const cards = Array.from(document.querySelectorAll(`.${FLIP_CARD_CLS}`));
  const won = cards.filter((card) => card.state !== MATCHED).length === 0;
  if (won) {
    document.getElementById(VICTORY_ID).classList.remove("d-none");
    const successRate = ((MAX_CARDS / 2 / matchAttempts) * 100).toFixed(2);
    document.getElementById("score").textContent = successRate;
  }
}

function restart() {
  // Hide victory information.
  document.getElementById(VICTORY_ID).classList.add("d-none");
  matchAttempts = 0;

  // Remove all cards.
  const cardContainer = document.getElementById("cardContainer");
  while (cardContainer.firstElementChild)
    cardContainer.firstElementChild.remove();

  // Add them again
  addAllCardsToUI();
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffle(array) {
  // Copy the array (don't modify original).
  const shuffled = array.slice(0);

  // Shuffle it.
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}
