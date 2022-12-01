import orig from './me.jpeg'
import rapOpen from './me_rap_open.png'
import rapClosed from './me_rap_closed.png'

export const getProfilePic = () => document.querySelector('#profile-picture')

export const changeTo = (newImgUrl) => getProfilePic().src = newImgUrl

export const openMouth = () => changeTo(rapOpen)

export const closeMouth = () => changeTo(rapClosed)

export const restore = () => changeTo(orig)
