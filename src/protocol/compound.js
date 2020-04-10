const compoundMapping = require("../constant/protocol/compound.js");

module.exports = class Compound {
  constructor(that) {
    this.data = that;
    this.mapping = compoundMapping;
  }
  getPosition(address, cTokens) {
    var _c = new this.data.web3.eth.Contract(
      this.data.ABI.read["compound"],
      this.data.address.read["compound"]
    );
    var that = this;
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
      Object.values(that.data.token).forEach((token) => {
        if (token.compound) {
          let _token = that.mapping.ctokenMap[token.symbol.toLowerCase()];
          addrDecimal[token.address] = that.data.token[_token].decimals;
          addrSymb[token.address] = that.data.token[_token].symbol;
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
