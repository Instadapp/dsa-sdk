module.exports = class Internal {
  /**
   * @param config.web3
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.web3 = _dsa.web3;
    this.mode = _dsa.mode;
    this.publicAddress = _dsa.publicAddress;
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
   * * @param _d.value (optional)
   * * @param _d.gas (optional)
   * * @param _d.nonce (optional)
   * * @param data calldata
   */
  getTxObj(_d, data) {

    if (!_d.from) throw new Error("'from' is not defined.");
    if (!_d.callData) throw new Error("'calldata' is not defined.");
    if (!_d.to) throw new Error("'to' is not defined.");

    let txObj = {}
    txObj.from = _d.from
    txObj.to = _d.to
    txObj.data =_d.callData != "0x" ? _d.callData : "0x"
    txObj.value = _d.value ? _d.value : 0

    // need above 4 params to estimate the gas
    txObj.gas = _d.gas ? _d.gas : (this.web3.eth.estimateGas(txObj) * 1.3).toFixed(0) // increasing gas cost by 30% for margin
    txObj.gasPrice = _d.gasPrice ? _d.gasPrice : 1 // defaulted to 1 gwei
    txObj.nonce = _d.nonce ? _d.nonce : await this.web3.eth.getTransactionCount(txObj.from) // defaulted to 1 gwei
    
    return txObj
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
   * * @param _d the spells instance
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
    if (this.mode == "node") return this.publicAddress
    
    // otherwise, browser
    let address = await this.web3.eth.getAccounts();
    if (address.length == 0)
      return console.log("No ethereum address detected.");
    return address[0];
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
    return new Promise(async function (resolve, reject) {
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
