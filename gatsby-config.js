module.exports = {
   siteMetadata: {
      title: `Subsription Shop`,
      description: `A subscription based shop for restaurants`,
   },
   plugins: [
      `gatsby-plugin-emotion`,
      `gatsby-plugin-postcss`,
      `gatsby-plugin-react-helmet`,
      {
         resolve: `gatsby-plugin-portal`,
         options: {
            key: 'portal',
            id: 'portal',
         },
      },
   ],
}
