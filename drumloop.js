import loopUrl from 'url:./drum-loop-bpm-91.wav'

let audioContext
let mainGain
let beatSource

export const init = () => {
    if (!audioContext) {
        audioContext = new AudioContext()
        mainGain = audioContext.createGain()
        mainGain.gain.setValueAtTime(1, 0)
        mainGain.connect(audioContext.destination)
    }
}

export const play = async () => {
    const response = await fetch(loopUrl)
    const soundBuffer = await response.arrayBuffer()
    const beatBuffer = await audioContext.decodeAudioData(soundBuffer)
    beatSource = audioContext.createBufferSource(beatBuffer)
    beatSource.buffer = beatBuffer
    beatSource.connect(mainGain)
    beatSource.loop = true
    beatSource.start()
}

export const stop = () => {
    beatSource.stop()
}