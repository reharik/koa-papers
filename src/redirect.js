
module.exports = (res, url, status) => {
  res.status = status || 302;
  res.set('Location', url);
  res.set('Content-Length', '0');
};