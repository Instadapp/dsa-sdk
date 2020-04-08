# Developing on DSA
We empower third-party developers to build dapps, use-cases, and other integrations on DSA’s platform. That way, users can get curated experience as per their needs, and developers can build their own businesses supporting those users. This virtuous circle creates new opportunities and benefits users, developers, and protocols.

Our team is super active to assist you with all of your queries at our [TG developer group](https://t.me/instadevelopers) or [discord channel](https://discord.gg/83vvrnY).

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

## .getAccounts()

Get all the DSA where a specific address is authorised.

```js
let address = "0x...";
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
`Array` of `Object` with all the DSA where `address` parameter is authorised.

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

Once you get the DSA(s), set some common values so you don't have to pass similar arguments in further calls.

```js
let address = "0x...";
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


## Build DSA

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

## Interact with DSA

Once the DSA is build, use the following function to make calls to your DSA. This is where you'll interact with other smart contracts like DeFi protocols.

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

Note: You can get the specific input interface by calling `dsa.getInterface(connector, method)`

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
   * `from` - `String` (optional): The address transactions should be made from (defaulted to selected address).
   * `gasPrice` - `String` (optional): The gas price in wei to use for transactions.
   * `gas` - `Number` (optional): The maximum gas provided for a transaction (gas limit).

### Returns
`String`: Transaction hash `0x.....`.

Our team is super active to assist you with all of your queries at our [TG developer group](https://t.me/instadevelopers) or [discord channel](https://discord.gg/83vvrnY).