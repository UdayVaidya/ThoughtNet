const validateContent = (req, res, next) => {
  const { title, type } = req.body;
  if (!title || !type) {
    res.status(400);
    return next(new Error("title and type are required"));
  }
  const validTypes = ["article","tweet","youtube","pdf","image","webpage","note"];
  if (!validTypes.includes(type)) {
    res.status(400);
    return next(new Error(`type must be one of: ${validTypes.join(", ")}`));
  }
  next();
};
export { validateContent };
