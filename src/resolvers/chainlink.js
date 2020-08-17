module.exports = class Curve {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.math = _dsa.math;
    this.dsa = _dsa;
  }

  /**
   * get token prices
   */
  async getTokenPrices() {
    var _tokenSyms = Object.values(this.tokens.getTokenByType("token")).map(
      (a) => a.symbol
    );
    var _obj = {
      protocol: "chainlink",
      method: "getPrice",
      args: [_tokenSyms],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          let _res = {};
          let ethPrice = res.ethPriceInUsd[0] / 10 ** res.ethPriceInUsd[1];
          _res.BTC = res.btcPriceInUsd[0] / 10 ** res.btcPriceInUsd[1];
          _res.ETH = ethPrice;
          _tokenSyms.forEach((sym, i) => {
            if (sym != "ETH") {
              let _priceData = res.tokensPriceInETH[i];
              _res[sym] = (_priceData[0] / 10 ** _priceData[1]) * ethPrice;
            }
          });
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * get gas price
   */
  async getFastGasPrice() {
    var _obj = {
      protocol: "chainlink",
      method: "getGasPrice",
      args: [],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          resolve(Number(res));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
