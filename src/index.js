import Core from "./core.js";
import helpers from "./helpers.js";
import constant from "./constant.js";
import compound from "./protocols/compound.js";

export default class DSA extends Core {
  constructor() {
    this.constant = constant;
    this.helpers = helpers;
    this.compound = compound;
  }
}
