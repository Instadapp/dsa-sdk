module.exports = class Internal {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.web3 = _dsa.web3;
    this.mode = _dsa.mode;
    this.privateKey = _dsa.privateKey;
  }

  /**
   * returns the input interface required for cast()
   */
  getTarget(_co) {
    const _t = this.address.connectors[_co];
    if (_t) return _t;
    else return console.error(`${_co} is invalid connector.`);
  }

  /**
   * returns txObj for any calls
   * * @param _d.from
   * * @param _d.to
   * * @param _d.callData
   * * @param _d.type
   * * @param _d.value (optional)
   * * @param _d.gas (optional)
   * * @param _d.gasPrice (optional only for "browser" mode)
   * * @param _d.nonce (optional) mostly for "node" mode
   */
  async getTxObj(_d) {
    if (!_d.from) throw new Error("'from' is not defined.");
    if (!_d.callData) throw new Error("'calldata' is not defined.");
    if (!_d.to) throw new Error("'to' is not defined.");
    if (_d.type != 0 && !_d.type) _d.type = 0;

    let txObj = {};
    txObj.from = _d.from;
    txObj.to = _d.to;
    txObj.data = _d.callData != "0x" ? _d.callData : "0x";
    txObj.value = _d.value ? _d.value : 0;
    // need above 4 params to estimate the gas
    if (_d.type == 0) {
      let txObjClone = { ...txObj };
      txObj.gas = _d.gas
        ? _d.gas
        : ((await this.web3.eth.estimateGas(txObjClone)) * 1.1).toFixed(0); // increasing gas cost by 10% for margin

      if (this.mode == "node") {
        if (!_d.gasPrice) throw new Error("`gasPrice` is not defined.");

        txObj.nonce = _d.nonce
          ? _d.nonce
          : await this.web3.eth.getTransactionCount(txObj.from);
      }
      if (_d.gasPrice) txObj.gasPrice = _d.gasPrice;
    }

    return txObj;
  }

  /**
   * returns the ABI interface for any DSA contract
   */
  getInterface(_type, _co, _m) {
    const _abi = this.ABI[_type][_co];
    for (let i = 0; i < _abi.length; i++) {
      if (_abi[i].name == _m) {
        return _abi[i];
      }
    }
    return console.error(`${_m} is invalid method.`);
  }

  /**
   * returns the input interface for any connector
   */
  getConnectorInterface(_co, _m) {
    return this.getInterface("connectors", _co, _m);
  }

  /**
   * returns encoded data of any calls
   * * @param _d.connector
   * * @param _d.method
   * * @param _d.args
   */
  encodeMethod(_d) {
    let _co = _d.connector;
    let _m = _d.method;
    let _a = _d.args; // []
    let _i = this.getInterface("connectors", _co, _m);
    return this.web3.eth.abi.encodeFunctionCall(_i, _a);
  }

  /**
   * returns encoded data of spells (used via cast() mostly)
   * @param _d the spells instance
   * OR
   * @param _d.spells the spells instance
   */
  encodeSpells(_d) {
    let _s;
    if (Array.isArray(_d.data)) {
      _s = _d.data; // required
    } else {
      _s = _d.spells.data; // required
    }
    let _ta = [];
    let _eda = [];
    for (let i = 0; i < _s.length; i++) {
      _ta.push(this.getTarget(_s[i].connector));
      _eda.push(this.encodeMethod(_s[i]));
    }
    return [_ta, _eda];
  }

  /**
   * returns the input interface required for cast()
   */
  async getAddress() {
    if (this.mode == "node")
      return this.web3.eth.accounts.privateKeyToAccount(this.privateKey)
        .address;

    // otherwise, browser
    let address = await this.web3.eth.getAccounts();
    if (address.length == 0)
      return console.log("No ethereum address detected.");
    return address[0];
  }

  /**
   * returns the address from token key OR checksum the address if not
   */
  filterAddress(token) {
    var isAddress = this.web3.utils.isAddress(token.toLowerCase());
    if (isAddress) {
      return this.web3.utils.toChecksumAddress(token.toLowerCase());
    } else {
      let tokenInfo = require("./constant/tokensInfo.json");
      if (Object.keys(tokenInfo).indexOf(token.toLowerCase()) == -1)
        throw new Error("'token' symbol not found.");
      return this.web3.utils.toChecksumAddress(
        tokenInfo[token.toLowerCase()].address
      );
    }
  }

  /**
   * returns the estimate gas cost
   * @param _d.from the from address
   * @param _d.to the to address
   * @param {Object} _d.abi the ABI method single interface
   * @param {Array} _d.args the method arguments
   * @param _d.value the call ETH value
   */
  async estimateGas(_d) {
    let encodeHash = this.web3.eth.abi.encodeFunctionCall(_d.abi, _d.args);
    let _web3 = this.web3;
    return new Promise(async (resolve, reject) => {
      await _web3.eth
        .estimateGas({
          from: _d.from,
          to: _d.to,
          data: encodeHash,
          value: _d.value,
        })
        .then((gas) => {
          resolve(gas);
        })
        .catch((err) => {
          reject({
            error: err,
            data: {
              abi: _d.abi,
              args: _d.args,
              from: _d.from,
              to: _d.to,
              data: encodeHash,
              value: _d.value,
            },
          });
          console.error(err);
        });
    });
  }
};
