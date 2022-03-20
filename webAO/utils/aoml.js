import request from "../services/request"


const aomlParser = (text) => {
    let parsed = {}
    let currentHeader = ''
    for (const line of text.split(/\r?\n/)) {
        if (line === '') {
            currentHeader = ''
            continue;
        }
        const content = line.split(' = ')
        const contentName = content[0]
        const contentValue = content[1]
        if (currentHeader === '') {
            currentHeader = contentName
            parsed[currentHeader] = {
                color: contentValue
            }
        } else {
            const contentKey = contentName.split('_')[1]
            parsed[currentHeader][contentKey] = contentValue
        }
    }
    return parsed
}




const mlConfig = (AO_HOST) => {
    const defaultUrl = `${AO_HOST}themes/default/chat_config.ini`
    let aomlParsed = {}

    request(defaultUrl).then((data) => {
            aomlParsed = aomlParser(data)
        }
    );

    const createIdentifiers = () => {
        const identifiers = new Map()
        for (const [ruleName, value] of Object.entries(aomlParsed)) {
            if (identifiers.has(value.start)) {
                throw new Error()
            } 
            else if (value.start) {
                identifiers.set(value.start, value.end)
            }
        }
        return identifiers
    }
    const colorIdentifiers = () => {
        let colorIdentifier = {}
        for (const [ruleName, value] of Object.entries(aomlParsed)) {
            colorIdentifier[value.start] = value.color
        }
        return colorIdentifier
    }
    const applyMarkdown = (text) => {
        const identifiers = createIdentifiers(aomlParsed)
        const startIdentifiers = new Set(identifiers.keys())
        const colorIdentifier = colorIdentifiers()
        const identifierClosingStack = []
        const colorStack = [[255, 255, 255]]
        // each value in output will be an html element
        let output = []
        for (const letter of text) {
            let currentSelector = document.createElement('span')

            const lastItem = identifierClosingStack.length
            const closingToLookFor = identifierClosingStack[lastItem-1]
            if (letter === closingToLookFor) {
                identifierClosingStack.pop()
                colorStack.pop()
            } 
            else if (startIdentifiers.has(letter)) {
                identifierClosingStack.push(identifiers.get(letter))
                const colors = colorIdentifier[letter].split(',')
                const r = colors[0]
                const g = colors[1]
                const b = colors[2]
                colorStack.push([r,g,b])
            } else {
                currentSelector.innerHTML = letter
            }
            const r = colorStack[colorStack.length-1][0]
            const g = colorStack[colorStack.length-1][1]
            const b = colorStack[colorStack.length-1][2]
            const currentColor = `color: rgb(${r},${g},${b});`
            currentSelector.setAttribute('style', currentColor)
            output.push(currentSelector)
        }
        return output
    }
    return {
        applyMarkdown
    }
}

export default mlConfig