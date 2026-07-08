let audioCtx;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesizes a short "glass pebble" clink: a sharp noise tick (the hit)
// plus a few high, quickly-decaying sine tones (the ring).
function playGlassClink() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const tickLength = 0.1;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * tickLength, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const tick = ctx.createBufferSource();
  tick.buffer = buffer;

  const tickFilter = ctx.createBiquadFilter();
  tickFilter.type = "highpass";
  tickFilter.frequency.value = 3500;

  const tickGain = ctx.createGain();
  tickGain.gain.setValueAtTime(0.25, now);
  tickGain.gain.exponentialRampToValueAtTime(0.001, now + tickLength);

  tick.connect(tickFilter).connect(tickGain).connect(ctx.destination);
  tick.start(now);

  [2600, 3900, 5200].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq + (Math.random() * 40 - 20);

    const peak = 0.12 / (i + 1);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3 - i * 0.04);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  });
}

document.querySelectorAll(".pebble-flip").forEach((el) => {
  el.addEventListener("mouseenter", playGlassClink);
});
