
# Installation
To get started, install the DSA SDK package from NPM:

```javascript
npm  install  dsa-sdk
```
For browsers, via jsDelivr CDN:
```html
<script  src="https://cdn.jsdelivr.net/npm/dsa-sdk@latest/build/dsa.min.js"></script>
```
For production, we recommend linking to a specific version number ([jsdeliver](https://www.jsdelivr.com/package/npm/dsa-sdk))

## Usage

To enable web3 calls via SDK, instigate [web3 library](https://github.com/ethereum/web3.js/#installation).
```javascript
// in browser
if (window.ethereum) {
  window.web3 = new  Web3(window.ethereum)
} else  if (window.web3) {
  window.web3 = new  Web3(window.web3.currentProvider)
} else {
  window.web3 = new  Web3(customProvider)
}

// in nodejs
const  Web3 = require('web3')
const  DSA = require('dsa-sdk');
const  web3 = new  Web3(new  Web3.providers.HttpProvider(ETH_NODE_URL))
```

 
Now instigate DSA with web3 instance.

```javascript

// in browser
const  dsa = new  DSA(web3);

// in nodejs
const  dsa = new  DSA({
  web3:  web3,
  mode:  "node",
  privateKey:  PRIVATE_KEY
});
```


# Setup Account

Every user needs to create Smart Account to interact with DeFi Protocols seamlessly; this allows developers to build extensible use-cases with maximum security and composability. You can also create multiple accounts for a single address.

- Create Smart Account - `build()`
- Fetch Smart Accounts - `getAccounts()`
- Set Smart Account - `setInstance()`
---

### getAccounts()

Fetch all the accounts owned by an ethereum address by calling `getAccounts()`.

```javascript
dsa.getAccounts(address).then(console.log);
```


  

#### Returns

`Array` of `Object` with all the DSA where `address` is authorised:

```javascript
[
  {
  	id:  52, // DSA Number
  	address:  "0x...", // DSA Address
  	version:  1  // DSA version
  },
	...
]

```
---

### build()

If the above function returns an empty array OR if a use-case requires you to create multiple accounts, trigger `build()` method.

```javascript
dsa.build().then(console.log);
```

The build method also accepts an optional `Object` parameter as shown below:

```javascript
dsa.build({
  gasPrice:  gasPrice  // estimate gas price: https://gist.github.com/thrilok209/8b19dbd8d46b2805ab8bb8973611aea2
  origin: origin,
  authority:  authority,
})
```

The build method also accepts **optional**  `Object` parameter as shown below. You can also checkout [our gist](https://gist.github.com/Sowmayjain/64690959985a1b47715c79f49ac79a34) for the implementation of this method.

```javascript
dsa.build({
  gasPrice: web3.utils.toWei(gasPrice, 'gwei'), // estimate gas price*
  origin: origin,
  authority: authority,
  from: from,
  nonce: nonce
})
```
* View our [Gist](https://gist.github.com/thrilok209/8b19dbd8d46b2805ab8bb8973611aea2) for estimation of gas price.

#### Returns

`string`: Transaction hash.

This creates a uniquely numbered Smart Account which acts as a proxy to interact with verified DeFi protocols and each DSA has a unique ethereum address.

---
### setInstance()

Be sure to configure global values by calling `setInstance()`. You can get the `id` by calling `getAccounts()`. The configured account will be used for all subsequent calls.

```javascript
dsa.setInstance(dsaId); // DSA ID
```


## Transfer Tokens

Now that you have an account setup, transfer assets to your DSA address, which can be eventually used as collateral, liquidity, et cetera in DeFi protocols. Developers can trigger the ETH / Token transfer by calling a SDK method - [dsa.transfer()]([https://docs.instadapp.io/basic/#dsatransfer](https://docs.instadapp.io/basic/#dsatransfer)). Alternatively, call `transfer()` method from the respective ERC20 token contract.

# UseCase(Short DAI)

The DSA will cast the spells across the [MakerDAO](https://docs.instadapp.io/connectors/makerdao/), [OasisDEX](https://docs.instadapp.io/connectors/oasis/) and [Instapool](https://docs.instadapp.io/connectors/instapool/) connectors in the following sequence.

##### Benefits
* When DAI > $1. Arbitrage benefit due to price difference of DAI & USDC.
* Help make DAI stable.

##### Recipe
1.  **Instapool**: borrow DAI
2.  **OasisDEX**: swap DAI with USDC
3.  **MakerDAO**: open USDC vault
4.  **MakerDAO**: deposit USDC in vault
5.  **MakerDAO**: borrow DAI from vault
6.  **Instapool**: payback DAI


##### Requirements
* User should have base amount of USDC to perform the leverage. Liquidation on Compound is 83.33% which means for 1 DAI borrowed, user needs to have the balance of 0.25 USDC for collateral to perform this spell.
* Minimum debt required to open a vault is 20 DAI.

```javascript
let  borrowAmount = 20; // 20 DAI
let  borrowAmtInWei = dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

let  slippage = 2; // 2% slippage.
let  dai_address = dsa.tokens.info.dai.address
let  usdc_address = dsa.tokens.info.usdc.address

let  buyAmount = await  dsa.oasis.getBuyAmount("USDC", "DAI", borrowAmount, slippage);

let  spells = dsa.Spell();

spells.add({
  connector:  "instapool",
  method:  "flashBorrow",
  args: [dai_address, borrowAmtInWei, 0, 0]
});

spells.add({
  connector:  "oasis",
  method:  "sell",
  args: [usdc_address, dai_address, borrowAmtInWei, buyAmount.unitAmt, 0, 0]
});

spells.add({
  connector:  "maker",
  method:  "open",
  args: ["USDC-A"]
});

spells.add({
  connector:  "maker",
  method:  "deposit",
  args: [0, -1, 0, 0] // deposit all USDC
});

spells.add({
  connector:  "maker",
  method:  "borrow",
  args: [0, borrowAmtInWei, 0, 0]
});

spells.add({
  connector:  "instapool",
  method:  "flashPayback",
  args: [dai_address, 0, 0]
});

dsa.cast(spells).then(console.log)
```
