module.exports = class DydxFlashLoan {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.address = _dsa.address;
    this.dsa = _dsa;
    this.internal = _dsa.internal;
    this.tokens = _dsa.tokens;
  }

  async getLiquidity(tokensArr) {
    let _tokens = [];
    let _tokensAddrArr = [];
    if (tokensArr) {
      tokensArr.forEach((x) => {
        let token = this.tokens.info[x.toLowerCase()];
        if (!token) `${x} not found in sdk token list`;
        _tokensAddrArr.push(token.address);
        _tokens.push(x.toLowerCase());
      });
    } else {
      let _atoken = this.tokens.getTokenByType("atoken");
      _tokens = Object.values(_atoken).map((a) => a.root);
      let _ctoken = this.tokens.getTokenByType("ctoken");
      let _ctokenRoot = Object.values(_ctoken)
        .filter((a) => _tokens.indexOf(a.root) === -1)
        .map((a) => a.root);
      _tokens = [..._tokens, ..._ctokenRoot];
      _tokensAddrArr = _tokens.map((b) => this.tokens.info[b].address);
    }
    var _obj = {
      protocol: "instapool_v2",
      method: "getTokensLimit",
      args: [_tokensAddrArr],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          let _liquidityAvailable = {};
          _tokens.forEach((token, i) => {
            _liquidityAvailable[token] = {
              dydx: this.tokens.toDecimal(res[i].dydx, token),
              aave: res[i].aave / 1e18,
              maker: res[i].maker / 1e18,
              compound: res[i].compound / 1e18,
            };
          });
          resolve(_liquidityAvailable);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  encodeFlashCastData(spells) {
    let encodeSpellsData = this.internal.encodeSpells(spells);
    let argTypes = ["address[]", "bytes[]"];
    return this.web3.eth.abi.encodeParameters(argTypes, [
      encodeSpellsData[0],
      encodeSpellsData[1],
    ]);
  }
};
