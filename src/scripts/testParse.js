import {syllable} from "syllable";
import {syllebleRegex} from "./regexes";

export const COMMA = ','

export const DOT = '.'

export const SPACE = ' '

export const capture = chars => new RegExp(`([${chars.join('')}])`)

export const retainCommaAndDot = capture([COMMA, DOT])

export const splitOnSpace = text => text.split(SPACE)

export const noFalsyValues = value => Boolean(value)

export const replaceWithSpace = char => text => [text].flat().map(t => t.replaceAll(char, SPACE))

export const replaceDotsWithSpace = replaceWithSpace(DOT)

export const replaceCommaWithSpace = replaceWithSpace(COMMA)

export const splitOnWordsButRetainSeparators = text => text
    .split(retainCommaAndDot)
    .map(splitOnSpace)
    .flat()
    .filter(noFalsyValues)

export const replaceSeparatorsWithSpace = text => replaceCommaWithSpace(replaceDotsWithSpace(text))

export const breakUpSyllables = (text, singleSyllableWordsAsArrays = true) => [text].flat().map(word => syllable(word) > 1
    ? [...word.matchAll(syllebleRegex)].map(n => n[0])
    : singleSyllableWordsAsArrays
        ? [word]
        : word)