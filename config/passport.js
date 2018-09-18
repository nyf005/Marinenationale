const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Load User model
const User = mongoose.model("users");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "mecano" }, (mecano, password, done) => {
      User.findOne({
        mecano: mecano
      })
        .populate("unite")
        .populate("service")
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: `Vous n'êtes pas autorisé à accéder l'espace membre`
            });
          }

          // Répétitif mais préfère laisser
          if (!user.password) {
            return done(null, false, {
              message:
                `Connectez vous d'abord avec le mot de passe par défaut pour renseigner vos informations`
            });
          }

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: `Mot de passe incorrect` });
            }
          });
        });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // passport.deserializeUser((id, done) => {
  //   User.findById(id).then(user => done(null, user));
  // })

  passport.deserializeUser(function(id, done) {
    User.findById(id)
      .populate("unite")
      .populate("service")
      .exec(function(err, user) {
        done(err, user);
      });
  });
};
