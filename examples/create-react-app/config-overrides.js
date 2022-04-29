module.exports = function override(config, env) {
  config.node = {
    ...config.node,
    crypto: false
  }

  return config
}
