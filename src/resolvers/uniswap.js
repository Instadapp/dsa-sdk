module.exports = class Uniswap {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.math = _dsa.math;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.internal = _dsa.internal;
    this.dsa = _dsa;
  }

  /**
   * get properly formatted uniswap position details
   * @param {string} address the owner address
   * @param {array} tokenPair token pair array. Eg: [{tokenA: _addrA, tokenB: _addrB}]
   */
  async getPosition(address, tokenPair) {
    var _address = !address ? this.instance.address : address;

    var _tokenPairs = tokenPair.map((a) => {
      if (!a.tokenA) throw new Error("tokenA not found");
      if (!a.tokenB) throw new Error("tokenB not found");
      return [
        this.internal.filterAddress(a.tokenA),
        this.internal.filterAddress(a.tokenB),
      ];
    });
    var _obj = {
      protocol: "uniswap",
      method: "getPosition",
      args: [_address, _tokenPairs],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          let _position = [];
          for (let i = 0; i < res.length; i++) {
            let tokenA = _tokenPairs[i][0];
            let tokenB = _tokenPairs[i][1];
            let _res = res[i];

            let _tokenA = this.tokens.isToken(tokenA);
            let _amtA = !_tokenA
              ? await this.erc20.toDecimalInternal(_res[0], tokenA)
              : this.tokens.toDecimal(_res[0], _tokenA);

            let _tokenB = this.tokens.isToken(tokenB);
            let _amtB = !_tokenB
              ? await this.erc20.toDecimalInternal(_res[1], tokenB)
              : this.tokens.toDecimal(_res[1], _tokenB);

            _position[i] = {
              amountA: _amtA,
              amountB: _amtB,
              uniTokenAmount: _res[2] / 10 ** 18,
            };
          }
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
    _slippage = String(this.math.bigNumInString(_slippage));

    let _sellToken = this.tokens.isToken(sellToken);
    let _sellAmount = !_sellToken
      ? await this.erc20.fromDecimalInternal(sellAmt, sellToken)
      : this.tokens.fromDecimal(sellAmt, _sellToken);

    var _obj = {
      protocol: "uniswap",
      method: "getBuyAmount",
      args: [
        this.internal.filterAddress(buyToken),
        this.internal.filterAddress(sellToken),
        this.math.bigNumInString(_sellAmount),
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

  /**
   * returns sell/src amount and unit Amount
   * @param buyToken buy token symbol
   * @param sellToken sell token symbol
   * @param buyAmt buy token amount in decimal
   * @param slippage slippage of trade
   */
  async getSellAmount(buyToken, sellToken, buyAmt, slippage) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));

    let _buyToken = this.tokens.isToken(buyToken);
    let _buyAmt = !_buyToken
      ? await this.erc20.fromDecimalInternal(buyAmt, buyToken)
      : this.tokens.fromDecimal(buyAmt, _buyToken);

    var _obj = {
      protocol: "uniswap",
      method: "getSellAmount",
      args: [
        this.internal.filterAddress(buyToken),
        this.internal.filterAddress(sellToken),
        this.math.bigNumInString(_buyAmt),
        this.math.bigNumInString(_slippage),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          let _sellToken = this.tokens.isToken(sellToken);
          let _sellAmount = !_sellToken
            ? await this.erc20.toDecimalInternal(res[0], sellToken)
            : this.tokens.toDecimal(res[0], _sellToken);
          var _res = {
            sellAmt: _sellAmount,
            sellAmtRaw: res[0],
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
   * returns tokenB amount and unit Amount
   * @param tokenA tokenA symbol/address
   * @param tokenB tokenB symbol/address
   * @param amtA tokenA amount in decimal
   */
  async getDepositAmount(tokenA, tokenB, amtA) {
    let _tokenA = this.tokens.isToken(tokenA);
    let _amtA = !_tokenA
      ? await this.erc20.fromDecimalInternal(amtA, tokenA)
      : this.tokens.fromDecimal(amtA, _tokenA);

    var _obj = {
      protocol: "uniswap",
      method: "getDepositAmount",
      args: [
        this.internal.filterAddress(tokenA),
        this.internal.filterAddress(tokenB),
        this.math.bigNumInString(_amtA),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          let _tokenB = this.tokens.isToken(tokenB);
          let _amtB = !_tokenB
            ? await this.erc20.toDecimalInternal(res[0], tokenB)
            : this.tokens.toDecimal(res[0], _tokenB);
          var _res = {
            amountA: Number(amtA),
            amountB: _amtB,
            amountB_Raw: res[0],
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
   * returns tokenB amount and unit Amount
   * @param tokenA tokenA symbol/address
   * @param tokenB tokenB symbol/address
   * @param uniAmt uni token amount in decimal
   * @param slippage slippage of trade
   */
  async getWithdrawAmount(tokenA, tokenB, uniAmt, slippage) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));

    let _uniAmt = (uniAmt * 10 ** 18).toFixed(0);
    var _obj = {
      protocol: "uniswap",
      method: "getWithdrawAmounts",
      args: [
        this.internal.filterAddress(tokenA),
        this.internal.filterAddress(tokenB),
        this.math.bigNumInString(_uniAmt),
        this.math.bigNumInString(_slippage),
      ],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          let _tokenA = this.tokens.isToken(tokenA);
          let _amtA = !_tokenA
            ? await this.erc20.toDecimalInternal(res[0], tokenA)
            : this.tokens.toDecimal(res[0], _tokenA);

          let _tokenB = this.tokens.isToken(tokenB);
          let _amtB = !_tokenB
            ? await this.erc20.toDecimalInternal(res[1], tokenB)
            : this.tokens.toDecimal(res[1], _tokenB);
          var _res = {
            amountA: _amtA,
            amountB: _amtB,
            amountA_Raw: res[0],
            amountB_Raw: res[1],
            unitAmtA: res[2],
            unitAmtB: res[3],
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
