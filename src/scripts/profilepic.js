import orig from '../assets/me.jpeg'
import rapOpen from '../assets/me_rap_open.png'
import rapClosed from '../assets/me_rap_closed.png'

const jsCache = new Map()
const jsCached = (fn, url) => {
    if (jsCache.has(url)) {
        fn(jsCache.get(url))
    } else {
        fetch(url)
            .then(response => response.blob())
            .then(URL.createObjectURL)
            .then(ourl => jsCache.set(url, ourl))
            .then(() => jsCached(fn, url))
    }
}

export const getProfilePic = () => document.querySelector('#profile-picture')

export const changeTo = (newImgUrl) => getProfilePic().src = newImgUrl

export const openMouth = () => jsCached(changeTo, rapOpen)

export const closeMouth = () => jsCached(changeTo, rapClosed)

export const restore = () => jsCached(changeTo, orig)
