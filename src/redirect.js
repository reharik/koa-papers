
module.exports = (ctx, url, status) => {
  ctx.status = status || 302;
  ctx.set('Location', url);
  ctx.set('Content-Length', '0');
};