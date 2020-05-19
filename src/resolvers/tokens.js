module.exports = class Tokens {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    /**
     * @param type
     * @param symbol
     * @param name
     * @param address
     * @param decimal
     * @param factor (optional) collateral factor, used in ctokens
     * @param root (optional) underlying token, used in ctokens
     */
    this.info = require("../constant/tokensInfo.json");
    this.web3 = _dsa.web3;
    this.math = _dsa.math;
  }

  /**
   * Returns token amount in wei.
   * @param {Number | String} amount - Amount to convert.
   * @param {String} tokenName - Token Symbol.
   * @returns {String} Amount in bigNumInString format.
   */
  fromDecimal(amount, tokenName) {
    if (Object.keys(this.info).indexOf(tokenName.toLowerCase()) == -1)
      throw new Error("'token' symbol not found.");
    var token = this.info[tokenName.toLowerCase()];
    return this.math.bigNumInString(
      (Number(amount) * 10 ** token.decimals).toFixed(0)
    );
  }

  /**
   * Returns token amount in decimal.
   * @param {Number | String} amount - Amount to convert.
   * @param {String} tokenName - Token Symbol.
   * @returns {Number} Amount in decimal.
   */
  toDecimal(amount, tokenName) {
    if (Object.keys(this.info).indexOf(tokenName.toLowerCase()) == -1)
      throw new Error("'token' symbol not found.");
    var token = this.info[tokenName.toLowerCase()];
    return Number(amount) / 10 ** token.decimals;
  }

  /**
   * Returns token amount in wei.
   * @param {String | address} token - Token.
   * @returns {Bool}
   */
  isToken(token) {
    var isAddress = this.web3.utils.isAddress(token.toLowerCase());
    let tokenInfo = this.info;
    if (isAddress) {
      return Object.keys(tokenInfo).filter(
        (_token) =>
          tokenInfo[_token].address.toLowerCase() == token.toLowerCase()
      )[0];
    } else {
      if (Object.keys(tokenInfo).indexOf(token.toLowerCase()) == -1)
        return false;
      return token.toLowerCase();
    }
  }

  /**
   * Returns all tokens of similar type.
   * if type == "all" then returns whole tokens list.
   */
  getTokenByType(type) {
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
  }

  /**
   * Returns token mapping with specific field in it.
   * @param {String} field - if field is address then below
   * eg:- {eth: {symbol: "ETH", address: "0x"}} => {eth: "0x"}
   * @returns {JSON}
   */
  getTokensField(field, tokens) {
    if (!tokens) tokens = this.info;
    var _field = {};
    Object.keys(tokens).forEach((key, i) => {
      _field[key] = tokens[key][field];
    });
    return _field;
  }

  /**
   * Returns a list of token objects filtered by the type
   */
  getList({ type = null }) {
    return Object.keys(this.info).reduce((list, key) => {
      if (this.info[key].type != type) {
        return list;
      }
      list.push(this.info[key]);
      return list;
    }, []);
  }

  /**
   * Returns a list filtered by the token type and the field needed
   * example: getData({type:"ctoken",field:"address"}) will return all the ctoken addresses in a list
   */
  getDataList({ type = null, field = null }) {
    return Object.values(this.info)
      .filter((a) => {
        return type ? a.type == type : true;
      })
      .map((a) => {
        return field ? a[field] : a;
      });
  }
};
