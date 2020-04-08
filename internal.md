# DSA SDK documentation

DSA SDK makes easy to build DeFi apps and interact with defi smart account without handling all the complexities like managing addresses, ABIs etc.

Our team is super active to assist with your queries at our [TG developer group](https://t.me/instadevelopers) or [discord channel](https://discord.gg/83vvrnY).

## Get Started

**Node**
To get started, install the DSA SDK package from NPM:

```bash
npm install dsa-sdk
```

**For Browser**

 via jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/dsa-sdk@1.2.3/build/dsa.js"></script>
```

For production, we recommend linking to a specific version number ([jsdeliver](https://www.jsdelivr.com/package/npm/dsa-sdk)).

## Usage
Now instantiate DSA.
```js
// in node.js
const dsa = require('dsa-sdk');

const dsa = new DSA();
```

DSA only works with [web3 library](https://github.com/ethereum/web3.js/#installation) so you also have to instantiate Web3.

```js
if (window.ethereum) {
  window.web3 = new Web3(window.ethereum)
} else if (window.web3) {
  window.web3 = new Web3(window.web3.currentProvider)
} else {
  window.web3 = new Web3(customProvider)
}
```

## Get Accounts

Get all the DSA where a specific address is authorised.

```js
dsa.getAccounts(address)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
`address` - An ethereum address.

### Returns
`Array` of `Object` with all the DSA where `address` parameter is authorised as show below:

```js
[
  {
    id: 52, // DSA Number
    address: "0x...", // DSA Address
    version: 1 // DSA version
  },
  ...
]
```

## .setInstance()

Set common values so you don't have to pass similar arguments in further calls.

```js
let dsaAccount = dsa.getAccounts(address);
dsa.setInstance({
  id: dsaAccount[0].id,
  address: dsaAccount[0].account,
  origin: "0x..." // optional
})
```

### Parameters
1. `Object`
   * `id` - `Number`: The number of DSA.
   * `address` - `String`: The address of DSA.
   * `origin` - `String`: The address to track the transaction origination (affiliates).

## .build()

Build a new DSA.

```js
dsa.build()
  .then(data => {
    return data // transaction hash
  })
  .catch(error => {
    return error
  });
```

### Parameters
1. `Object` (ALL optional)
   * `owner`: The authorised address which will be authorised on DSA (defaulted to selected address).
   * `origin` - `String`: The address to track the transaction origination (affiliates).
   * `from` - `String`: The address transactions should be made from (defaulted to selected address).
   * `gasPrice` - `String`: The gas price in wei to use for transactions.
   * `gas` - `Number`: The maximum gas provided for a transaction (gas limit).

### Returns
`String`: Transaction hash `0x.....`.

## .getAuthByAddress()

Get all the authorised address(es) of a DSA by address.

```js
dsa.getAuthByAddress(address)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
`address` - An ethereum address.

### Returns
`Array` of address(es) authorised to make calls the DSA.

## .getAuthById()

Get all the authorised address(es) of a DSA by ID.

```js
dsa.getAuthById(dsaNum)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
`Number` - A DSA Number.

### Returns
`Array` of address(es) authorised to make calls the DSA.

## .spell() & .cast()

Make calls to your DSA to interact with other smart contracts.

Create a new instance.
```js
let spells = dsa.Spell();
```

Add the series of transactions details in the instance.
```js
spells.add({
 connector: "basic", // name
 method: "deposit", // method
 args: [dsa.token.usdc.address, 1000000, 0, 1] // method arguments
});

spells.add({
 connector: "basic",
 method: "withdraw",
 args: [dsa.token.usdc.address, 0, "0x03d70891b8994feB6ccA7022B25c32be92ee3725", 1, 0]
});
```

Note: You can get the specific input interface by calling `dsa.internal.getConnectorInterface(connector, method)`.

Send the transaction to blockchain. CAST YOUR SPELL.

```js
dsa.cast(spells) // or dsa.cast({spells:spells})
  .then(data => {
    return data // transaction hash
  })
  .catch(error => {
    return error
  });
```

### Parameters
1. `Instance` - The spell instance.
OR
1. `Object`
   * `data` - The spell instance.
   * `from` - `Address` (optional):  The address for the sending account. Uses the web3.eth.getAccounts(), if not specified.
   * `to` - `Address` (optional): The destination address of the transaction. Uses the current DSA instance address declared via `.setInstance()`, if not specified.
   * `value` - `Number|String` (optional): The ETH value transferred for the transaction in wei. 
   * `gasPrice` - `String` (optional): The price of gas for this transaction in wei, defaults to web3.eth.gasPrice.
   * `gas` - `Number` (optional): The amount of gas to use for the transaction (unused gas is refunded).

### Returns
`String`: Transaction hash `0x.....`.

<!-- ## .estimateCastGas()

Get the gas limit for a specific `cast()` transaction. This types of calls are used to estimate the gas limit beforehand before initiating the call to estimate the transaction failure.

```js
dsa.estimateCastGas(object)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
1. `Object`
   * `data` - The spell instance.
   * `from` - `Address` (optional):  The address for the sending account. Uses the web3.eth.getAccounts(), if not specified.
   * `to` - `Address` (optional): The destination address of the transaction. Uses the current DSA instance address declared via `.setInstance()`, if not specified.
   * `value` - `Number|String` (optional): The ETH value transferred for the transaction in wei.instance address declared via `.setInstance()`, if not specified.

### Returns
`Array` of address(es) authorised to make calls the DSA. -->

Our team is super active to assist with your queries at our [TG developer group](https://t.me/instadevelopers) or [discord channel](https://discord.gg/83vvrnY).