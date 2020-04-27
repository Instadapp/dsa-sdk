# DSA SDK documentation

Before you start reading the readme below, be sure to learn about it from [Instadapp Developer Platform](https://doc.instadapp.io)

- [Get Started](#get-started)
- [Test in browser](#test-in-browser)
- [Contributing](#contributing)
- [Contact](#Contact)

## Get Started

**Node**
To get started, install the DSA SDK package from NPM:

```bash
npm install dsa-sdk
```

**For Browser**

 via jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/dsa-sdk@latest/build/dsa.js"></script>
```

For production, we recommend linking to a specific version number ([jsdeliver](https://www.jsdelivr.com/package/npm/dsa-sdk)).

## Usage

To make web3 calls via DSA SDK, instantiate [web3 library](https://github.com/ethereum/web3.js/#installation).

```js
// in browser
if (window.ethereum) {
  window.web3 = new Web3(window.ethereum)
} else if (window.web3) {
  window.web3 = new Web3(window.web3.currentProvider)
} else {
  window.web3 = new Web3(customProvider)
}

// in node.js
const web3 = new Web3(new Web3.providers.HttpProvider(ETH_NODE_URL))
```

Now instantiate DSA. It is important to note that if you are instantiating this before your web3 is connected, you need to re-instantiate after your web3 is connected.
 
```js
const dsa = new DSA(web3);
```

## .getAccounts()

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
   * `origin` - `String`: The address to track the transaction origination (analytics).


## .transfer()

Transfer tokens. 

```js
dsa.transfer({
	token: "ETH", // name of the token to transfer.
	amount: "1000000000000000000" // amount to transfer in wei.
}).then(data  => {
	return  data  // transaction hash
}).catch(error  => {
	return  error
});
```

### Parameters

1.  `Object` 
  *  `token` - `String`: Name of the token to transfer. Eg: `ETH`,  `DAI` , `USDC`.
  *  `amount` - `String | Number`: Amount of the token to transfer in wei. Can convert to wei using a in-build function `dsa.helpers.toDecimals(token_name, token_amount)`
  *  `from` - `Address` (optional): The address for the sending account. Uses the web3.eth.getAccounts(), if not specified.
  *  `to` - `Address` (optional): The destination address of the transaction. Uses the current DSA instance address declared via `.setInstance()`, if not specified.
  *  `gasPrice` - `String` (optional): The price of gas for this transaction in wei, defaults to web3.eth.gasPrice.
  *  `gas` - `Number` (optional): The amount of gas to use for the transaction (unused gas is refunded). 

### Returns
`String`: Transaction hash `0x.....`.

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
   * `authority`: The DSA authority address (defaulted to selected address).
   * `origin` - `Address`: The address to track the transaction origination (analytics).
   * `from` - `Address`: The address transactions should be made from (defaulted to selected address).
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
 args: [dsa.tokens.info.usdc.address, 1000000, 0, 1] // method arguments
});

spells.add({
 connector: "basic",
 method: "withdraw",
 args: [dsa.tokens.info.usdc.address, 0, "0x03d70891b8994feB6ccA7022B25c32be92ee3725", 1, 0]
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
   * `spells` - The spell instance.
   * `origin` - `Address`: The address to track the transaction origination (analytics).
   * `from` - `Address` (optional):  The address for the sending account. Uses the web3.eth.getAccounts(), if not specified.
   * `to` - `Address` (optional): The destination address of the transaction. Uses the current DSA instance address declared via `.setInstance()`, if not specified.
   * `value` - `Number|String` (optional): The ETH value transferred for the transaction in wei. 
   * `gasPrice` - `String` (optional): The price of gas for this transaction in wei, defaults to web3.eth.gasPrice.
   * `gas` - `Number` (optional): The amount of gas to use for the transaction (unused gas is refunded).

### Returns
`String`: Transaction hash `0x.....`.

## Internals

Following are a few internal functions.

* dsa.internal.getTarget(connector)
* dsa.internal.getInterface(type, name, method)
* dsa.internal.getConnectorInterface(connector, method)
* dsa.internal.encodeMethod(Object)
* dsa.internal.encodeSpells(Object)

## Constants
* dsa.tokens.info (full map of token info)
* dsa.tokens.getList({type})
* dsa.tokens.getDataList({type, field})

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


## Test In Browser

1. Run `npm install` to install needed dependencies
2. Run `npm run dev-server` to start 
3. Navigate to `localhost:8080`
4. Call `InitWeb3()` in debugger console
5. Access the DSA object via `window.dsa`
6. Note that you need to call dsa= new DSA(web3) again. (fix coming up)

## Contributing

1.  Fork and clone it
1.  Install dependencies: `npm install`
1.  Create a feature branch: `git checkout -b new-feature`
1.  Commit changes: `git commit -am 'Added a feature'`
1.  Push to the remote branch: `git push origin new-feature`
1.  Create a new [Pull Request](https://github.com/instadapp/dsa-sdk/pull/new/master)

## Contact

Our team is super active to assist with your queries at our [TG developer group](https://t.me/instadevelopers) or [discord channel](https://discord.gg/83vvrnY).