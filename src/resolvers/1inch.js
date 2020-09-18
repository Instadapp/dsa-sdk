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
   * @param slippage (optional) slippage of trade.
   * @param distribution (optional) distribution of the swap. Default: 5.
   * @param disableDex (optional) disable dex. Default: 0 (none).
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
    let _distribution = !distribution ? 50 : distribution;
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
   * @param slippage (optional) slippage of trade.
   * @param _d (optional) config paramter
   * OR
   * @param _d.distribution (optional) distribution of the swap. Default: 20.
   * @param _d.disableDex (optional) disable dex. Default: 0(none).
   * @param _d.tokenPrice (optional) object of token prices
   * @param _d.gasPrice (optional) gas price.
   */
  async getBuyAmountWithGas(buyToken, sellToken, sellAmt, slippage, _d) {
    if (!_d) _d = {};

    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));
    let _distribution = !_d.distribution ? 20 : _d.distribution;
    let _disableDex = !_d.disableDex ? 0 : _d.disableDex;

    let _buyToken = this.tokens.isToken(buyToken);

    let tokenPrice;
    let gasPrice;
    if (!_d.tokenPrice) {
      let prices = await this.dsa.chainlink.getTokenPrices();
      let tokenPrices = Object.fromEntries(
        Object.keys(prices).map((v) => [
          v,
          prices[v] ? prices.ETH / prices[v] : 0,
        ])
      );
      if (!_buyToken && !tokenPrices[_buyToken.toUpperCase()])
        throw new Error(`${buyToken} price not found.`);
      tokenPrice = tokenPrices[_buyToken.toUpperCase()];
    } else {
      tokenPrice = _d.tokenPrice;
    }
    if (!_d.gasPrice)
      gasPrice = (await this.dsa.chainlink.getFastGasPrice()) / 1e9;
    else gasPrice = _d.gasPrice;

    let _gasPriceInEth = !_buyToken
      ? await this.erc20.fromDecimalInternal(tokenPrice, buyToken)
      : this.tokens.fromDecimal(tokenPrice, _buyToken);
    _gasPriceInEth = _gasPriceInEth * (gasPrice * 10 ** 9);

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
          let _buyToken = this.tokens.isToken(buyToken);
          let _buyAmt = !_buyToken
            ? await this.erc20.toDecimalInternal(res[0], buyToken)
            : this.tokens.toDecimal(res[0], _buyToken);
          var _res = {
            buyAmt: _buyAmt,
            buyAmtRaw: res[0],
            unitAmt: res[1],
            distribution: res[2],
            gasEstimate: res[3],
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
   * @param _d (optional) config paramter
   * OR
   * @param _d.distributionsArr (optional) distribution of the swap. Default: 5.
   * @param _d.disableDexArr (optional) disable dex. Default: 0(none).
   * @param _d.tokenPricesArr (optional) object of token prices
   * @param _d.gasPrice (optional) gas price.
   */
  async getBuyAmountMultiWithGas(tokensArr, sellAmt, slippage, _d) {
    if (!_d) _d = {};

    let swapNum = tokensArr.length - 1;
    if (swapNum < 1) throw new Error("tokens length is not vaild");
    let buyToken = tokensArr[swapNum];
    let sellToken = tokensArr[0];
    let _tokenArr = tokensArr.map((a) => this.internal.filterAddress(a));

    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));
    let _distribution = !_d.distributionsArr
      ? Array(swapNum).fill("5")
      : _d.distributionsArr.map((a) => this.math.bigNumInString(a));
    let _disableDex = !_d.disableDexArr
      ? Array(swapNum).fill("0")
      : _d.disableDexArr.map((a) => this.math.bigNumInString(a));

    let gasPrice;
    let tokenPrices;

    if (!_d.gasPrice)
      gasPrice = (await this.dsa.chainlink.getFastGasPrice()) / 1e9;
    else gasPrice = _d.gasPrice;

    if (!_d.tokenPricesArr) {
      let prices = await this.dsa.chainlink.getTokenPrices();
      tokenPrices = Object.fromEntries(
        Object.keys(prices).map((v) => [
          v,
          prices[v] ? prices.ETH / prices[v] : 0,
        ])
      );
    } else {
      tokenPrices = _d.tokenPrices;
    }

    let tokenGasPriceArr = [];
    for (let i = 1; i < tokensArr.length; i++) {
      let _token = tokensArr[i].toLowerCase();
      let _tokenSym = this.tokens.isToken(_token);
      let _qToken = !_tokenSym ? _token : _tokenSym;

      let _priceInEth = Object.keys(tokenPrices).filter(
        (a) => a.toLowerCase() == _qToken
      )[0];
      if (!_priceInEth) throw new Error(`${_token} price not found.`);

      let priceInWei = !_tokenSym
        ? await this.erc20.fromDecimalInternal(tokenPrices[_priceInEth], _token)
        : this.tokens.fromDecimal(tokenPrices[_priceInEth], _tokenSym);
      tokenGasPriceArr.push(
        this.math.bigNumInString(priceInWei * (gasPrice * 10 ** 9))
      );
    }

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
        tokenGasPriceArr,
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
            gasEstimate: res[4],
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns different combinations of buy/dest amount and unit Amount
   * @param buyToken buy token symbol
   * @param sellToken sell token symbol
   * @param tokensArr array of token for different combinations of bath with sellToken and buyToken.
   * @param sellAmt sell token amount in decimal
   * @param slippage (optional) slippage of trade. Default: 1%.
   * @param _d (optional) config paramter
   * Or
   * @param _d.distribution (optional) distribution of the swap. Default: 5.
   * @param _d.disableDex (optional) disable dex. Default: 0(none).
   * @param _d.tokenPrices (optional) object of token prices
   * @param _d.gasPrice (optional) gas price.
   */
  async getBuyAmountMultiArr(
    buyToken,
    sellToken,
    tokensArr,
    sellAmt,
    slippage,
    _d
  ) {
    if (!_d) _d = {};
    if (tokensArr.length == 0) throw new Error(`"tokensArr" is empty`);

    let tokenPrices;
    let gasPrice;
    if (!_d.tokenPrices) {
      let prices = await this.dsa.chainlink.getTokenPrices();
      tokenPrices = Object.fromEntries(
        Object.keys(prices).map((v) => [
          v,
          prices[v] ? prices.ETH / prices[v] : 0,
        ])
      );
    } else {
      tokenPrices = _d.tokenPrices;
    }
    if (!_d.gasPrice)
      gasPrice = (await this.dsa.chainlink.getFastGasPrice()) / 1e9;
    else gasPrice = _d.gasPrice;

    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.math.bigNumInString(_slippage));

    let _distribution = !_d.distribution ? "5" : _d.distribution;
    let _disableDex = !_d.disableDex ? "0" : _d.disableDex;

    let tokenGasPriceArr = {};
    let _alldestTokens = [...tokensArr, buyToken];
    for (let i = 0; i < _alldestTokens.length; i++) {
      let _token = _alldestTokens[i].toLowerCase();
      if (!this.tokens.isToken(_token)) throw new Error(`${_token} not found.`);

      let _priceInEth = Object.keys(tokenPrices).filter(
        (a) => a.toLowerCase() == _token
      )[0];
      if (!_priceInEth) throw new Error(`${_token} price not found.`);

      let priceInWei = this.tokens.fromDecimal(
        tokenPrices[_priceInEth],
        _token
      );
      tokenGasPriceArr[_token] = this.math.bigNumInString(
        priceInWei * (gasPrice * 10 ** 9)
      );
    }

    let multiTokenPath = [];
    let path = [];
    let pathAddr = [];
    for (let i = 0; i < tokensArr.length; i++) {
      let tokenA = tokensArr[i];
      for (let j = 0; j < tokensArr.length; j++) {
        let _tokenPath = [];
        let _tokenPathAddr = [];

        let _gasArr = [];
        let tokenB = tokensArr[j];
        if (i == j) {
          _tokenPath = [sellToken, tokenA, buyToken];
        } else {
          _tokenPath = [sellToken, tokenA, tokenB, buyToken];
        }
        _tokenPath.slice(1).forEach((x) => {
          _gasArr.push(tokenGasPriceArr[x.toLowerCase()]);
        });
        _tokenPathAddr = _tokenPath.map((a) => this.internal.filterAddress(a));

        path.push(_tokenPath);
        pathAddr.push(_tokenPathAddr);

        let _len = _tokenPathAddr.length - 1;
        multiTokenPath.push({
          tokens: _tokenPathAddr,
          destTokenEthPriceTimesGasPrices: _gasArr,
          distribution: Array(_len).fill(_distribution),
          disableDexes: Array(_len).fill(_disableDex),
        });
      }
    }

    let directPath = [sellToken, buyToken];
    let directPathAddr = directPath.map((a) => this.internal.filterAddress(a));
    path.push(directPath);
    pathAddr.push(directPathAddr);
    multiTokenPath.push({
      tokens: directPathAddr,
      destTokenEthPriceTimesGasPrices: directPath
        .slice(1)
        .map((x) => tokenGasPriceArr[x.toLowerCase()]),
      distribution: Array(2).fill(_distribution),
      disableDexes: Array(2).fill(_disableDex),
    });

    let _sellToken = this.tokens.isToken(sellToken);
    let _sellAmount = !_sellToken
      ? await this.erc20.fromDecimalInternal(sellAmt, sellToken)
      : this.tokens.fromDecimal(sellAmt, _sellToken);

    var _obj = {
      protocol: "oneInch",
      method: "getBuyAmountsMulti",
      args: [multiTokenPath, _sellAmount, this.math.bigNumInString(_slippage)],
    };
    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then(async (res) => {
          let _res = [];
          let _buyToken = this.tokens.isToken(buyToken);
          for (let i = 0; i < res.length; i++) {
            const data = res[i];
            let _buyAmt = !_buyToken
              ? await this.erc20.toDecimalInternal(data[0], buyToken)
              : this.tokens.toDecimal(data[0], _buyToken);
            _res.push({
              path: path[i],
              pathAddresses: pathAddr[i],
              buyAmt: _buyAmt,
              buyAmtRaw: data[0],
              unitAmt: data[1],
              distribution: data[2],
              gasEstimate: data[4],
            });
          }
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
