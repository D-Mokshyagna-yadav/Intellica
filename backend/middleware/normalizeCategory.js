const { normalizeCategory } = require("../constants/categories");

module.exports = function normalizeCategoryMiddleware(req, res, next) {
  const rawCategory = req.params.category || req.body.category || req.query.category;

  if (!rawCategory) {
    return next();
  }

  const normalizedCategory = normalizeCategory(rawCategory);

  if (!normalizedCategory) {
    return res.status(400).json({ message: "Unsupported category" });
  }

  req.normalizedCategory = normalizedCategory;
  req.body.category = normalizedCategory;
  req.query.category = normalizedCategory;
  next();
};
