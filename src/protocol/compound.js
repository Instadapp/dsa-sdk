module.exports = class Compound {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.token = _dsa.token;
  }

  /**
   * get the root underlying token symbol of ctoken
   * @param {String} cTokenSymbol the ctoken symbol
   */
  ctokenMap(cTokenSymbol) {
    cTokenSymbol = cTokenSymbol.toLowerCase();
    var tokens = this.token;
    for (const key in tokens) {
      if (key == cTokenSymbol) {
        return tokens[key].root;
      }
    }
  }

  /**
   * get properly formatted compound position details
   * @param {string} address the owner address
   * @param {string} cTokens the cToken address
   */
  getPosition(address, cTokens) {
    let that = this.data;
    var _c = new that.web3.eth.Contract(
      that.ABI.read["compound"],
      that.address.read["compound"]
    );
    return new Promise(async function (resolve, reject) {
      let compoundRawData = await _c.methods
        .getCompTokensData(address, cTokens)
        .call()
        .then((res) => {
          return res;
        })
        .catch((err) => {
          reject(err);
        });

      var compoundDataRawArr = [];
      compoundRawData.forEach((token) => {
        compoundDataRawArr.push(...token);
      });

      let addrDecimal = {};
      let addrSymb = {};
      Object.values(that.token).forEach((token) => {
        if (token.compound) {
          let _token = this.ctokenMap[token.symbol.toLowerCase()];
          addrDecimal[token.address] = that.token[_token].decimals;
          addrSymb[token.address] = that.token[_token].symbol;
        }
      });

      let compoundCalculatedData = {};
      cTokens.forEach(function (key, i) {
        let tokenData = {
          oraclePrice: 0,
          Token_symbol: addrSymb[key],
          exchangeRate: 0,
          supplyBalance: 0,
          borrowBalance: 0,
          supplyRate: 0,
          borrowRate: 0,
        };
        var fromElement = i * 6;
        var tokensPriceOracle =
          compoundDataRawArr[fromElement] /
          10 ** (18 + (18 - addrDecimal[key]));
        tokenData.oraclePrice = tokensPriceOracle;
        var compoundExchangeRate = compoundDataRawArr[fromElement + 1] / 1e18;
        var balanceOfCToken = compoundDataRawArr[fromElement + 2];
        var compoundTokenBal = { borrow: 0, supply: 0 };
        compoundTokenBal.supply =
          (balanceOfCToken * compoundExchangeRate) / 10 ** addrDecimal[key];
        compoundTokenBal.supply * tokensPriceOracle;
        var borrowBal =
          compoundDataRawArr[fromElement + 3] / 10 ** addrDecimal[key];
        compoundTokenBal.borrow = borrowBal;
        var compoundSupplyRate =
          (compoundDataRawArr[fromElement + 4] * 2102400) / 1e18;
        compoundSupplyRate = ((1 + compoundSupplyRate / 365) ** 365 - 1) * 100;
        var compoundBorrowRate =
          (compoundDataRawArr[fromElement + 5] * 2102400) / 1e18;
        compoundBorrowRate = ((1 + compoundBorrowRate / 365) ** 365 - 1) * 100;
        tokenData.exchangeRate = compoundExchangeRate;
        tokenData.supplyBalance = compoundTokenBal.supply;
        tokenData.borrowBalance = compoundTokenBal.borrow;
        tokenData.supplyRate = compoundSupplyRate;
        tokenData.borrowRate = compoundBorrowRate;
        compoundCalculatedData[key] = tokenData;
      });
      compoundCalculatedData.authority = address;
      resolve(compoundCalculatedData);
    });
  }
};
