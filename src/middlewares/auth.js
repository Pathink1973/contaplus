const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Não autorizado' });
};

module.exports = { isAuthenticated }; 