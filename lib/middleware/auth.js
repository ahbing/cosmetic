exports.requireLogin = function(req, res, next) {
  if (req.session && req.session.user) return next();

  if (!req.api) return res.redirect('/auth/login');
  next(new errors.ForbiddenError('You need to log in'));
};