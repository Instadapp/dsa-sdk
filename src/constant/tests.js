// let spells = dsa.Spell();

// let daiAmt = 1; // 100 DAI
// let daiAmtInWei = dsa.tokens.fromDecimal(daiAmt, "dai"); // 100 DAI in Wei
// let slippage = 0.1; // 0.1% slippage.
// let daiAddr = dsa.tokens.info.dai.address;

// // Resolver function to get `uintAmt` value. 
// // You can use above resolver documentation for reference. 
// let depositDetails = await dsa.curve_y.getDeposit("DAI", daiAmtInWei, slippage);

// let storeId = "8018367"

// spells.add({
//   connector: "curve-y",
//   method: "deposit",
//   args: [daiAddr, daiAmtInWei, depositDetails.unitAmt, storeId, 0]
// });

// await dsa.setAccount(6)
// // Note: Make sure you have set DSA instance.
// // If not, follow this to setup: https://docs.instadapp.io/setup/
// await dsa.cast(spells);


let spells = dsa.Spell();

let usdcAmt = 19710;
let daiAmt = 19406;
let usdcAmtInWei = dsa.tokens.fromDecimal(usdcAmt, "usdc");
let slippage = 0.1; // 0.1% slippage.
let daiAddr = dsa.tokens.info.dai.address;

// Resolver function to get `uintAmt` value. 
// You can use above resolver documentation for reference. 
let buyAmount = await dsa.oneInch.getBuyAmount("DAI", "USDC", usdcAmt, slippage);

let storeId = "8018367"

spells.add({
  connector: "instapool",
  method: "flashBorrow",
  args: [dsa.tokens.info.usdc.address, usdcAmtInWei, 0, 0]
});

spells.add({
  connector: "oneInch",
  method: "sellTwo",
  args: [dai_address, usdc_address , usdcAmtInWei, buyAmount.unitAmt, buyAmount.distribution, 0, 0, 0]
});

spells.add({
  connector: "maker",
  method: "payback",
  args: ["12255", "-1", 0, 0]
});

spells.add({
  connector: "maker",
  method: "withdraw",
  args: ["12255", usdcAmtInWei, 0, 0]
});

spells.add({
  connector: "instapool",
  method: "flashPayback",
  args: [dsa.tokens.info.usdc.address, 0, 0]
});

await dsa.setAccount(6)
// Note: Make sure you have set DSA instance.
// If not, follow this to setup: https://docs.instadapp.io/setup/
await dsa.cast(spells);