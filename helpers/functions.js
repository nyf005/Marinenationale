module.exports = {
  ensureAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('errors_msg', `Vous n'êtes pas autorisé`);
    // res.redirect('/members/login');
  },


  select: function(selected, options){
    return options.fn(this).replace( new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"').replace( new RegExp('>' + selected + '</option>'), ' selected="selected"$&');
  },

  equal: function( a, b ){
    var next =  arguments[arguments.length-1];
    return (a === b) ? next.fn(this) : next.inverse(this);
  }
}