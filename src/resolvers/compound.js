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
    const cTokens = this.tokens.getList({ type: "ctoken" });
    for (const key in cTokens) {
      if (cTokens[key].symbol === cTokenSymbol) {
        return cTokens[key].root;
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
   * @param {string} key (optional) default - "token". Options:- "ctoken", "caddress", "address". key of object to return
   * @param {string} cTokens the cToken address
   */
  getPosition(address, key) {
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
          Object.keys(_ctokens).forEach((_ctoken, i) => {
            var _root = _ctokens[_ctoken].root;
            var _key;
            key == "ctoken"
              ? (_key = _ctoken)
              : key == "caddress"
              ? (_key = _ctokens[_ctoken].address)
              : key == "address"
              ? (_key = this.tokens.info[_root].address)
              : (_key = _root);
            var _res = res[0][i];
            var _decimals = this.tokens.info[_ctokens[_ctoken].root].decimals;
            _position[_key] = {};
            var _priceInEth = _res[0] / 10 ** 18;
            var _priceInUsd = _res[1] / 10 ** 18;
            _position[_key].priceInEth = _priceInEth;
            _position[_key].priceInUsd = _priceInUsd;
            var _exchangeRate = _res[2] / 1e18;
            _position[_key].exchangeRate = _exchangeRate;
            _position[_key].ctknBalance = Number(_res[3]);
            var _supply = (_res[3] * _exchangeRate) / 10 ** _decimals;
            _position[_key].supply = _supply;
            _totalSupplyInEth += _supply * _priceInEth;
            _maxBorrowLimitInEth +=
              _supply * _priceInEth * _ctokens[_ctoken].factor;
            var _borrow = _res[4] / 10 ** _decimals;
            _position[_key].borrow = _borrow;
            _totalBorrowInEth += _borrow * _priceInEth;
            var _supplyRate = (_res[5] * 2102400) / 1e18;
            _position[_key].supplyRate = _supplyRate * 100; // Multiply with 100 to make it in percent
            var _supplyYield = (1 + _supplyRate / 365) ** 365 - 1;
            _position[_key].supplyYield = _supplyYield * 100; // Multiply with 100 to make it in percent
            var _borrowRate = (_res[6] * 2102400) / 1e18;
            _position[_key].borrowRate = _borrowRate * 100; // Multiply with 100 to make it in percent
            var _borrowYield = (1 + _borrowRate / 365) ** 365 - 1;
            _position[_key].borrowYield = _borrowYield * 100; // Multiply with 100 to make it in percent
          });
          _position.totalSupplyInEth = _totalSupplyInEth;
          _position.totalBorrowInEth = _totalBorrowInEth;
          _position.maxBorrowLimitInEth = _maxBorrowLimitInEth;
          var _status = _totalBorrowInEth / _totalSupplyInEth;
          _position.status = _status;
          var _liquidation = _maxBorrowLimitInEth / _totalSupplyInEth;
          _position.liquidation = _liquidation;
          _position.compBalance = res[1].balance / 10 ** 18;
          _position.compAccrued = res[1].allocated / 10 ** 18;
          _position.compDelegate = res[1].delegate;
          _position.compVotes = res[1].votes;
          resolve(_position);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
