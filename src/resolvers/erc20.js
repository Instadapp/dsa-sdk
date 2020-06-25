module.exports = class ERC20 {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.dsa = _dsa;
  }

  /**
   * returns token balances.
   */
  async getBalances(address, type) {
    var _address;
    !address ? (_address = this.instance.address) : (_address = address);

    var _type;
    type ? (_type = type) : (_type = "token");

    const _tokens = this.tokens.getTokenByType(_type);

    var _tokensAddr = this.tokens.getTokensField("address", _tokens);

    var _obj = {
      protocol: "erc20",
      method: "getBalances",
      args: [_address, Object.values(_tokensAddr)],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _balances = {};
          Object.keys(_tokens).forEach((key, i) => {
            _balances[key] = res[i] / 10 ** _tokens[key].decimals;
          });
          resolve(_balances);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns token allowances.
   */
  async getAllowances(address, spender, type) {
    var _address = !address ? this.instance.address : address;
    if (!spender) throw new Error("`spender` not defined.");

    var _type = type ? type : "token";
    const _tokens = this.tokens.getTokenByType(_type);

    var _tokensAddr = this.tokens.getTokensField("address", _tokens);

    var _obj = {
      protocol: "erc20",
      method: "getAllowances",
      args: [_address, spender, Object.values(_tokensAddr)],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _allowance = {};
          Object.keys(_tokens).forEach((key, i) => {
            _allowance[key] = res[i] / 10 ** _tokens[key].decimals;
          });
          resolve(_allowance);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
