const csv2json = require('csvjson-csv2json')
const axios = require('axios').default
const jsonfile = require('jsonfile')

const fileLocation = "./src/constant/tokensInfo.json"
const link = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEKoa3CN8wYFiDCOHbwrHLMIKo3BaI47GhjEX-XRtbnGVgePgkMyqMZGXaMN8u4-kUC36HnSAIi2tK/pub?gid=0&single=true&output=csv"


execute().then(()=> console.log("Wrote to " + fileLocation))

async function execute () {
    var csv  = await getLink()
    var json = convertAndTrim(csv)
    var writeToFile = await writeFile(json)
    return writeToFile
}

// gets data from link above
async function getLink () { 
    return await axios.get(link).then((r)=>{ return r.data })
}

// writes to file location
async function writeFile (json) { 
    return await jsonfile.writeFile(fileLocation, json, { spaces: 2 }) 
}

function convertAndTrim(csv){
    var json = csv2json(csv, {parseNumbers: true, hash: true});
    console.log(json)

    // trim json
    Object.values(json).forEach((info) => {
        Object.keys(info).forEach((innerKey) => {
            if (info[innerKey] === "" ) {
                delete info[innerKey]
            }
        })
    })
    return json
}
