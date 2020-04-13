# DSA SDK documentation

DSA SDK simplify building DeFi apps and interact with defi smart account without handling all the complexities.

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
<script src="https://cdn.jsdelivr.net/npm/dsa-sdk@1.2.3/build/dsa.js"></script>
```

For production, we recommend linking to a specific version number ([jsdeliver](https://www.jsdelivr.com/package/npm/dsa-sdk)).

## Usage

Currently, this SDK only works with [web3 library](https://github.com/ethereum/web3.js/#installation)

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
const Web3 = require('web3')
const DSA = require('dsa-sdk');
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
   * `data` - The spell instance.
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

# Resolvers

Resolvers functions for Protocols & balances. These function will provide you all the essential protocol details to move forward with the integration. Details like:-

## Balances

### .getBalances()

Get the balances for the tokens of a specific Ethereum address.

```js
dsa.balances.getBalances(address, type)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
`address` (optional) - An ethereum address. Eg:- "0xa7...3423". Default:- DSA address selected at the time of setup.
`type` (optional) - Balances of what type of tokens. Default:- "token". List of types of tokens currently available:-
* "token" - Normal Tokens. Eg:- ETH, DAI, USDC, etc.
* "ctoken" - Compound interest bearing CTokens. Eg:- CETH, CDAI, CUSDC, etc.
* "all" - Get Balances of all the tokens in the list.

### Returns
`List` of tokens, where the key is the symbol and the value is the formatted balance {eth: 2, dai: 50.1}


## MakerDAO

## .getPosition()

Get all the vaults details needed for address in one call.

```js
dsa.balances.getVaults(address)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
`address` (optional) - An ethereum address. Eg:- "0xa7...3423". Default:- DSA address selected at the time of setup.

### Returns
`List` of all things Compound. Eg:-
* `owner` - Owner of the Vault. Same as address parameter.
* `colName` - Collateral type. Eg:- ETH-A, BAT-A, USDC-A, etc.
* `token` - Collateral token. Eg:- ETH, BAT, USDC, etc.
* `col` - Collateral Deposited.
* `debt` - DAI Borrowed.
* `liquidatedCol` - Remaining colletral after Vault got liquidated. (unlock collateral - still in vault but not being used as collateral)
* `rate` - Borrow APY.
* `price` - Collateral Token Price from Maker's oracle.
* `status` - Debt / Collateral ratio.
* `liquidation` - Point at which vault will break. When `status` > `liquidation` vault breaks.
* `urn` - Vault Ethereum address.
```js
{ '7903':
  { owner: '0x981C549A74Dc36Bd82fEd9097Bc19404E8db14f3',
    colName: 'ETH-A',
    token: 'ETH',
    col: 0.4,
    debt: 25.001729254489607,
    liquidatedCol: 0,
    rate: 0.5001431422658964,
    price: 154.168734,
    status: 0.4054280106900535,
    liquidation: 0.6666666666666667,
    urn: '0xcC0e5E76eC81aD472D6Df9fC83eaE22E1000Fe53' },
  { ... } ...
}
```


## Compound Finanace

## .getPosition()

Get all the details needed for Compound integration in one call.

```js
dsa.balances.getBalances(address, key)
  .then(data => {
    return data
  })
  .catch(error => {
    return error
  })
```

### Parameters
`address` (optional) - An ethereum address. Eg:- "0xa7...3423". Default:- DSA address selected at the time of setup.
`key` (optional) - key for the object is it going to return. Default:- "token". Eg:- {eth: {...}} or {ceth: {...}} or {"0x..23": {...}}. List of key available.
* "token" - key as underlying token symbol of ctoken. For ceth it's eth. Eg:- {eth: {...}}
* "ctoken" - key as ctoken symbol. Eg:- {ceth: {...}}
* "address" - key as underlying token address of ctoken. Eg:- {"0x...24": {...}}
* "caddress" - key as ctoken address. Eg:- {"0x...32": {...}}

### Returns
`List` of all things Compound. Eg:-
* `priceInEth` - Tokens price from Compound oracle contracts. Prices are w.r.t "ETH" not "USD".
* `exchangeRate` - CToken to token conversion rate. `CToken balance` * `exchangeRate` = `token balance`.
* `supply` - token balance supplied/deposited.
* `borrow` - token balance borrowed.
* `supplyRate` - Supply APR.
* `supplyYield` - Supply APY.
* `borrowRate` - Borrow APR.
* `borrowYield` - Borrow APY.
* `borrowYield` - Borrow APY.
* `totalSupplyInEth` - Total supply in ETH not in USD. 
* `totalBorrowInEth` - Total borrow in ETH not in USD.
* `maxBorrowLimitInEth` - Max borrow limit in ETH not in USD.
* `status` - `totalBorrowInEth` / `totalSupplyInEth`.
* `liquidation` - `maxBorrowLimitInEth` / `totalSupplyInEth`.
```js
{ eth:
  { priceInEth: 1,
    exchangeRate: 200117674.2320281,
    supply: 0.20000024558102408,
    borrow: 0,
    supplyRate: 0.0098989117776,
    supplyYield: 0.009899400394752789,
    borrowRate: 2.05355820729888,
    borrowYield: 2.0747298274359505 },
  { ... } ...,
  totalSupplyInEth: 0.20000024558102408,
  totalBorrowInEth: 0.08513266988268917,
  maxBorrowLimitInEth: 0.15000018418576805,
  status: 0.4256628267398813,
  liquidation: 0.7499999999999999
}
```


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