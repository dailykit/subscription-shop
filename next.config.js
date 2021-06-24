'use strict'

module.exports = {
   pageExtensions: ['js', 'jsx'],
   webpack: (config, { isServer }) => {
      // Fixes npm packages that depend on `fs` module
      if (!isServer) {
         config.node = {
            fs: 'empty',
            module: 'empty',
         }
      }
      return config
   },
}
