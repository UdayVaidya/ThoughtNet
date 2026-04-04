const validateContent = (req, res, next) => {
  const { title, type, url } = req.body;
  
  // If no URL, we MUST have a title
  if (!url && !title) {
    res.status(400);
    return next(new Error("Title or URL is required"));
  }

  // Type is optional now because we'll auto-detect it, but if provided, validate it
  if (type) {
    const validTypes = ["article","tweet","youtube","pdf","image","webpage","note"];
    if (!validTypes.includes(type)) {
      res.status(400);
      return next(new Error(`type must be one of: ${validTypes.join(", ")}`));
    }
  }
  next();
};
export { validateContent };
