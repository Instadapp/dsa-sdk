# DeFi Smart Account SDK

## Documentation
<link to docs>

## Installation
Install the package from [NPM](https://www.npmjs.com/package/dexag-sdk)

```
npm install dsa-sdk
```

## Usage
```
import DSA from 'dsa-sdk';
const dsa = new DSA({});
```

## Get ID by DSA address
```
await dsa.getID({dsa-address: '0x...'});
```

## Get Authorities by DSA address
```
await dsa.getAuth({dsa-address: '0x...'});
```

## Get DSA addresses by Authorities
```
await dsa.getDSAByAuth({authority: '0x...'});
```