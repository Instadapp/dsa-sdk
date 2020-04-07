const Helpers = require("./helpers.js");
const Internal = require("./internal.js");
const { address, ABI, token } = require("./constant.js");

module.exports = class DSA {
  constructor() {
    this.instance = {
      id: 0,
      address: address.genesis,
      version: 1,
      origin: address.genesis,
    };
    this.spells = [];
    this.ABI = ABI;
    this.address = address;
    this.token = token;
    this.helpers = new Helpers();
    this.internal = new Internal();
  }

  /**
   * returns the current DSA ID
   */
  getInstance() {
    return this.instance;
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
   */
  async build(_d) {
    let _addr = await this.internal.checkAddress();
    if (!_d) _d = {};
    if (!_d.owner) _d.owner = _addr;
    if (!_d.version) _d.version = 1;
    if (!_d.origin) _d.origin = this.instance.origin;
    if (!_d.from) _d.from = _addr;
    var _c = await new web3.eth.Contract(ABI.core.index, address.core.index);
    return new Promise(async function (resolve, reject) {
      return await _c.methods
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
    var _c = new web3.eth.Contract(ABI.core.list, address.core.list);
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .accounts()
        .call({ from: address.genesis })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects
   */
  async getAccounts(_owner) {
    if (!_owner) _owner = await this.internal.checkAddress();
    var _c = new web3.eth.Contract(ABI.resolvers.core, address.resolvers.core);
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .getOwnerDetails(_owner)
        .call({ from: address.genesis })
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
   * returns authentications by DSA ID
   */
  async getAuthorities(_id) {
    if (!_id) _id = this.instance.id;
    var _c = new web3.eth.Contract(ABI.resolvers.core, address.resolvers.core);
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .getIDOwners(_id)
        .call({ from: address.genesis })
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
   */
  async cast(_d) {
    let _addr = await this.internal.checkAddress();
    if (!_d.from) _d.from = _addr;
    let _espell = this.internal.encodeSpells(_d);
    let _ta = _espell[0];
    let _eda = _espell[1];
    let _o = this.instance.origin;
    var _c = new web3.eth.Contract(ABI.core.account, this.instance.address);
    return new Promise(async function (resolve, reject) {
      return await _c.methods
        .cast(_ta, _eda, _o)
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
   * estimate cast gas cost
   */
  async castGas(_d) {
    var _addr = await this.internal.checkAddress();
    var _dsa_addr = this.instance.address;
    var _args = this.internal.encodeSpells(_d);
    _args.push(this.instance.origin);
    if (!_d.to) _d.to = _dsa_addr;
    if (!_d.from) _d.from = _addr;
    if (!_d.value) _d.value = "0";
    var _abi = this.internal.getInterface("core", "account", "cast");
    var _obj = {
      abi: _abi,
      args: _args,
      from: _d.from,
      to: _d.to,
      value: _d.value,
    };
    return new Promise(async function (resolve, reject) {
      await this.helpers
        .getGasLimit(_obj)
        .then((gas) => {
          resolve(gas);
        })
        .catch((err) => {
          reject(err);
        });
    });
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
        this.spells = [];
      }

      /**
       * add new spells
       */
      add(_s) {
        if (!_s.connector) return console.error(`connector not defined.`);
        if (!_s.method) return console.error(`method not defined.`);
        if (!_s.args) return console.error(`args not defined.`);
        this.spells.push(_s);
      }
    })();
  }

  /**
   * to call read functions and get raw data return
   */
  async read(_s) {
    var _c = new web3.eth.Contract(
      ABI.read[_s.protocol],
      address.read[_s.protocol]
    );
    return new Promise(async function (resolve, reject) {
      return await _c.methods[_s.method](..._s.args)
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
