const moment = require("moment");
const ac = require("../config/accesscontrol");
const he = require('he');


module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("errors_msg", `Vous n'êtes pas autorisé à accéder à cette page.`);
    res.redirect("/");
  },

  truncate: function(str, len) {
    if (str.length > len && str.length > 0) {
      var new_str = str + " ";
      new_str = str.substr(0, len);
      new_str = str.substr(0, new_str.lastIndexOf(" "));
      new_str = new_str.length > 0 ? new_str : str.substr(0, len);
      return new_str + " <b class='blue-text'>...</b>";
    }
    return str;
  },

  stripTags: function(input) {
    // return he.decode(input.replace(/(&nbsp;|<([^>]+)>)/ig, ""));
    // return he.decode(input.replace(/<[^>]+>/g, ''));

    return he.decode(input);
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
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  resizeImg: function(id, format) {
    const link = `https://res.cloudinary.com/nyf005/image/upload/w_60,h_60,c_thumb/v1537614359/${id}.${format}`;
    return link;
  },

  editIcon: function(statut, infoId, floating = true) {
    if (statut === "super_admin") {
      if (floating){
        return `
        <a class="btn-floating pulse halfway-fab green"><i class="large material-icons">dehaze</i></a>
        <ul>
          <li>
            <form action="/informations/delete/${infoId}?_method=DELETE" method="POST" id="delete-form" onclick="return ConfirmDelete();">
              <input type="hidden" name="_method" value="DELETE">
              <button type="submit" class="btn-floating red">
                <i class="material-icons">delete_forever</i>
              </button>
            </form>
          </li>
          <li><a href="/informations/edit/${infoId}" class="btn-floating blue"><i class="material-icons">create</i></a></li>
          <li><a href="/informations/show/${infoId}" class="btn-floating orange darken-1"><i class="material-icons">book</i></a></li>
        </ul>`;
      } else {
        return `<a href="/informations/edit/${infoId}"><i class="material-icons">create</i></a>`;
      }
    } else {
      if (floating){
        return `<a href="/informations/show/${infoId}" class="btn-floating pulse halfway-fab orange"><i class="material-icons">book</i></a>`;
      } else {
        return ``;
      }
    }
  }
};
