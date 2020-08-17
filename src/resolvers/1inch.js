module.exports = class OneInch {
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
  async getBuyAmount(
    buyToken,
    sellToken,
    sellAmt,
    slippage,
    distribution,
    disableDex
  ) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));
    let _distribution = !distribution ? 100 : distribution;
    let _disableDex = !disableDex ? 0 : disableDex;

    let _sellToken = this.tokens.isToken(sellToken);
    let _sellAmount = !_sellToken
      ? await this.erc20.fromDecimalInternal(sellAmt, sellToken)
      : this.tokens.fromDecimal(sellAmt, _sellToken);

    var _obj = {
      protocol: "oneInch",
      method: "getBuyAmount",
      args: [
        this.internal.filterAddress(buyToken),
        this.internal.filterAddress(sellToken),
        _sellAmount,
        this.math.bigNumInString(_slippage),
        this.math.bigNumInString(_distribution),
        this.math.bigNumInString(_disableDex),
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
            distribution: res[2],
          };
          resolve(_res);
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
   * @param gasPriceInEth dest Token Eth Price Times Gas Price. Default: 0.
   */
  async getBuyAmountWithGas(
    buyToken,
    sellToken,
    sellAmt,
    slippage,
    distribution,
    disableDex,
    gasPriceInEth
  ) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));
    let _distribution = !distribution ? 100 : distribution;
    let _disableDex = !disableDex ? 0 : disableDex;
    let _gasPriceInEth = !gasPriceInEth ? 0 : gasPriceInEth;

    let _sellToken = this.tokens.isToken(sellToken);
    let _sellAmount = !_sellToken
      ? await this.erc20.fromDecimalInternal(sellAmt, sellToken)
      : this.tokens.fromDecimal(sellAmt, _sellToken);

    var _obj = {
      protocol: "oneInch",
      method: "getBuyAmountWithGas",
      args: [
        this.internal.filterAddress(buyToken),
        this.internal.filterAddress(sellToken),
        _sellAmount,
        this.math.bigNumInString(_slippage),
        this.math.bigNumInString(_distribution),
        this.math.bigNumInString(_disableDex),
        this.math.bigNumInString(_gasPriceInEth),
      ],
    };
    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          console.log(res)
          let _buyToken = this.tokens.isToken(buyToken);
          let _buyAmt = !_buyToken
            ? await this.erc20.toDecimalInternal(res[0], buyToken)
            : this.tokens.toDecimal(res[0], _buyToken);
          var _res = {
            buyAmt: _buyAmt,
            buyAmtRaw: res[0],
            unitAmt: res[1],
            distribution: res[2],
            gasEstimate: res[3]
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns buy/dest amount and unit Amount
   * @param tokensArr array of token path
   * @param sellAmt sell token amount in decimal
   * @param slippage slippage of trade
   * @param distributionArr distributions array.
   * @param disableDexArr disable flag array.
   * @param gasPriceInEthArr dest Token Eth Price Times Gas Price. Default: 0.
   */
  async getBuyAmountMultiWithGas(
    tokensArr,
    sellAmt,
    slippage,
    distributionArr,
    disableDexArr,
    gasPriceInEthArr
  ) {
    let swapNum = tokensArr.length - 1;
    if(swapNum < 1) throw new Error("tokens length is not vaild")
    let buyToken = tokensArr[swapNum]
    let sellToken = tokensArr[0]
    let _tokenArr = tokensArr.map(a => this.internal.filterAddress(a));


    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));
    let _distribution = !distributionArr ?
        Array(swapNum).fill("5") :
        distributionArr.map(a => this.math.bigNumInString(a));
    let _disableDex = !disableDexArr ?
        Array(swapNum).fill("0") :
        disableDexArr.map(a => this.math.bigNumInString(a));
    let _gasPriceInEth = !gasPriceInEthArr ?
        Array(swapNum).fill("0") :
        gasPriceInEthArr.map(a => this.math.bigNumInString(a));

    let _sellToken = this.tokens.isToken(sellToken);
    let _sellAmount = !_sellToken
      ? await this.erc20.fromDecimalInternal(sellAmt, sellToken)
      : this.tokens.fromDecimal(sellAmt, _sellToken);

    var _obj = {
      protocol: "oneInch",
      method: "getBuyAmountMultiWithGas",
      args: [
        _tokenArr,
        _sellAmount,
        this.math.bigNumInString(_slippage),
        _distribution,
        _disableDex,
        _gasPriceInEth,
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
            distribution: res[2],
            gasEstimate: res[4]
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
