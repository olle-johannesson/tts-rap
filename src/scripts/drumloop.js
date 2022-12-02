import loopUrl from '../assets/drum-loop-bpm-91.mp4'

let audioContext
let mainGain
let beatSource

const init = async () => {
    if (!audioContext) {
        audioContext = new AudioContext()
        mainGain = audioContext.createGain()
        mainGain.gain.setValueAtTime(1, 0)
        mainGain.connect(audioContext.destination)
    }
}

const withAudio = fn => (...args) => {
    init().then(() => fn(...args))
}

export const play = withAudio(async (onEnded) => {
    const response = await fetch(loopUrl)
    const soundBuffer = await response.arrayBuffer()
    const beatBuffer = await audioContext.decodeAudioData(soundBuffer)
    beatSource = audioContext.createBufferSource(beatBuffer)
    beatSource.buffer = beatBuffer
    beatSource.connect(mainGain)
    beatSource.loop = true
    beatSource.onended = onEnded
    beatSource.start()
})

export const stop = withAudio(() => {
    beatSource?.stop()
})
