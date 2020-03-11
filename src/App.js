import React from "react";

import "./App.css";

const getNoiseGeneratorNode = audioContext => {
  const modulator = new OscillatorNode(audioContext);
  const modGain = new GainNode(audioContext);
  const noiseGeneratorNode = new AudioWorkletNode(
    audioContext,
    "noise-generator"
  );
  const paramAmp = noiseGeneratorNode.parameters.get("amplitude");

  noiseGeneratorNode.connect(audioContext.destination);
  modulator.connect(modGain).connect(paramAmp);
  modulator.frequency.value = 0.5;
  modGain.gain.value = 0.75;
  modulator.start();

  return noiseGeneratorNode;
};

function App() {
  const [hasToLoadModule, setLoadModule] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const audioContextRef = React.useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const nodeRef = React.useRef(null);

  async function loadModule() {
    if (audioContextRef.current.audioWorklet) {
      await audioContextRef.current.audioWorklet.addModule(
        `worklet/noise-gen.js`
      );
    } else {
      await import("audioworklet-polyfill");
      await audioContextRef.current.audioWorklet.addModule(
        `worklet/noise-gen.js`
      );
    }

    setLoadModule(false);
  }

  function toggleNoiseGen() {
    if (isPlaying) {
      nodeRef.current.port.postMessage(false);
    } else {
      nodeRef.current = getNoiseGeneratorNode(audioContextRef.current);
      nodeRef.current.port.postMessage(true);
    }

    setIsPlaying(isPlaying => !isPlaying);
  }

  if (!audioContextRef.current) {
    return <div>Audio context not supported!</div>;
  }

  return (
    <div className="App">
      {hasToLoadModule ? (
        <button onClick={loadModule}>Load noise gen</button>
      ) : (
        "module loaded"
      )}
      {!hasToLoadModule && (
        <button onClick={toggleNoiseGen}>{isPlaying ? "STOP" : "START"}</button>
      )}
    </div>
  );
}

export default App;
