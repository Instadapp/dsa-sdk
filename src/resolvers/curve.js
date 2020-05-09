module.exports = class Curve {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.helpers = _dsa.helpers;
    this.dsa = _dsa;
  }

  /**
   * get properly formatted compound position details
   * @param {string} address the owner address
   */
  async getPosition(address) {
    var _address;
    !address ? (_address = this.instance.address) : (_address = address);

    var _obj = {
      protocol: "curve",
      method: "getPosition",
      args: [_address],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          let _position = {};
          var _curveDec = 18;
          var _daiDec = 18;
          var _usdcDec = 6;
          var _usdtDec = 6;
          var _susdDec = 18;
          _position.curveBalance = res[0] / 10 ** _curveDec;
          _position.totalSupply = res[1] / 10 ** _curveDec;
          _position.userShare = res[2] / 10 ** _curveDec;
          _position.daiPoolBalance = res[3] / 10 ** _daiDec;
          _position.usdcPoolBalance = res[4] / 10 ** _usdcDec;
          _position.usdtPoolBalance = res[5] / 10 ** _usdtDec;
          _position.susdPoolBalance = res[6] / 10 ** _susdDec;
          resolve(_position);
        })
        .catch((err) => {
          reject(err);
        });
    });
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
    _slippage = String(this.helpers.bigNumInString(_slippage));

    var _obj = {
      protocol: "curve",
      method: "getBuyAmount",
      args: [
        this.tokens.info[buyToken.toLowerCase()].address,
        this.tokens.info[sellToken.toLowerCase()].address,
        this.tokens.fromDecimal(sellAmt, sellToken),
        this.helpers.bigNumInString(_slippage),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _res = {
            buyAmt: this.tokens.toDecimal(res[0], buyToken),
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

  /**
   * returns curve token amount and unit Amount
   * @param token deposit token symbol
   * @param amt deposit token amount
   * @param slippage slippage to deposit
   */
  async getDepositAmount(token, amt, slippage) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.helpers.bigNumInString(_slippage));

    var _obj = {
      protocol: "curve",
      method: "getDepositAmount",
      args: [
        this.tokens.info[token.toLowerCase()].address,
        this.tokens.fromDecimal(amt, token),
        this.helpers.bigNumInString(_slippage),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _res = {
            curveAmt: this.tokens.toDecimal(res[0], token),
            curveAmtRaw: res[0],
            unitAmt: res[1],
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns curve token amount and unit Amount
   * @param token withdraw token symbol
   * @param amt withdraw token amount
   * @param slippage slippage to withdraw
   */
  async getWithdrawAmount(token, amt, slippage) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.helpers.bigNumInString(_slippage));

    var _obj = {
      protocol: "curve",
      method: "getWithdrawAmount",
      args: [
        this.tokens.info[token.toLowerCase()].address,
        this.tokens.fromDecimal(amt, token),
        this.helpers.bigNumInString(_slippage),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _res = {
            curveAmt: this.tokens.toDecimal(res[0], token),
            curveAmtRaw: res[0],
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
