import "../styles/vitestyle.css"
import EasySpeech from 'easy-speech'
import * as drums from './drumloop'
import * as profilePic from './profilepic'
import {breakUpSyllables, replaceSeparatorsWithSpace, splitOnWordsButRetainSeparators} from "./testParse"
import {spRegex} from "./regexes"


const onFail = () => {
    // TODO: what to do here?
    window.history.back()
}

const speech = EasySpeech.detect()
if (!(speech.speechSynthesis && speech.speechSynthesisUtterance && speech.speechSynthesisEvent)) {
    onFail()
}

const ease = x => x < 3 ? ((1)/(2))+((Math.sin(((Math.PI)/(2)) * x - Math.PI))/(2)) : 1

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const say = async (word = "", numberOfSyllablesInWord = 1, pitch = 1) => {
    const part = numberOfSyllablesInWord > 1
        ? spRegex.exec(word)?.[0]
        : word

    EasySpeech.speak({
        pitch,
        text: part,
        rate: 1 + ease(numberOfSyllablesInWord), // numberOfSyllablesInWord >= 2 ? 0.8 + numberOfSyllablesInWord * 0.2 : 1,
        start: profilePic.openMouth,
        end: profilePic.closeMouth
    })
}

const rap = async (btn) => {
    btn.innerHTML = "STOP"
    btn.addEventListener('click', () => stop(btn), {once: true})
    const text = document.getElementById("text").innerText
    const quarterBeat = (bpm) => (1000 / bpm) * 60
    const words = breakUpSyllables(replaceSeparatorsWithSpace(splitOnWordsButRetainSeparators(text))) //rndChunk(syllabledwords)
    drums.init()
    drums.play()
    for (let word of words) {
        const beatTime = quarterBeat(91)
        let pitch = 1 //Math.abs(getNormallyDistributedNumber(1, 0.3))
        for (let syllable of word) {
            say(syllable, word.length, pitch)
            await sleep(beatTime / word.length)
        }
    }
    stop(btn)
}

const stop = (btn) => {
    profilePic.restore()
    btn.disabled = false
    drums.stop()
    btn.innerHTML = "Click me"
    btn.addEventListener('click', () => rap(btn), {once: true})
}

const loadApp = () => {
    const btn = document.getElementById("btn")
    btn.addEventListener("click", () => rap(btn), {once: true})
}

window.onload = () => {
    EasySpeech.init({maxTimeout: 5000, interval: 250})
        .then(loadApp)
        .catch(onFail)
}

