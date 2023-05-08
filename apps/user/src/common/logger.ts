export function logger(req, res, next) {
  console.log(`[${req.method}] ${req.url}`);
  console.log(JSON.stringify(req.headers, null, 2));

  next();
}
