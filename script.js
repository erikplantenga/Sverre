const ACCESS_CODE = "sverre";
const STORAGE_KEY = "sverre-wintersport-unlocked";

const gate = document.getElementById("passwordGate");
const app = document.getElementById("app");
const accessCodeInput = document.getElementById("accessCode");
const unlockButton = document.getElementById("unlockButton");
const gateMessage = document.getElementById("gateMessage");

const mediaFrame = document.getElementById("mediaFrame");
const captionEl = document.getElementById("caption");
const counterEl = document.getElementById("counter");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const playPauseButton = document.getElementById("playPauseButton");
const muteButton = document.getElementById("muteButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const syncButton = document.getElementById("syncButton");

let slides = [];
let activeIndex = 0;
let isPlaying = true;
let isMuted = false;
let currentVideo = null;
let touchStartX = 0;
let touchEndX = 0;
let isPseudoFullscreen = false;

function setUnlocked(unlocked) {
  if (unlocked) {
    localStorage.setItem(STORAGE_KEY, "1");
    gate.classList.remove("gate--visible");
    app.classList.remove("app--hidden");
    accessCodeInput.value = "";
    gateMessage.textContent = "";
  } else {
    localStorage.removeItem(STORAGE_KEY);
    gate.classList.add("gate--visible");
    app.classList.add("app--hidden");
  }
}

function tryUnlock() {
  const value = accessCodeInput.value.trim();
  if (value === ACCESS_CODE) {
    setUnlocked(true);
    renderSlide(activeIndex);
  } else {
    gateMessage.textContent = "Code klopt niet, probeer opnieuw.";
  }
}

async function loadSlides() {
  const response = await fetch("./media.json");
  if (!response.ok) {
    throw new Error("Kon media niet laden.");
  }
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("media.json bevat geen slides.");
  }
  slides = data
    .map((item) => ({
      ...item,
      type: normalizeType(item.type, item.src),
    }))
    .filter((item) => item.type && typeof item.src === "string" && item.src.trim());
  if (!slides.length) {
    throw new Error("Geen geldige foto/video items gevonden in media.json.");
  }
}

function normalizeType(type, src) {
  if (type === "image" || type === "video") return type;
  const ext = (src || "").split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  return null;
}

function updateButtons() {
  playPauseButton.textContent = isPlaying ? "Pauze video" : "Play video";
  playPauseButton.disabled = !currentVideo;
  playPauseButton.style.opacity = currentVideo ? "1" : "0.5";
  playPauseButton.style.cursor = currentVideo ? "pointer" : "not-allowed";
  muteButton.textContent = isMuted ? "Geluid aan" : "Geluid uit";
  updateFullscreenButton();
}

function isFullscreen() {
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

function updateFullscreenButton() {
  const inFullscreen = isFullscreen() || isPseudoFullscreen;
  fullscreenButton.textContent = inFullscreen ? "Normaal scherm" : "Fullscreen";
}

function renderImage(slide) {
  const img = document.createElement("img");
  img.src = slide.src;
  img.alt = slide.caption || "Wintersport foto";
  img.decoding = "async";
  img.addEventListener("error", () => {
    captionEl.textContent = `Bestand niet gevonden: ${slide.src}`;
  });
  mediaFrame.appendChild(img);
  currentVideo = null;
}

function renderVideo(slide) {
  const video = document.createElement("video");
  video.src = slide.src;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.autoplay = true;
  video.controls = true;
  video.loop = false;
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const startMuted = isTouchDevice ? true : isMuted;
  video.muted = startMuted;
  if (isTouchDevice && !isMuted) {
    isMuted = true;
    updateButtons();
  }
  video.preload = "metadata";
  video.setAttribute("aria-label", slide.caption || "Wintersport video");
  video.addEventListener("ended", () => {
    isPlaying = false;
    updateButtons();
  });
  video.addEventListener("error", () => {
    captionEl.textContent = `Video niet gevonden: ${slide.src}`;
  });
  mediaFrame.appendChild(video);
  currentVideo = video;
  isPlaying = true;
}

function renderSlide(index) {
  if (!slides.length) return;

  activeIndex = (index + slides.length) % slides.length;
  const slide = slides[activeIndex];

  mediaFrame.textContent = "";
  isPlaying = true;

  if (slide.type === "video") {
    renderVideo(slide);
  } else {
    renderImage(slide);
  }

  captionEl.textContent = slide.caption || "";
  counterEl.textContent = `${activeIndex + 1} / ${slides.length}`;
  updateButtons();
}

function goToNext() {
  renderSlide(activeIndex + 1);
}

function goToPrev() {
  renderSlide(activeIndex - 1);
}

function togglePlay() {
  if (!currentVideo) return;
  isPlaying = !isPlaying;
  if (isPlaying) {
    currentVideo.play().catch(() => {});
  } else {
    currentVideo.pause();
  }
  updateButtons();
}

function toggleMute() {
  isMuted = !isMuted;
  if (currentVideo) {
    currentVideo.muted = isMuted;
  }
  updateButtons();
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function requestFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  }
  if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  }
  if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen();
  }
  if (el.msRequestFullscreen) {
    return el.msRequestFullscreen();
  }
  return Promise.reject(new Error("Fullscreen niet ondersteund"));
}

