"use strict";

const adviceNumber = document.querySelector(".advice-number");
const adviceText = document.querySelector(".advice-text");
const diceButton = document.querySelector(".dice");

const url = "https://api.adviceslip.com/advice";

const getAdvice = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    adviceNumber.textContent = `advice #${data.slip.id}`.toUpperCase();
    adviceText.textContent = `"${data.slip.advice}"`;
  } catch (error) {
    console.error(error);
  }
};

getAdvice();

diceButton.addEventListener("click", getAdvice);
