module.exports = class Aave {
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

  getAtokens() {
    var tokens = this.tokens.info;
    var _atokens = {};
    Object.keys(tokens).forEach((token) => {
      if (tokens[token].type == "atoken") _atokens[token] = tokens[token];
    });
    return _atokens;
  }

  getAtokensAddresses(_atokens) {
    if (!_atokens) _atokens = getAtokens();
    var _addresses = [];
    Object.keys(_atokens).forEach((_key) => {
      _addresses.push(_atokens[_key].address);
    });
    return _addresses;
  }

  getTokensAddresses(_atokens) {
    var tokens = this.tokens.info;
    var _addresses = [];
    Object.keys(_atokens).forEach((_key) => {
      _addresses.push(tokens[_atokens[_key].root].address);
    });
    return _addresses;
  }

  /**
   * get properly formatted Aave position details
   * @param {string} address the owner address
   * @param {string} key (optional) default - "token". Options:- "address", "atoken". key of object to return
   */
  getPosition(address, key) {
    var _address;
    !address ? (_address = this.instance.address) : (_address = address);
    var _aTokens = this.getAtokens();
    var _addresses = this.getTokensAddresses(_aTokens);
    var _obj = {
      protocol: "aave",
      method: "getPosition",
      args: [_address, _addresses],
    };
    return new Promise(async (resolve, reject) => {
      await this.dsa
        .read(_obj)
        .then((res) => {
          var _position = {};
          var _totalSupplyInEth = 0;
          var _totalBorrowInEth = 0;
          var _maxBorrowLimitInEth = 0;
          var _liquidationLimitInEth = 0;
          Object.keys(_aTokens).forEach((_atoken, i) => {
            var _root = _aTokens[_atoken].root;
            var _key;
            key == "atoken"
              ? (_key = _atoken)
              : key == "address"
              ? (_key = this.tokens.info[_root].address)
              : (_key = _root);
            var _res = res[0][i];
            var _decimals = this.tokens.info[_root].decimals;
            _position[_key] = {};
            var _priceInEth = _res[0] / 10 ** 18;
            _position[_key].priceInEth = _priceInEth;
            var _supply = _res[1] / 10 ** _decimals;
            _position[_key].supply = _supply;
            _totalSupplyInEth += _supply * _priceInEth;
            _position[_key].ltv = _res[7].ltv / 100;
            _position[_key].maxRatio =
              _res[7].ltv == 0 ? 0 : _res[7].threshold / 100;
            _maxBorrowLimitInEth += _supply * _priceInEth * _position[_key].ltv;
            _liquidationLimitInEth +=
              _supply * _priceInEth * _position[_key].maxRatio;
            var _borrow = _res[2] / 10 ** _decimals;
            _position[_key].borrow = _borrow;
            var _fee = _res[3] / 10 ** _decimals;
            _position[_key].borrowFee = _fee;
            _position[_key].borrowYield = (_res[5] / 1e27) * 100; // Multiply with 100 to make it in percent
            _position[_key].supplyYield = (_res[4] / 1e27) * 100; // Multiply with 100 to make it in percent
            _position[_key].isVariableBorrow = Number(_res[6]) == 2;
            // _position[_key].isStableBorrowAllowed = Boolean(
            //   _res[7].stableBorrowEnabled
            // );
          });
          _position.totalSupplyInEth = _totalSupplyInEth;
          _position.totalBorrowInEth = Number(res[1][2]) / 1e18;
          _position.totalFeeInETH = Number(res[1][3]) / 1e18;
          _position.totalMaxRatio = Number(res[1][5]) / 1e2;
          _position.maxBorrowLimitInEth = _maxBorrowLimitInEth;
          _position.liquidationLimitInEth = _liquidationLimitInEth;
          var _status = _totalBorrowInEth / _totalSupplyInEth;
          _position.status = _status;
          var _maxBorrowRatio = _maxBorrowLimitInEth / _totalSupplyInEth;
          _position.maxBorrowRatio = _maxBorrowRatio;
          var _liquidation = _liquidationLimitInEth / _totalSupplyInEth;
          _position.liquidation = _liquidation;
          resolve(_position);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