function toggleFullscreen() {
  const fullscreenSupported =
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled;

  if (!fullscreenSupported) {
    isPseudoFullscreen = !isPseudoFullscreen;
    document.body.classList.toggle("pseudo-fullscreen", isPseudoFullscreen);
    updateFullscreenButton();
    return;
  }

  if (isFullscreen()) {
    exitFullscreen();
    return;
  }

  requestFullscreen().catch(() => {
    isPseudoFullscreen = true;
    document.body.classList.add("pseudo-fullscreen");
    updateFullscreenButton();
  });
}

function bindEvents() {
  unlockButton.addEventListener("click", tryUnlock);
  accessCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      tryUnlock();
    }
  });

  prevButton.addEventListener("click", goToPrev);
  nextButton.addEventListener("click", goToNext);
  playPauseButton.addEventListener("click", togglePlay);
  muteButton.addEventListener("click", toggleMute);
  fullscreenButton.addEventListener("click", toggleFullscreen);

  syncButton.addEventListener("click", async () => {
    if (syncButton.disabled) return;
    const origin = location.origin;
    if (origin === "null" || origin.startsWith("file://")) {
      alert("Sync werkt alleen als je de slideshow via de server op je Mac opent (http://[Mac-IP]:3333).");
      return;
    }
    const prevText = syncButton.textContent;
    syncButton.textContent = "Bezig…";
    syncButton.disabled = true;
    try {
      const res = await fetch(`${origin}/sync?code=${encodeURIComponent(ACCESS_CODE)}`);
      const data = await res.json();
      if (data.ok) {
        syncButton.textContent = "Gereed";
        await loadSlides();
        renderSlide(activeIndex);
        setTimeout(() => { syncButton.textContent = prevText; }, 2000);
      } else {
        syncButton.textContent = "Fout";
        alert(data.error || "Sync mislukt");
        syncButton.textContent = prevText;
      }
    } catch (e) {
      syncButton.textContent = "Fout";
      alert("Sync niet bereikbaar. Start op je Mac: node server.mjs en open deze pagina via http://[Mac-IP]:3333");
      syncButton.textContent = prevText;
    }
    syncButton.disabled = false;
  });

  window.addEventListener("keydown", (event) => {
    if (gate.classList.contains("gate--visible")) return;

    if (event.key === "ArrowRight") goToNext();
    if (event.key === "ArrowLeft") goToPrev();
    if (event.key.toLowerCase() === "f") toggleFullscreen();
    if (event.key.toLowerCase() === "m") toggleMute();
    if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    }
  });

  function onFullscreenChange() {
    updateFullscreenButton();
  }
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  document.addEventListener("mozfullscreenchange", onFullscreenChange);
  document.addEventListener("MSFullscreenChange", onFullscreenChange);

  mediaFrame.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  mediaFrame.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 35) return;
    if (delta < 0) goToNext();
    if (delta > 0) goToPrev();
  }, { passive: true });
}

function initSnow() {
  const container = document.getElementById("snow");
  if (!container) return;
  const flakeCount = 55;

  function createFlakes() {
    container.textContent = "";
    for (let i = 0; i < flakeCount; i++) {
      const flake = document.createElement("span");
      flake.className = "snowflake";
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${8 + Math.random() * 10}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.setProperty("--snow-drift", `${(Math.random() - 0.5) * 80}px`);
      flake.style.opacity = 0.5 + Math.random() * 0.5;
      container.appendChild(flake);
    }
  }

  function showSnow() {
    createFlakes();
    container.classList.add("snow--on");
  }

  showSnow();
  setInterval(showSnow, 15000);
}

async function init() {
  bindEvents();
  await loadSlides();
  updateButtons();
  initSnow();

  const unlocked = localStorage.getItem(STORAGE_KEY) === "1";
  setUnlocked(unlocked);
  if (unlocked) {
    renderSlide(0);
  } else {
    accessCodeInput.focus();
  }
}

init().catch((error) => {
  gateMessage.textContent = error instanceof Error ? error.message : "Onbekende fout.";
});
