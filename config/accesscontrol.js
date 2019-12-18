const AccessControl = require("accesscontrol");

// Account, Training, Information, Actualité,

const ac = new AccessControl();
ac.grant("marin") // switch to another role without breaking the chain
  .readOwn(["account", "training"])
  .readAny(["information", "actualite"])
  .updateOwn("account")

  .grant("operateur_brh") // switch to another role without breaking the chain
  .extend("marin") // inherit role capabilities. also takes an array
  .readAny("account", ["*", "!password"])
  .createAny(["account", "information"]) // equivalent to .createOwn('video', ['*'])
  .updateAny("created_account")
  .updateOwn("information")
  .deleteOwn("information")

  .grant("operateur_bo") // switch to another role without breaking the chain
  .extend("marin") // inherit role capabilities. also takes an array
  .readAny("account", ["*", "!password"])
  .createAny("information") // equivalent to .createOwn('video', ['*'])
  .updateOwn("information")
  .deleteOwn("information")

  .grant("operateur_bes") // switch to another role without breaking the chain
  .extend("marin") // inherit role capabilities. also takes an array
  .readAny("account", ["*", "!password"])
  .readAny("training")
  .createAny(["information", "training"]) // equivalent to .createOwn('video', ['*'])
  .updateOwn("information")
  .deleteOwn("information")
  .updateAny("training")
  .deleteAny("training")

  .grant("operateur_cmg")
  .extend("marin")
  .readAny("movement", ("account", ["*", "!password"]))
  .createAny("movement")
  .updateAny("movement")
  .deleteAny("movement")

  .grant("operateur_ucsma") // switch to another role without breaking the chain
  .extend("marin") // inherit role capabilities. also takes an array
  .createAny("information") // equivalent to .createOwn('video', ['*'])
  .updateOwn("information")
  .deleteOwn("information")

  .grant("operateur_comm") // switch to another role without breaking the chain
  .extend("marin") // inherit role capabilities. also takes an array
  .createAny(["actualite", "photo"]) // equivalent to .createOwn('video', ['*'])
  .updateAny("actualite")
  .deleteAny(["actualite", "photo"])

  .grant("super_admin") // define new or modify existing role. also takes an array.
  .extend([
    "operateur_brh",
    "operateur_bo",
    "operateur_bes",
    "operateur_cmg",
    "operateur_ucsma",
    "operateur_comm"
  ])
  .createAny(["rank", "unite", "service"]) // equivalent to .createOwn('video', ['*'])
  .readAny(["rank", "unite", "service"])
  .updateAny(["rank", "unite", "service"])
  .updateOwn("information")
  .deleteAny(["rank", "unite", "service", "account"]);

module.exports = ac;
