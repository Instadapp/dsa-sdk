module.exports = class Compound {
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
   * get the root underlying token symbol of ctoken
   * @param {String} cTokenSymbol the ctoken symbol
   */
  ctokenMap(cTokenSymbol) {
    cTokenSymbol = cTokenSymbol.toLowerCase();
    for (const key in this.tokens.getList({})) {
      if (key == cTokenSymbol) {
        return tokens[key].root;
      }
    }
  }

  getCtokens() {
    var _tokens = this.tokens.info;
    var _ctokens = {};
    Object.keys(_tokens).forEach((_token, i) => {
      if (_tokens[_token].type == "ctoken") _ctokens[_token] = _tokens[_token];
    });
    return _ctokens;
  }

  getCtokensAddresses(_ctokens) {
    if (!_ctokens) _ctokens = getCtokens();
    var _cAddresses = [];
    Object.keys(_ctokens).forEach((_key, i) => {
      _cAddresses.push(_ctokens[_key].address);
    });
    return _cAddresses;
  }

  /**
   * get properly formatted compound position details
   * @param {string} address the owner address
   * @param {string} cTokens the cToken address
   */
  getPosition(address) {
    var _address;
    !address ? (_address = this.instance.address) : (_address = address);
    var _ctokens = this.getCtokens();
    var _cAddresses = this.getCtokensAddresses(_ctokens);
    var _obj = {
      protocol: "compound",
      method: "getPosition",
      args: [_address, _cAddresses],
    };
    return new Promise(async (resolve, reject) => {
      await this.dsa
        .read(_obj)
        .then((res) => {
          var _position = {};
          var _totalSupplyInEth = 0;
          var _totalBorrowInEth = 0;
          var _maxBorrowLimitInEth = 0;
          Object.keys(_ctokens).forEach((key, i) => {
            var _res = res[i];
            var _decimals = this.tokens.info[_ctokens[key].root].decimals;
            _position[key] = {};
            var _priceInEth = _res[0] / 10 ** (18 + (18 - _decimals));
            _position[key].priceInEth = _priceInEth;
            var _exchangeRate = _res[1] / 1e18;
            _position[key].exchangeRate = _exchangeRate;
            var _supply = (_res[2] * _exchangeRate) / 10 ** _decimals;
            _position[key].supply = _supply;
            _totalSupplyInEth += _supply * _priceInEth;
            _maxBorrowLimitInEth +=
              _supply * _priceInEth * _ctokens[key].factor;
            var _borrow = _res[3] / 10 ** _decimals;
            _position[key].borrow = _borrow;
            _totalBorrowInEth += _borrow * _priceInEth;
            var _supplyRate = (_res[4] * 2102400) / 1e18;
            _position[key].supplyRate = _supplyRate * 100; // Multiply with 100 to make it in percent
            var _supplyYield = (1 + _supplyRate / 365) ** 365 - 1;
            _position[key].supplyYield = _supplyYield * 100; // Multiply with 100 to make it in percent
            var _borrowRate = (_res[5] * 2102400) / 1e18;
            _position[key].borrowRate = _borrowRate * 100; // Multiply with 100 to make it in percent
            var _borrowYield = (1 + _borrowRate / 365) ** 365 - 1;
            _position[key].borrowYield = _borrowYield * 100; // Multiply with 100 to make it in percent
          });
          _position.totalSupplyInEth = _totalSupplyInEth;
          _position.totalBorrowInEth = _totalBorrowInEth;
          _position.maxBorrowLimitInEth = _maxBorrowLimitInEth;
          var _status = _totalBorrowInEth / _totalSupplyInEth;
          _position.status = _status;
          var _liquidation = _maxBorrowLimitInEth / _totalSupplyInEth;
          _position.liquidation = _liquidation;
          resolve(_position);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
