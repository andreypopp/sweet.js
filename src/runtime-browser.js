module.exports = {
  requireModule: undefined,
  loadNodeModule: function() {
    throw new Error("can't load node module in a browser");
  }
}
