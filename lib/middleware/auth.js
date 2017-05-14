exports.requireLogin = function(req, res, next) {
  if (req.session && req.session.user) return next();

  return res.redirect('/auth/login');
};

exports.requireRootLogin = function(req, res, next) {
  if (req.session && req.session.user && req.session.user.root) return next();
  next(new Error('Forbidden 403'));
};