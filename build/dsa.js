const address = {
  genesis: "0x0000000000000000000000000000000000000000",
  core: {
    index: "0x2971AdFa57b20E5a416aE5a708A8655A9c74f723",
    list: "0x4c8a1BEb8a87765788946D6B19C6C6355194AbEb",
  },
  resolver: {
    core: "0xD6fB4fd8b595d0A1dE727C35fe6F1D4aE5B60F51",
  },
};

const ABI = {
  INDEX_CORE: [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"origin","type":"address"}],"name":"LogAccountCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_newAccount","type":"address"},{"indexed":true,"internalType":"address","name":"_connectors","type":"address"},{"indexed":true,"internalType":"address","name":"_check","type":"address"}],"name":"LogNewAccount","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"accountVersion","type":"uint256"},{"indexed":true,"internalType":"address","name":"check","type":"address"}],"name":"LogNewCheck","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"master","type":"address"}],"name":"LogNewMaster","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"master","type":"address"}],"name":"LogUpdateMaster","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"account","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newAccount","type":"address"},{"internalType":"address","name":"_connectors","type":"address"},{"internalType":"address","name":"_check","type":"address"}],"name":"addNewAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"accountVersion","type":"uint256"},{"internalType":"address","name":"_origin","type":"address"}],"name":"build","outputs":[{"internalType":"address","name":"_account","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"accountVersion","type":"uint256"},{"internalType":"address[]","name":"_targets","type":"address[]"},{"internalType":"bytes[]","name":"_datas","type":"bytes[]"},{"internalType":"address","name":"_origin","type":"address"}],"name":"buildWithCast","outputs":[{"internalType":"address","name":"_account","type":"address"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"accountVersion","type":"uint256"},{"internalType":"address","name":"_newCheck","type":"address"}],"name":"changeCheck","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMaster","type":"address"}],"name":"changeMaster","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"check","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"connectors","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"version","type":"uint256"},{"internalType":"address","name":"query","type":"address"}],"name":"isClone","outputs":[{"internalType":"bool","name":"result","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"list","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"master","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_master","type":"address"},{"internalType":"address","name":"_list","type":"address"},{"internalType":"address","name":"_account","type":"address"},{"internalType":"address","name":"_connectors","type":"address"}],"name":"setBasics","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateMaster","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"versionCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}],
  LIST_CORE: [{"inputs":[{"internalType":"uint64","name":"","type":"uint64"}],"name":"accountAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"accountID","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"","type":"uint64"}],"name":"accountLink","outputs":[{"internalType":"address","name":"first","type":"address"},{"internalType":"address","name":"last","type":"address"},{"internalType":"uint64","name":"count","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"","type":"uint64"},{"internalType":"address","name":"","type":"address"}],"name":"accountList","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"accounts","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"addAuth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"instaIndex","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"removeAuth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userLink","outputs":[{"internalType":"uint64","name":"first","type":"uint64"},{"internalType":"uint64","name":"last","type":"uint64"},{"internalType":"uint64","name":"count","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint64","name":"","type":"uint64"}],"name":"userList","outputs":[{"internalType":"uint64","name":"prev","type":"uint64"},{"internalType":"uint64","name":"next","type":"uint64"}],"stateMutability":"view","type":"function"}],
  CORE_RESOLVER: [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "connectors", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint64", "name": "id", "type": "uint64" }], "name": "getAccount", "outputs": [{ "internalType": "address", "name": "account", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getAccountOwners", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "accounts", "type": "address[]" }], "name": "getAccountVersions", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getEnabledConnectores", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getID", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "getIDOwners", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getOwnerAccounts", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getOwnerDetails", "outputs": [{ "components": [{ "internalType": "uint64[]", "name": "IDs", "type": "uint64[]" }, { "internalType": "address[]", "name": "accounts", "type": "address[]" }, { "internalType": "uint256[]", "name": "versions", "type": "uint256[]" }], "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getOwnerIDs", "outputs": [{ "internalType": "uint64[]", "name": "", "type": "uint64[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getStaticConnectores", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "index", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "list", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
};
const helpers = {
  
  cleanAddress: function (address) {
    return address.slice(0, 4) + "..." + address.slice(-4);
  },

  cleanTxn: function (txHash) {
    return txHash.slice(0, 6) + "..." + txHash.slice(-6);
  },

  cleanDecimal: function (num, power) {
    var MUL_DIV = 100;
    if (power) {
      MUL_DIV = 10 ** power;
    }
    return Math.floor(Number(num) * MUL_DIV) / MUL_DIV;
  },

  cleanNumber: function (num) {
    if (num > 1000000) {
      var _num = cleanDecimal(num / 1000000);
      return `${_num.toLocaleString()} M`;
    } else if (num > 10000) {
      var _num = cleanDecimal(num / 1000);
      return `${_num.toLocaleString()} K`;
    } else if (!num) {
      return "0.00";
    }
    return cleanDecimal(num).toLocaleString();
  },

  bigNumInString: function (x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split("e-")[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = "0." + new Array(e).join("0") + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split("+")[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join("0");
      }
    }
    return x;
  }

};

class DSA {
  constructor() {
    this.constant = constant;
    this.helpers = helpers;
  }

  /**
   * Build new DSA
   */
  async build(_d) {
    var _a = web3.currentProvider.selectedAddress;
    if (!_d) _d = {};
    if (!_d.owner) _d.owner = _a;
    if (!_d.version) _d.version = 1;
    if (!_d.origin) _d.origin = address.genesis;
    var _c = new web3.eth.Contract(ABI.INDEX_CORE, address.index);
    return _c.methods
      .build(_d.owner, _d.version, _d.origin)
      .send({
        from: _a,
      })
      .on("transactionHash", (txHash) => {
        console.log(`txHash: ${txHash}`);
        return txHash;
      });
  }

  /**
   * Global number of DSAs
   */
  async count() {
    var _c = new web3.eth.Contract(ABI.LIST_CORE, address.list);
    return _c.methods
      .accounts()
      .call()
      .then((count) => {
        return count;
      });
  }

  /**
   * returns accounts in an simple array of objects
   */
  async getAccounts(_owner) {
    var _c = new web3.eth.Contract(ABI.CORE_RESOLVER, address.core);
    return _c.methods
      .getOwnerDetails(_owner)
      .call({ from: address.genesis })
      .then((raw_data) => {
        numberOfAccounts = raw_data.IDs.length;
        accounts = new Array(numberOfAccounts);
        for (var i = 0; i < numberOfAccounts; i++) {
          accounts[i] = [];
        }
        raw_data.IDs.forEach((v, i) => {
          accounts[i].id = v;
        });
        raw_data.accounts.forEach((v, i) => {
          accounts[i].account_id = v;
        });
        raw_data.versions.forEach((v, i) => {
          accounts[i].version = v;
        });
        return accounts;
      });
  }

  /**
   * returns authentications by accountID
   */
  async getAuthentications(_id) {
    var _c = new web3.eth.Contract(ABI.CORE_RESOLVER, address.instaread);
    return _c.methods.getIDOwners(_id).call({ from: address.genesis });
  }

}
