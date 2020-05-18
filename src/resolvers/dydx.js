var markets = {
  "0": {
    name: "eth",
    factor: 10 / 11.5,
  },
  "2": {
    name: "usdc",
    factor: 10 / 11.5,
  },
  "3": {
    name: "dai",
    factor: 10 / 11.5,
  },
};

module.exports = class Dydx {
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
   * get properly formatted Curve position details
   * @param {string} address the owner address
   * @param {string} key (optional) default - "token". Options:- "market", "address". key of object to return
   */
  async getPosition(address, key) {
    var _address;
    !address ? (_address = this.instance.address) : (_address = address);

    var _markets = Object.keys(markets);
    var _obj = {
      protocol: "dydx",
      method: "getPosition",
      args: [_address, _markets],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _position = {};
          var _totalSupplyInEth = 0;
          var _totalBorrowInEth = 0;
          var _maxBorrowLimitInEth = 0;
          var _ethPrice = res[0][0] / 10 ** 18;
          _markets.forEach((market, i) => {
            var _tokenName = markets[market].name;
            var _decimals = this.tokens.info[_tokenName].decimals;
            var _res = res[i];
            var _key =
              key == "market"
                ? market
                : key == "address"
                ? this.tokens.info[_tokenName].address
                : _tokenName;

            _position[_key] = {};

            _position[_key].price = _res[0] / 10 ** (18 + (18 - _decimals));
            var _priceInEth = _position[_key].price / _ethPrice;

            var _supply = this.tokens.toDecimal(_res[1], _tokenName);
            var _borrow = this.tokens.toDecimal(_res[2], _tokenName);
            _position[_key].supply = _supply;
            _position[_key].borrow = _borrow;

            _totalSupplyInEth += _supply * _priceInEth;
            _maxBorrowLimitInEth +=
              _supply * _priceInEth * markets[market].factor;
            _totalBorrowInEth += _borrow * _priceInEth;

            var tokenUtil = _res[3] / 10 ** 18;
            var borrowRate =
              0.1 * tokenUtil + 0.1 * tokenUtil ** 32 + 0.3 * tokenUtil ** 64;
            var suppyRate = 0.95 * borrowRate * tokenUtil;
            var borrowYeild = (1 + borrowRate / 365) ** 365 - 1;
            var supplyYield = (1 + suppyRate / 365) ** 365 - 1;
            _position[_key].borrowRate = borrowRate * 100;
            _position[_key].borrowYield = borrowYeild * 100;
            _position[_key].SupplyRate = suppyRate * 100;
            _position[_key].supplyYield = supplyYield * 100;
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
