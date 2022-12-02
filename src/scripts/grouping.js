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

export let rndChunk = (a) => {
  let rnd = () => Math.abs(Math.floor(getNormallyDistributedNumber(1,0.5))) + 1
  let b = []
  let i = 0
  while(i < a.length) {
    let n = 1,
        t = a[i]
    if (!Array.isArray(t)) {
      do {
        n = rnd()
        t = a.slice(i, i + n)
      } while(t.some(Array.isArray))
    }
    b.push(t)
    i += n
  }
  return b.filter(Boolean)
}
