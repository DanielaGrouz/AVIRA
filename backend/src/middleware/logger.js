const logger = (req, res, next) => {
  const now = new Date().toISOString('he-IL');
  console.log(`[${now}] ${req.method} request to: ${req.url}`);

  res.on('finish', () => {
    console.log(`Response Status: ${res.statusCode}`);
  });
  next();
};

module.exports = logger;
