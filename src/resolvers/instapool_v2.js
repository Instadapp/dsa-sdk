module.exports = class DydxFlashLoan {
    /**
     * @param {Object} _dsa the dsa instance to access data stores
     */
    constructor(_dsa) {
      this.web3 = _dsa.web3;
      this.address = _dsa.address;
      this.dsa = _dsa;
      this.internal = _dsa.internal;
      this.tokens = _dsa.tokens;
    }
  
    async getLiquidity(tokensArr) {
        let _tokens = {};
        let _tokensAddrArr = [];
        if (tokensArr) {
            tokensArr.forEach(x => {
                let token = this.tokens.info[x.toLowerCase()];
                if (!token) `${x} not found in sdk token list`;
                _tokens[x.toLowerCase()] = token
                _tokensAddrArr.push(token.address)
            });
        } else {
            _tokens = this.tokens.getTokenByType("token");
            _tokensAddrArr = Object.values(this.tokens.getTokensField("address", _tokens));
        }

        var _obj = {
            protocol: "instapool_v2",
            method: "getTokensLimit",
            args: [_tokensAddrArr],
        };
    
      return new Promise((resolve, reject) => {
        return this.dsa
          .read(_obj)
          .then((res) => {
                let _liquidityAvailable = {}
                Object.keys(_tokens).forEach((token, i) => {
                    _liquidityAvailable[token] = {
                        dydx: this.tokens.toDecimal(res[i].dydx, token),
                        aave: res[i].aave / 1e18,
                        maker: res[i].maker / 1e18,
                        compound: res[i].compound / 1e18
                    }

                })
            resolve(_liquidityAvailable);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }
  
    encodeFlashCastData(spells) {
      let encodeSpellsData = this.internal.encodeSpells(spells);
      let argTypes = ["address[]", "bytes[]"];
      return this.web3.eth.abi.encodeParameters(argTypes, [
        encodeSpellsData[0],
        encodeSpellsData[1],
      ]);
    }
  };
  