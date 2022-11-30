import "./vitestyle.css";
import EasySpeech from 'easy-speech'
import {syllable} from "syllable";
import loopUrl from 'url:./drum-loop-bpm-91.wav'
import {getNormallyDistributedNumber} from "./rnd";
import orig from 'url:./me.jpeg'
import rapOpen from 'url:./me_rap_open.png'
import rapClosed from 'url:./me_rap_closed.png'

const onFail = () => {
    // TODO: what to do here?
    window.history.back()
}

const speech = EasySpeech.detect()
if (!(speech.speechSynthesis && speech.speechSynthesisUtterance && speech.speechSynthesisEvent)) {
    onFail()
}

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
    getProfilePic().src = newImgUrl
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
    EasySpeech.onstart = setRapOpen
    EasySpeech.onend = setRapClosed
    EasySpeech.speak({
        pitch,
        text: word,
        rate: numberOfSyllablesInWord >= 2 ? 0.8 + numberOfSyllablesInWord * 0.2 : 1,
    })
    // let utterance = new SpeechSynthesisUtterance(part);
    // utterance.voice = voice;
    // utterance.rate = numberOfSyllablesInWord >= 2 ? 0.8 + numberOfSyllablesInWord * 0.2 : 1
    // utterance.pitch = pitch
    // utterance.lang = utterance.voice.lang
    // utterance.addEventListener('start', setRapOpen)
    // utterance.addEventListener('end', setRapClosed)
    //
    // synth.speak(utterance);
};

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
    btn.innerHTML = "STOP"
    btn.addEventListener('click', () => stop(btn), {once: true})
    voice = synth.getVoices().filter(v => v.lang === 'en-US').filter(() => Math.random() < 0.5)[0]

    const textNode = document.getElementById("text");
    const text = textNode.innerText;
    const quarterBeat = (bpm) => (1000 / bpm) * 60;
    const syllabledwords = text
        .split(/([,.])/)
        .map(n => n.split(' '))
        .flat()
        .filter(Boolean)
        .map(word => syllable(word) > 1
            ? [...word.matchAll(syllebleRegex)].map(n => n[0])
            : [word]
    )//.flat().map(n => n.split('').filter(n => /\w/.test(n)).join(''))
    const words = syllabledwords //rndChunk(syllabledwords)
    console.log(words)
    intiAudioContext()
    playBeat()
    for (let word of words) {
        const beatTime = quarterBeat(91);
        let pitch = 1 //Math.abs(getNormallyDistributedNumber(1, 0.3))
        for (let syllable of word) {
            say(syllable, word.length, pitch)
            await sleep(beatTime / word.length)
        }
    }
    stop(btn)
}

const stop = (btn) => {
    restoreProfilePic()
    btn.disabled = false
    beatSource.stop()
    btn.innerHTML = "klik me"
    btn.addEventListener('click', () => rap(btn), {once: true})
}

const loadApp = () => {
    synth = window.speechSynthesis
    const btn = document.getElementById("btn");
    btn.addEventListener("click", () => rap(btn), {once: true});
}

window.onload = () => {
    EasySpeech.init({maxTimeout: 5000, interval: 250})
        .then(loadApp)
        .catch(onFail)
};

