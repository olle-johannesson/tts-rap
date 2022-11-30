import "./styles.css";
// import EasySpeech from 'easy-speech'
import { syllable } from "syllable";
import loopUrl from 'url:./drum-loop-bpm-91.wav'
import { getNormallyDistributedNumber } from "./rnd";
import orig from 'url:./me.jpeg'
import rapOpen from 'url:./me_rap_open.png'
import rapClosed from 'url:./me_rap_closed.png'

let audioContext
let mainGain
let beatSource

let synth;
let voice

const syllebleRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
const spRegex = /\w+(?![^a-zA-Z])/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getProfilePic = () => document.querySelector('#profile-picture')

const changeImage = (newImgUrl) => {
  let img = getProfilePic()
  img.src = newImgUrl
}

const setRapOpen = () => {
  changeImage(rapOpen)
}

const setRapClosed = () => {
  changeImage(rapClosed)
}

const restoreProfilePic = () => {
  changeImage(orig)
}

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
  //voice = synth.getVoices().find(({ name }) => name === "Eddy (English (US))");
  let utterance = new SpeechSynthesisUtterance(part);
  utterance.voice = voice;
  utterance.rate = numberOfSyllablesInWord >= 2 ? 0.8 + numberOfSyllablesInWord * 0.2 : 1
  utterance.pitch = pitch
  utterance.lang = utterance.voice.lang
  utterance.addEventListener('start', setRapOpen)
  utterance.addEventListener('end', setRapClosed)

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

const rap = async (btn) => {
  setRapClosed()
  console.log(synth.getVoices().filter(v => v.lang === 'en-US').map(v => v.name))
  voice = synth.getVoices().filter(v => v.lang === 'en-US').filter(() => Math.random() < 0.5)[0]

  // await EasySpeech.init({ maxTimeout: 5000, interval: 250 })
  const textNode = document.getElementById("text");
  const text = textNode.innerText;
  const quarterBeat = (bpm) => (1000 / bpm) * 60;
  // const halfBeat = (bpm) => quarterBeat(bpm) * 2
  // const eigthBeat = (bpm) => quarterBeat(bpm) / 2

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
    lightLamp(index % 4)
    const beatTime = quarterBeat(91);
    let pitch = Math.abs(getNormallyDistributedNumber(1, 0.3))
    for (let syllable of word) {
      say(syllable, word.length, pitch)
      await sleep(beatTime / word.length)
    }
  }
  btn.disabled = false
  beatSource.stop()
  restoreProfilePic()
}

const init = () => {
  synth = window.speechSynthesis
  const btn = document.getElementById("btn");  
  btn.addEventListener("click", () => rap(btn));
};

window.onload = init;

