import { getNormallyDistributedNumber } from "./rnd"

export let group = (a, decider = () => true) => {
  let b = []
  let tmp = []
  for (let i = 0, j = 0; i < a.length - 1; i++) {
    if (a[i].length === 1 && decider(a[i], i)) {
      tmp.push(a[i][0])
    } else {
      b[j++] = tmp
      b[j++] = a[i]
      tmp = []
    }
  }
  return b.filter(k => k.length)
}

export let rndChunk = (input) => {
  let rnd = () => Math.abs(Math.floor(getNormallyDistributedNumber(1,0.5))) + 1
  let output = [], i = 0
  while(i < input.length) {
    let chunkSize = 1, chunk = input[i]
    if (!Array.isArray(chunk)) {
      chunkSize = rnd() + 1
      do {
        chunkSize -= 1
        chunk = input.slice(i, i + chunkSize)
      } while(chunk.some(Array.isArray))
    }
    output.push(chunk)
    i += chunkSize
  }
  return output.filter(Boolean)
}
