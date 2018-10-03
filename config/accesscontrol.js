const AccessControl = require("accesscontrol");

const ac = new AccessControl();
ac.grant("membre") // switch to another role without breaking the chain
      .readOwn(["account", "training"])
      .createOwn("training")
      .updateOwn("account")
      .deleteOwn("account")
  .grant("admin") // switch to another role without breaking the chain
    .extend("membre") // inherit role capabilities. also takes an array
      .readAny("account", ["*", "!password"])
      .createAny("account") // equivalent to .createOwn('video', ['*'])
      .updateAny("created_account")
      .deleteAny("account")
  .grant("super_admin") // define new or modify existing role. also takes an array.
    .extend("admin")
      .createAny(["rank", "unite", "service"]) // equivalent to .createOwn('video', ['*'])
      .readAny(["rank", "unite", "service"])
      .updateAny(["rank", "unite", "service"])
      .deleteAny(["rank", "unite", "service"]);

module.exports = ac;
