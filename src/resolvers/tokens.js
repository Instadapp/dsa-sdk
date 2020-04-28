/**
 * Returns token amount in wei.
 * @param {Number | String} amount - Amount to convert.
 * @param {String} tokenName - Token Symbol.
 * @returns {String} Amount in bigNumInString format.
 */
exports.fromDecimal = (amount, tokenName) => {
  if (Object.keys(this.tokens.info).indexOf(tokenName.toLowerCase()) == -1) throw new Error("'token' symbol not found.");
  var token = this.tokens.info[tokenName.toLowerCase()];
  return this.bigNumInString((Number(amount) * 10 ** token.decimals).toFixed(0));
}

/**
 * Returns token amount in decimal.
 * @param {Number | String} amount - Amount to convert.
 * @param {String} tokenName - Token Symbol.
 * @returns {Number} Amount in decimal.
 */
exports.toDecimal = (amount, tokenName) => {
  if (Object.keys(this.tokens.info).indexOf(tokenName.toLowerCase()) == -1) throw new Error("'token' symbol not found.");
  var token = this.tokens.info[tokenName.toLowerCase()];
  return Number(amount) / 10 ** token.decimals;
}

/**
 * Returns all tokens of similar type.
 * if type == "all" then returns whole tokens list.
 */
exports.getTokenByType = (type) => {
  var tokens = this.info;
  var _tokens = {};
  if (type == "all") {
    _tokens = tokens;
  } else {
    Object.keys(tokens).forEach((key, i) => {
      if (tokens[key].type == type) _tokens[key] = tokens[key];
    });
  }
  return _tokens;
};

/**
 * Returns token mapping with specific field in it.
 * @param {String} field - if field is address then below
 * eg:- {eth: {symbol: "ETH", address: "0x"}} => {eth: "0x"}
 * @returns {JSON}
 */
exports.getTokensField = (field, tokens) => {
  if (!tokens) tokens = this.info;
  var _field = {};
  Object.keys(tokens).forEach((key, i) => {
    _field[key] = tokens[key][field];
  });
  return _field;
};

/**
 * Returns a list of token objects filtered by the type
 */
exports.getList = ({ type = null }) => {
  return Object.keys(this.info).reduce((list, key) => {
    if (this.info[key].type != type) {
      return list;
    }
    list.push(this.info[key]);
    return list;
  }, []);
};

/**
 * Returns a list filtered by the token type and the field needed
 * example: getData({type:"ctoken",field:"address"}) will return all the ctoken addresses in a list
 */
exports.getDataList = ({ type = null, field = null }) => {
  return Object.values(this.info)
    .filter((a) => {
      return type ? a.type == type : true;
    })
    .map((a) => {
      return field ? a[field] : a;
    });
};

/**
 * @param type
 * @param symbol
 * @param name
 * @param address
 * @param decimal
 * @param factor (optional) collateral factor, used in ctokens
 * @param root (optional) underlying token, used in ctokens
 */
exports.info = require("../constant/tokensInfo.json");
