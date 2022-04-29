module.exports = function override(config) {
  config.node = {
    ...config.node,
    crypto: false
  }

  return config
}
