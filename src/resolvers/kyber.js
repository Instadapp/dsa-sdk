module.exports = class Kyber {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.math = _dsa.math;
    this.internal = _dsa.internal;
    this.erc20 = _dsa.erc20;
    this.dsa = _dsa;
  }

  /**
   * returns buy/dest amount and unit Amount
   * @param buyToken buy token symbol
   * @param sellToken sell token symbol
   * @param sellAmt sell token amount in decimal
   * @param slippage slippage of trade
   */
  async getBuyAmount(buyToken, sellToken, sellAmt, slippage) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));

    let _sellToken = this.tokens.isToken(sellToken);
    let _sellAmount = !_sellToken
      ? await this.erc20.fromDecimalInternal(sellAmt, sellToken)
      : this.tokens.fromDecimal(sellAmt, _sellToken);

    var _obj = {
      protocol: "kyber",
      method: "getBuyAmount",
      args: [
        this.internal.filterAddress(buyToken),
        this.internal.filterAddress(sellToken),
        _sellAmount,
        this.math.bigNumInString(_slippage),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          let _buyToken = this.tokens.isToken(buyToken);
          let _buyAmt = !_buyToken
            ? await this.erc20.toDecimalInternal(res[0], buyToken)
            : this.tokens.toDecimal(res[0], _buyToken);

          var _res = {
            buyAmt: _buyAmt,
            buyAmtRaw: res[0],
            unitAmt: res[1],
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
