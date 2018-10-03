const moment = require("moment");
const cloudinary = require("cloudinary");
const ac = require("../config/accesscontrol");

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("errors_msg", `Vous n'êtes pas autorisé à accéder à cette page.`);
    res.redirect("/");
  },
  
  dateFormat: function(date, format) {
    var dateObj = new Date(date);
    var momentObj = moment(dateObj);
    var momentString = momentObj.format(format);
    return momentString;
  },

  formatDate: function(date, format, local) {
    return moment(date)
      .locale(local)
      .format(format);
  },

  select: function(selected, options) {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp(">" + selected + "</option>"),
        ' selected="selected"$&'
      );
  },

  checkGrant: function(statut, checkValue, ressource, req, res) {
    let permission;
    switch (checkValue) {
      case "createAny":
        permission = ac.can(statut).createAny(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "createOwn":
        permission = ac.can(statut).createOwn(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "readAny":
        permission = ac.can(statut).readAny(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "readOwn":
        permission = ac.can(statut).readOwn(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "updateAny":
        permission = ac.can(statut).updateAny(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "updateOwn":
        permission = ac.can(statut).updateOwn(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "deleteAny":
        permission = ac.can(statut).deleteAny(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      case "deleteOwn":
        permission = ac.can(statut).deleteOwn(ressource);
        if (!permission.granted) {
          req.flash(
            "errors_msg",
            "Vous n'avez pas les droits d'accès pour cette page"
          );
          res.redirect("/");
          return false;
        }
        return permission.granted;
        break;
      default:
        req.flash("errors_msg", "Vous tentez une action non autorisée");
        res.redirect("/");
    }
  },

  ifCond: function(v1, operator, v2, options) {
    switch (operator) {
      case "==":
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case "===":
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case "!=":
        return v1 != v2 ? options.fn(this) : options.inverse(this);
      case "!==":
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case "<":
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case "<=":
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case ">":
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case ">=":
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case "&&":
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case "||":
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },

  toTitleCase: function(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  resizeImg: function(id, format) {
    const link = `https://res.cloudinary.com/nyf005/image/upload/w_60,h_60,c_thumb/v1537614359/${id}.${format}`;
    return link;
  }
};
