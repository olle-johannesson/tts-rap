import "./styles.css";
// import EasySpeech from 'easy-speech'
import { syllable } from "syllable";
import loopUrl from 'url:./drum-loop-bpm-91.wav'
import { group, rndChunk } from "./grouping";
import { getNormallyDistributedNumber } from "./rnd";

let audioContext
let mainGain
let beatSource

let synth;
let voice

const syllebleRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
const spRegex = /\w+(?![^a-zA-Z])/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const intiAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
    mainGain = audioContext.createGain()
    mainGain.gain.setValueAtTime(1, 0)
    mainGain.connect(audioContext.destination)
  }
}

const say = async (word = "", numberOfSyllablesInWord = 1, pitch = 1) => {
  const part = numberOfSyllablesInWord > 1 ? spRegex.exec(word)?.[0] : word
  if (!synth || !part) {
    return;
  }
  let utterance = new SpeechSynthesisUtterance(part);
  //voice = synth.getVoices().find(({ lang }) => lang === "en-US");
  voice = synth.getVoices().find(({ name }) => name === "Ralph");
  utterance.voice = voice;
  if (numberOfSyllablesInWord >= 2) {
    //utterance.pitch = Math.abs(getNormallyDistributedNumber(1, 0.6))
    utterance.rate = 0.8 + numberOfSyllablesInWord * 0.2;
  } else {
    //utterance.pitch = getNormallyDistributedNumber(1, 0.3)
    utterance.rate = 1
  }
  utterance.pitch = pitch
  //utterance.rate = 0.8 + numberOfSyllablesInWord * 0.3;
    // Always set the utterance language to the utterance voice's language
    // to prevent unspecified behavior.  
  utterance.lang = utterance.voice.lang
  synth.speak(utterance);
};

const lightLamp = index => {
  const lamp = [...document.querySelectorAll(".lamp")];
  lamp.forEach((l) => l.classList.remove("current"));
  lamp[index]?.classList?.add?.("current");
}

const playBeat = async () => {
  const response = await fetch(loopUrl)
  const soundBuffer = await response.arrayBuffer()
  const beatBuffer = await audioContext.decodeAudioData(soundBuffer)
  beatSource = audioContext.createBufferSource(beatBuffer)
  beatSource.buffer = beatBuffer
  beatSource.connect(mainGain)
  beatSource.loop = true
  beatSource.start()
}

const rap = async () => {
  // await EasySpeech.init({ maxTimeout: 5000, interval: 250 })
  const textNode = document.getElementById("text");
  const text = textNode.innerText;
  const quarterBeat = (bpm) => (1000 / bpm) * 60;
  const halfBeat = (bpm) => quarterBeat(bpm) * 2
  const eigthBeat = (bpm) => quarterBeat(bpm) / 2

  btn.disabled = true
  const syllabledwords = text.split(/([,.])/).map(n => n.split(' ')).flat().filter(Boolean).map(word => syllable(word) > 1
    ? [...word.matchAll(syllebleRegex)].map(n => n[0])
    : [word]
  )//.flat().map(n => n.split('').filter(n => /\w/.test(n)).join(''))
  const words = syllabledwords //rndChunk(syllabledwords)
  console.log(words)
  intiAudioContext()
  playBeat()    
  for (let [index, word] of words.entries()) {
    //synth.stop()
    lightLamp(index % 4)
    const beatTime = quarterBeat(91);
    
    // word.forEach((syllable, index) => setTimeout(() => say(syllable, word.length), (index + 1) * (beatTime / word.length)))
    let pitch = Math.abs(getNormallyDistributedNumber(1, 0.3))
    for (let syllable of word) {
      say(syllable, word.length, pitch)
      await sleep(beatTime / word.length)
    }
  }
  btn.disabled = false
  beatSource.stop()
}

const init = () => {
  synth = window.speechSynthesis
  const btn = document.getElementById("btn");  
  btn.addEventListener("click", rap);
};

window.onload = init;

