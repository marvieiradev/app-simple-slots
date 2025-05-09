document.addEventListener("DOMContentLoaded", () => {
  const reelElements = [
    document.querySelector("#reel1 .symbols-strip"),
    document.querySelector("#reel2 .symbols-strip"),
    document.querySelector("#reel3 .symbols-strip"),
  ];
  const balanceDisplay = document.getElementById("balance-display");
  const betDisplay = document.getElementById("bet-display");
  const winDisplay = document.getElementById("win-display");
  const featureMessage = document.getElementById("feature-message");
  const spinButton = document.getElementById("spin-button");
  const betMinusButton = document.getElementById("bet-minus-button");
  const betPlusButton = document.getElementById("bet-plus-button");
  const turboButton = document.getElementById("turbo-button");
  const autoButton = document.getElementById("auto-button");

  // Caminhos para as imagens webp dos símbolos
  const symbols = [
    "images/saco_moedas.webp",
    "images/envelope_vermelho.webp",
    "images/fogos_artificio.webp",
    "images/amuleto_verde.webp",
    "images/tigre_wild.webp",
    "images/laranja.webp",
  ];
  const wildSymbol = "images/tigre_wild.webp";
  const symbolHeight = 85; // Altura de cada símbolo + margem (ajustar conforme necessário para imagens)
  const visibleSymbols = 3;
  const stripLength = 30;

  let balance = 100.0;
  let currentBet = 1.0;
  const betStep = 1.0;
  const minBet = 1.0;
  const maxBet = 10.0;
  let turboMode = false;
  let autoMode = false;
  let finalSpunSymbols = [[], [], []];

  function createSymbolElement(symbolPath) {
    const img = document.createElement("img");
    img.classList.add("symbol");
    img.src = symbolPath;
    img.alt = symbolPath.split("/").pop().split(".")[0]; // Usa o nome do arquivo como alt text
    return img;
  }

  function populateReels() {
    reelElements.forEach((reelStrip) => {
      reelStrip.innerHTML = "";
      for (let i = 0; i < stripLength; i++) {
        reelStrip.appendChild(createSymbolElement(getRandomSymbol()));
      }
    });
  }

  function updateDisplays() {
    balanceDisplay.textContent = balance.toFixed(2);
    betDisplay.textContent = currentBet.toFixed(2);
    winDisplay.textContent = (parseFloat(winDisplay.textContent) || 0).toFixed(
      2
    );
  }

  function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  function calculateWin() {
    let winAmount = 0;
    const paylines = [
      [finalSpunSymbols[0][0], finalSpunSymbols[1][0], finalSpunSymbols[2][0]],
      [finalSpunSymbols[0][1], finalSpunSymbols[1][1], finalSpunSymbols[2][1]],
      [finalSpunSymbols[0][2], finalSpunSymbols[1][2], finalSpunSymbols[2][2]],
    ];

    // Atualizar as chaves do objeto payouts para corresponder aos caminhos das imagens
    const payouts = {
      "images/laranja.webp": 2,
      "images/envelope_vermelho.webp": 5,
      "images/fogos_artificio.webp": 8,
      "images/amuleto_verde.webp": 10,
      "images/saco_moedas.webp": 15,
      "images/tigre_wild.webp": 20,
    };

    paylines.forEach((line) => {
      const s1 = line[0];
      const s2 = line[1];
      const s3 = line[2];

      if (
        (s1 === s2 && s2 === s3) ||
        (s1 === wildSymbol && s2 === s3 && s2 !== wildSymbol) ||
        (s2 === wildSymbol && s1 === s3 && s1 !== wildSymbol) ||
        (s3 === wildSymbol && s1 === s2 && s1 !== wildSymbol) ||
        (s1 === wildSymbol && s2 === wildSymbol && s3 !== wildSymbol) ||
        (s1 === wildSymbol && s3 === wildSymbol && s2 !== wildSymbol) ||
        (s2 === wildSymbol && s3 === wildSymbol && s1 !== wildSymbol) ||
        (s1 === wildSymbol && s2 === wildSymbol && s3 === wildSymbol)
      ) {
        let lineSymbol = s1;
        if (s1 === wildSymbol) {
          if (s2 !== wildSymbol) lineSymbol = s2;
          else if (s3 !== wildSymbol) lineSymbol = s3;
          else lineSymbol = wildSymbol; // Linha de wilds
        }
        if (payouts[lineSymbol]) {
          winAmount += payouts[lineSymbol] * currentBet;
        }
      }
    });
    return winAmount;
  }

  async function spinReel(reelStrip, reelIndex) {
    return new Promise((resolve) => {
      reelStrip.innerHTML = "";
      const currentStripSymbols = [];
      for (let i = 0; i < stripLength; i++) {
        const sym = getRandomSymbol();
        currentStripSymbols.push(sym);
        reelStrip.appendChild(createSymbolElement(sym));
      }

      finalSpunSymbols[reelIndex] = currentStripSymbols.slice(
        stripLength - visibleSymbols
      );

      const targetPosition = -((stripLength - visibleSymbols) * symbolHeight);

      reelStrip.style.transition = "none";
      reelStrip.style.transform = `translateY(0px)`;

      reelStrip.offsetHeight;

      const spinSpeed = turboMode ? 0.3 : 1.5;
      reelStrip.style.transition = `transform ${spinSpeed}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      reelStrip.style.transform = `translateY(${targetPosition}px)`;

      setTimeout(resolve, spinSpeed * 1000 + 50 * reelIndex);
    });
  }

  async function handleSpin() {
    if (balance < currentBet) {
      featureMessage.style.opacity = 1;
      featureMessage.textContent = "Saldo insuficiente!";
      if (autoMode) toggleAutoMode();
      return;
    }

    spinButton.style.rotate = "360deg";
    spinButton.style.transition = "rotate 0.5s ease-in-out";
    setTimeout(() => {
      spinButton.style.rotate = "0deg";
      spinButton.style.transition = "none";
      spinButton.style.transform = "none";
    }, 500);

    balance -= currentBet;
    winDisplay.textContent = "0.00";
    featureMessage.style.opacity = 0;
    featureMessage.textContent = "...";
    updateDisplays();
    spinButton.disabled = true;
    if (!autoMode) autoButton.disabled = true;

    const reelPromises = reelElements.map((reelStrip, index) =>
      spinReel(reelStrip, index)
    );
    await Promise.all(reelPromises);

    const win = calculateWin();
    if (win > 0) {
      balance += win;
      winDisplay.textContent = win.toFixed(2);
      featureMessage.style.opacity = 1;
      featureMessage.textContent = `Você ganhou ${win.toFixed(2)}!`;
    }

    if (win >= 20) {
      showModal(win);
    }

    updateDisplays();
    if (!autoMode) {
      spinButton.disabled = false;
      betPlusButton.disabled = false;
      betMinusButton.disabled = false;
      turboButton.disabled = false;
      autoButton.disabled = false;
    }

    if (autoMode && balance >= currentBet) {
      autoSpinInterval = setTimeout(handleSpin, turboMode ? 500 : 1000);
    } else if (autoMode && balance < currentBet) {
      featureMessage.textContent =
        "Saldo insuficiente para continuar o Auto Giro.";
      toggleAutoMode(); // Desativa o modo auto
    }
  }

  spinButton.addEventListener("click", () => {
    if (!autoMode) {
      handleSpin();
    }
  });

  betPlusButton.addEventListener("click", () => {
    if (currentBet < maxBet) {
      currentBet += betStep;
      if (currentBet > maxBet) currentBet = maxBet;
      updateDisplays();
    }
  });

  betMinusButton.addEventListener("click", () => {
    if (currentBet > minBet) {
      currentBet -= betStep;
      if (currentBet < minBet) currentBet = minBet;
      updateDisplays();
    }
  });

  turboButton.addEventListener("click", () => {
    turboMode = !turboMode;
    turboButton.textContent = turboMode ? "Turbo ON" : "Turbo OFF";
    turboButton.style.backgroundColor = turboMode ? "#27ae60" : "#e67e22";
    turboButton.style.fontSize = "0.8em";
    featureMessage.style.opacity = 1;
    featureMessage.textContent = `Modo Turbo ${
      turboMode ? "ativado" : "desativado"
    }`;
  });

  function toggleAutoMode() {
    autoMode = !autoMode;
    if (autoMode) {
      autoButton.style.opacity = "1";
      autoButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
      featureMessage.textContent = "Modo Auto Ativado";
      spinButton.disabled = true;
      betPlusButton.disabled = true;
      betMinusButton.disabled = true;
      // Turbo pode ser alterado durante o auto
      handleSpin();
    } else {
      autoButton.style.opacity = "0.7";
      autoButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
      featureMessage.textContent = "Modo Auto Desativado";
      clearTimeout(autoSpinInterval);
      spinButton.disabled = false;
      betPlusButton.disabled = false;
      betMinusButton.disabled = false;
      turboButton.disabled = false; // Garante que o botão turbo seja reabilitado
    }
  }

  function showModal(prize) {
    if (autoMode) {
      toggleAutoMode();
    }

    let count = 1;
    let finalPrize = 1;
    const modal = document.getElementById("modal-prize");
    const message = document.getElementById("prize-amount");
    const closeButton = document.getElementById("modal-button");
    const imgPrize = document.getElementById("img-prize");

    modal.style.display = "flex";
    modal.classList.add("bright");
    message.classList.add("shake");

    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
      message.textContent = "";
      modal.classList.remove("bright");
      imgPrize.src = "";
    });

    const intervalId = setInterval(() => {
      count++;
      if (count == 1 && count <= prize) {
        modal.classList.remove("explode");
      }
      if (count == 2 && count <= prize) {
        imgPrize.src = "images/prize-1.webp";
        modal.classList.add("explode");
      }
      if (count == 45 && count <= prize) {
        modal.classList.remove("explode");
      }
      if (count == 50 && count <= prize) {
        imgPrize.src = "images/prize-2.webp";
        modal.classList.add("explode");
      }
      if (count == 95 && count <= prize) {
        modal.classList.remove("explode");
      }
      if (count == 100 && count <= prize) {
        imgPrize.src = "images/prize-3.webp";
        modal.classList.add("explode");
      }
      console.log("Count: " + count);
      finalPrize++;
      message.textContent = "R$ " + finalPrize.toFixed(2);

      if (finalPrize >= prize) {
        closeButton.style.opacity = "1";
        message.classList.remove("shake");
        message.classList.add("pulse");
        clearInterval(intervalId);
      }
    }, 50);
  }

  autoButton.addEventListener("click", toggleAutoMode);

  populateReels();
  updateDisplays();
  turboButton.style.opacity = "0.7";
  autoButton.style.opacity = "0.7";
});
