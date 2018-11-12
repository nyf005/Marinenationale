const AccessControl = require("accesscontrol");

// Account, Training, Information, Actualité,

const ac = new AccessControl();
ac.grant("marin") // switch to another role without breaking the chain
  .readOwn(["account", "training"])
  .readAny(["information", "actualite"])
  .createOwn("training")
  .updateOwn(["account", "training"])
  .deleteOwn("training")

  .grant("operateur_brh") // switch to another role without breaking the chain
    .extend("marin") // inherit role capabilities. also takes an array
    .readAny("account", ["*", "!password"])
    .createAny("account") // equivalent to .createOwn('video', ['*'])

  .grant("admin_chef_brh") // switch to another role without breaking the chain
    .extend("operateur_brh") // inherit role capabilities. also takes an array
    .createAny("account") // equivalent to .createOwn('video', ['*'])
    .updateAny("created_account")
    .deleteAny("account")

  .grant("operateur_beo") // switch to another role without breaking the chain
    .extend("marin") // inherit role capabilities. also takes an array
    .readAny("account", ["*", "!password"])
    .createAny("information") // equivalent to .createOwn('video', ['*'])
    .updateOwn("information")
    .deleteOwn("information")

  .grant("operateur_ucsma") // switch to another role without breaking the chain
    .extend("marin") // inherit role capabilities. also takes an array
    .createAny("information") // equivalent to .createOwn('video', ['*'])
    .updateOwn("information")
    .deleteOwn("information")
  
  .grant("operateur_comm") // switch to another role without breaking the chain
    .extend("marin") // inherit role capabilities. also takes an array
    .createAny("actualite") // equivalent to .createOwn('video', ['*'])
    .updateAny("actualite")
    .deleteAny("actualite")

  .grant("super_admin") // define new or modify existing role. also takes an array.
    .extend(["admin_chef_brh", "operateur_beo", "operateur_ucsma", "operateur_comm"])
    .createAny(["rank", "unite", "service"]) // equivalent to .createOwn('video', ['*'])
    .readAny(["rank", "unite", "service"])
    .updateAny(["rank", "unite", "service"])
    .deleteAny(["rank", "unite", "service"]);

module.exports = ac;