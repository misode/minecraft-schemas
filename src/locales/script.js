const name = 'en'

const fs = require('fs')
const path = require('path')
const enJson = require('./en.json')
const input = require(`./${name}.json`)
const output = {}

/**
 * @type {string[]}
 */
const removedKeys = []

for (const key in enJson) {
    if (enJson.hasOwnProperty(key)) {
        const value = enJson[key]
        if (value === '') {
            removedKeys.push(key)
        }
    }
}
for (const key of Object.keys(input).filter(v => !removedKeys.includes(v)).sort()) {
    if (input.hasOwnProperty(key)) {
        output[key] = input[key]
    }
}

fs.writeFileSync(path.join(__dirname, `${name}.json`), JSON.stringify(output, undefined, 2) + '\n')
