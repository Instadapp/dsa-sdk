const Helpers = require("./helpers.js");
const Internal = require("./internal.js");
const Balances = require("./resolvers/balances.js");
const Compound = require("./resolvers/compound.js");
const Maker = require("./resolvers/maker.js");
const address = require("./constant/addresses.js");
const ABI = require("./constant/abis.js");
const tokens = require("./constant/tokens.js");

module.exports = class DSA {
  /**
   * @param config // === web3
   * OR
   * @param config.web3
   */
  constructor(config) {
    this.address = address;
    this.ABI = ABI;
    this.tokens = tokens;
    this.instance = {
      id: 0,
      address: address.genesis,
      version: 1,
      origin: address.genesis,
    };
    this.web3 = config.web3 ? config.web3 : config;
    this.helpers = new Helpers();
    this.internal = new Internal(this);
    this.balances = new Balances(this);
    this.compound = new Compound(this);
    this.maker = new Maker(this);
  }

  /**
   * sets the current DSA ID
   */
  setInstance(_o) {
    if (_o.id) this.instance.id = _o.id; // DSA ID
    if (_o.address) this.instance.address = _o.address;
    if (_o.version) this.instance.version = _o.version;
    if (_o.origin) this.instance.origin = _o.origin;
  }

  /**
   * build new DSA
   * @param {address} _d.owner (optional)
   * @param {address} _d.origin (optional)
   * @param {address} _d.from (optional)
   * @param {number|string} _d.gasPrice (optional)
   * @param {number|string} _d.gas (optional)
   */
  async build(_d) {
    let _addr = await this.internal.getAddress();
    if (!_d) _d = {};
    if (!_d.owner) _d.owner = _addr;
    if (!_d.version) _d.version = 1;
    if (!_d.origin) _d.origin = this.instance.origin;
    if (!_d.from) _d.from = _addr;
    var _c = await new this.web3.eth.Contract(
      this.ABI.core.index,
      this.address.core.index
    );
    return new Promise(function (resolve, reject) {
      return _c.methods
        .build(_d.owner, _d.version, _d.origin)
        .send(_d)
        .on("transactionHash", (txHash) => {
          resolve(txHash);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  /**
   * global number of DSAs
   */
  async count() {
    var _c = new this.web3.eth.Contract(
      this.ABI.core.list,
      this.address.core.list
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .accounts()
        .call({ from: this.address.genesis })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects for addresses owned by the address
   * @param _authority the ethereum address
   */
  async getAccounts(_authority) {
    if (!_authority) _authority = await this.internal.getAddress();
    var _c = new this.web3.eth.Contract(
      this.ABI.resolvers.core,
      this.address.resolvers.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAuthorityDetails(_authority)
        .call({ from: this.address.genesis })
        .then((_d) => {
          var _l = _d.IDs.length;
          var accounts = [];
          for (var i = 0; i < _l; i++) {
            accounts.push({
              id: _d.IDs[i],
              address: _d.accounts[i],
              version: _d.versions[i],
            });
          }
          resolve(accounts);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns token balance in a mapped object with balance and raw balances
   * @param _addr the ethereum address to get balances for
   */
  async getTokenBalancesByAddress(_addr) {
    var _c = new this.web3.eth.Contract(
      this.ABI.resolvers.balances,
      this.address.resolvers.balances
    );

    const tokensInfo = tokens.getList({ type: "token" });
    const tokenAddresses = tokens.getDataList({
      type: "token",
      field: "address",
    });

    return new Promise((resolve, reject) => {
      return _c.methods
        .getBalances(_addr, tokenAddresses)
        .call({ from: this.address.genesis })
        .then((rawBalances) => {
          var _b = rawBalances.reduce((map, rawBalance, index) => {
            if (rawBalance == 0) {
              return map;
            }
            var sym = tokensInfo[index].symbol;
            map[sym] = rawBalance / 10 ** tokensInfo[index].decimals;
            return map;
          }, {});
          resolve(_b);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects
   * @param _id the DSA number
   */
  async getAuthById(_id) {
    var _c = new this.web3.eth.Contract(
      this.ABI.resolvers.core,
      this.address.resolvers.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getIDAuthorities(_id)
        .call({ from: this.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects
   * @param _id the DSA address
   */
  async getAuthByAddress(_addr) {
    var _c = new this.web3.eth.Contract(
      this.ABI.resolvers.core,
      this.address.resolvers.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAccountAuthorities(_addr)
        .call({ from: this.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * execute all the spells
   * @param _d the spells instance
   * OR
   * @param _d.spells the spells instance
   * @param _d.origin (optional)
   * @param _d.to (optional)
   * @param _d.from (optional)
   * @param _d.value (optional)
   * @param _d.gasPrice (optional)
   * @param _d.gas (optional)
   */
  async cast(_d) {
    let _addr = await this.internal.getAddress();
    let _espell = this.internal.encodeSpells(_d);
    if (!_d.to) _d.to = this.instance.address;
    if (!_d.from) _d.from = _addr;
    if (!_d.origin) _d.origin = this.instance.origin;
    var _c = new this.web3.eth.Contract(
      this.ABI.core.account,
      this.instance.address
    );
    return new Promise(function (resolve, reject) {
      return _c.methods
        .cast(..._espell, _d.origin)
        .send(_d)
        .on("transactionHash", (txHash) => {
          resolve(txHash);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  /**
   * returns the estimate gas cost
   * @param _d.connector the from address
   * @param _d.method the to address
   * @param _d.args the ABI interface
   */
  async estimateCastGas(_d) {
    var _internal = this.internal;
    var _args = _internal.encodeSpells(_d);
    _args.push(this.instance.origin);
    if (!_d.to) _d.to = this.instance.address;
    if (!_d.from) _d.from = await _internal.getAddress();
    if (!_d.value) _d.value = "0";
    var _abi = _internal.getInterface("core", "account", "cast");
    var _obj = {
      abi: _abi,
      args: _args,
      from: _d.from,
      to: _d.to,
      value: _d.value,
    };
    return new Promise(function (resolve, reject) {
      _internal
        .estimateGas(_obj)
        .then((gas) => {
          console.log(gas);
          resolve(gas);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns the encoded cast ABI byte code to send via a transaction or call.
   * @param _d the spells instance
   * OR
   * @param _d.spells the spells instance
   * @param _d.to (optional) the address of the smart contract to call
   * @param _d.origin (optional) the transaction origin source
   */
  encodeCastABI(_d) {
    let _enodedSpell = this.internal.encodeSpells(_d);
    if (!_d.to) _d.to = this.instance.address;
    if (!_d.origin) _d.origin = this.instance.origin;
    let _contract = new this.web3.eth.Contract(this.ABI.core.account, _d.to);
    return _contract.methods.cast(..._enodedSpell, _d.origin).encodeABI();
  }

  /**
   * creating a new spell instance
   */
  Spell() {
    return new (class Spell {
      /**
       * empty spells array
       */
      constructor() {
        this.data = [];
      }

      /**
       * add new spells
       * @param _d.connector the from address
       * @param _d.method the to address
       * @param _d.args the ABI interface
       */
      add(_s) {
        if (!_s.connector) return console.error(`connector not defined.`);
        if (!_s.method) return console.error(`method not defined.`);
        if (!_s.args) return console.error(`args not defined.`);
        this.data.push(_s);
      }
    })();
  }

  /**
   * to call read functions and get raw data return
   */
  async read(_s) {
    var _c = new this.web3.eth.Contract(
      this.ABI.read[_s.protocol],
      this.address.read[_s.protocol]
    );
    return new Promise(function (resolve, reject) {
      return _c.methods[_s.method](..._s.args)
        .call()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
