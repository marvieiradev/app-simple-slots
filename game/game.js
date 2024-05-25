let slot_screen = document.getElementById("slot_screen");
let reel = document.getElementsByClassName("reel");
let reels = document.getElementsByClassName("reels");
let btn_stop = document.getElementsByClassName("btn_stop");
let btn_start = document.getElementById("btn_start");

let sec = 100;              //velocidade de rotação da bobina do slot(execuções por segundo)
let stopReelFlag = [];      //imagem quando o rolo parar
let reelCounts = [];        //qual imagem posicionar
let slotFrameHeight;        //tamanho do quadro
let slotReelsHeight;        //tamanho geral do rolo/reel (imagem)
let slotReelItemHeight;     //tamanho de um rolo/reel (imagem)
let slotReelStartHeight;    //valor inicial da imagem

//inicialização
let slot = {
    init: function () {
        stopReelFlag[0] = stopReelFlag[1] = stopReelFlag[2] = false;
        reelCounts[0] = reelCounts[1] = reelCounts[2] = 0;
    },
    //evento de click
    start: function () {
        slot.init();
        for (let i = 0; i < 3; i++) {
            slot.animation(i);
        }
    },

    //evento de click no botão parar
    stop: function (i) {
        stopReelFlag[i] = true
        if (stopReelFlag[0] && stopReelFlag[1] && stopReelFlag[2]) {
            btn_start.removeAttribute("disabled");
        }
        console.log("aaaaa");
    },

    //seta a primeira posição
    resetLocationInfo: function () {
        slotFrameHeight = slot_screen.offsetHeight;
        slotReelsHeight = reels[0].offsetHeight;
        slotReelItemHeight = reel[0].offsetHeight;
        slotReelStartHeight = slotReelsHeight;
        slotReelStartHeight += slotFrameHeight - (slotFrameHeight / 2) + slotReelsHeight * 3 / 2;
        for (let i = 0; i < reels > length; i++) {
            reels[i].style.top = string(slotReelStartHeight) + 'px';
        }
    },

    //mover os slots
    animation: function (index) {
        if (reelCounts[index] >= 8) {
            reelCounts[index] = 0;
        }
        $(".reels").eq(index).animate({
            "top": slotReelStartHeight + (reelCounts[index] * slotReelItemHeight)
        },
            {
                duration: sec,
                easing: "linear",
                complete: function () {
                    if (stopReelFlag[index]) {
                        return;
                    }
                    reelCounts[index]++;
                    slot.animation(index);
                }
            });
    },
};

window.onload = function () {
    slot.init();
    slot.resetLocationInfo();
    btn_start.addEventListener("click", function (e) {
        e.target.setAttribute("disabled", true);
        slot.start();
        for (let i = 0; i < btn_stop.length; i++) {
            btn_stop[i].removeAttribute("disabled");
        }
    });
    for (let i = 0; i < btn_stop.length; i++) {
        btn_stop[i].addEventListener("click", function (e) {
            slot.stop(e.target.getAttribute("data-val"));
        })
    }
};






