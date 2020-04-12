/**
 * Returns a list of token objects filtered by the type
 */
exports.getList = ({type=null}) => {
  return Object.keys(this.info)
    .reduce((list, key) => {
        if (this.info[key].type != type) { return list }
        list.push(this.info[key])
        return list
    }, [])
}

/**
 * Returns a list filtered by the token type and the field needed
 * example: getData({type:"ctoken",field:"address"}) will return all the ctoken addresses in a list
 */
exports.getDataList = ({type=null, field=null}) => {
  return Object.values(this.info)
  .filter((a) =>  { 
      return type ? a.type == type : true
  })
  .map((a) => {
      return field ? a[field] : a
  })
}


/**
 * @param type
 * @param symbol
 * @param name
 * @param address
 * @param decimal
 * @param factor (optional) collatreal factor, used in ctokens
 */
exports.info = require("./tokensInfo.json") 