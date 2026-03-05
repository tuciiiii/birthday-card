// Birthday card interactions (3-file version)
// Screens
const screens = {
  envelope: document.getElementById("screen-envelope"),
  letter: document.getElementById("screen-letter"),
  final: document.getElementById("screen-final"),
};

// Buttons / elements
const envelopeBtn = document.getElementById("envelopeBtn");
const celebrateBtn = document.getElementById("celebrateBtn");
const backBtn = document.getElementById("backBtn");
const replayBtn = document.getElementById("replayBtn");
const copyBtn = document.getElementById("copyBtn");
const copyBtn2 = document.getElementById("copyBtn2");

const toast = document.getElementById("toast");
const messageText = document.getElementById("messageText");
const fxLayer = document.getElementById("confetti"); // kept id; now used for hearts
const letterContent = document.querySelector(".letter-content");

let typingTimer = null;

function show(name){
  Object.values(screens).forEach(s => s?.classList.remove("active"));
  screens[name]?.classList.add("active");

  if(toast) toast.textContent = "";

  // Reset when leaving letter
  if(name !== "letter"){
    letterContent?.classList.remove("reveal");
    clearReveals();
    stopType();
  }

  // Clear FX when leaving final
  if(name !== "final" && fxLayer){
    fxLayer.innerHTML = "";
  }
}

function stopType(){
  if(typingTimer){
    clearInterval(typingTimer);
    typingTimer = null;
  }
}

function typeMessage(){
  if(!messageText) return;

  // Capture plain text (keeps line breaks as \n)
  const text = (messageText.innerText || "").replace(/\s+$/g, "");

  stopType();
  messageText.textContent = "";

  let i = 0;
  typingTimer = setInterval(()=>{
    messageText.textContent += text.charAt(i);
    i++;
    if(i >= text.length) stopType();
  }, 18);
}

async function copyMessage(){
  const text = (messageText?.innerText || "").trim();
  try{
    await navigator.clipboard.writeText(text);
    if(toast){
      toast.textContent = "✅ Mesaj kopyalandı!";
      setTimeout(()=> (toast.textContent = ""), 1400);
    }
  }catch{
    if(toast) toast.textContent = "Kopyalama izin vermedi. Mesajı manuel seçip kopyalayabilirsin.";
  }
}

// ---------- Reveal (stagger) ----------
function setupRevealItems(){
  if(!letterContent) return;

  // Mark a curated set of elements for stagger reveal
  const targets = [
    letterContent.querySelector(".chips"),
    letterContent.querySelector(".headline"),
    letterContent.querySelector(".message"),
    letterContent.querySelector(".memories"),
    letterContent.querySelector(".kitty"),
    letterContent.querySelector(".actions"),
    letterContent.querySelector("#toast"),
  ].filter(Boolean);

  targets.forEach((el)=>{
    el.classList.add("reveal-item");
  });
}

function clearReveals(){
  document.querySelectorAll(".reveal-item").forEach(el => {
    el.classList.remove("show");
    el.style.transitionDelay = "";
  });
}

function revealAll(){
  const items = Array.from(document.querySelectorAll(".letter-content .reveal-item"));
  items.forEach((el, idx)=>{
    el.style.transitionDelay = (0.07 + idx * 0.09).toFixed(2) + "s";
    requestAnimationFrame(()=> el.classList.add("show"));
  });
}

// ---------- Envelope -> Letter ----------
function openEnvelope(){
  if(!envelopeBtn) return;

  envelopeBtn.classList.add("open");
  envelopeBtn.setAttribute("aria-disabled","true");
  envelopeBtn.style.pointerEvents = "none";

  // Small "flash" glow on open
  document.body.classList.add("open-flash");
  setTimeout(()=> document.body.classList.remove("open-flash"), 520);

  setTimeout(()=>{
    show("letter");
    // Trigger reveal + typewriter
    setTimeout(()=>{
      letterContent?.classList.add("reveal");
      setupRevealItems();
      revealAll();
      typeMessage();
    }, 40);
  }, 520);
}

function backToEnvelope(){
  show("envelope");
  setTimeout(()=>{
    envelopeBtn?.classList.remove("open");
    envelopeBtn?.removeAttribute("aria-disabled");
    if(envelopeBtn) envelopeBtn.style.pointerEvents = "";
  }, 60);
}

// ---------- Final FX (hearts) ----------
function burstHearts(count = 120){
  if(!fxLayer) return;
  // Don't clear every time so multiple bursts can layer nicely

  const glyphs = ["❤","💖","💗","💞","💕"];
  for(let i=0;i<count;i++){
    const h = document.createElement("div");
    h.className = "heart-piece";
    h.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];

    const size = 14 + Math.random()*18;
    h.style.left = (Math.random()*100) + "vw";
    h.style.top  = (65 + Math.random()*30) + "vh";
    h.style.fontSize = size.toFixed(0) + "px";
    h.style.setProperty("--dur", (2.2 + Math.random()*1.9).toFixed(2) + "s");
    h.style.setProperty("--sway", (0.8 + Math.random()*1.2).toFixed(2) + "s");
    h.style.setProperty("--dx", ((Math.random()*2 - 1) * 18).toFixed(0) + "px");
    h.style.setProperty("--rot", ((Math.random()*2 - 1) * 18).toFixed(0) + "deg");
    h.style.animationDelay = (Math.random()*0.18).toFixed(2) + "s";

    fxLayer.appendChild(h);
    setTimeout(()=> h.remove(), 6500);
  }
}

function heartShow(){
  // One big burst + a couple of smaller follow-up bursts
  if(fxLayer) fxLayer.innerHTML = "";
  // Larger, denser heart show (requested)
  burstHearts(220);
  let rounds = 0;
  const t = setInterval(()=>{
    rounds++;
    burstHearts(140);
    if(rounds >= 3) clearInterval(t);
  }, 520);
}

function celebrate(){
  show("final");
  heartShow();
}

function replay(){
  if(fxLayer) fxLayer.innerHTML = "";
  show("envelope");
  setTimeout(()=>{
    envelopeBtn?.classList.remove("open");
    envelopeBtn?.removeAttribute("aria-disabled");
    if(envelopeBtn) envelopeBtn.style.pointerEvents = "";
  }, 60);
}

// ---------- Events ----------
setupRevealItems();

envelopeBtn?.addEventListener("click", openEnvelope);
envelopeBtn?.addEventListener("keydown", (e)=>{
  if(e.key === "Enter" || e.key === " "){
    e.preventDefault();
    openEnvelope();
  }
});

celebrateBtn?.addEventListener("click", celebrate);
backBtn?.addEventListener("click", backToEnvelope);
replayBtn?.addEventListener("click", replay);

copyBtn?.addEventListener("click", copyMessage);
copyBtn2?.addEventListener("click", copyMessage);

window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape"){
    if(screens.final?.classList.contains("active")) show("letter");
    else if(screens.letter?.classList.contains("active")) show("envelope");
  }
});
