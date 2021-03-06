import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { useConfig } from '../lib'
import { useStaticQuery, graphql } from 'gatsby'

export const SEO = ({ description, title, lang = 'en', meta, richresult }) => {
   const { site } = useStaticQuery(
      graphql`
         query {
            site {
               siteMetadata {
                  title
                  description
               }
            }
         }
      `
   )

   const { favicon } = useConfig().configOf('theme-brand', 'brand')

   const metaTitle = title || site.siteMetadata.title
   const metaDescription = description || site.siteMetadata.description

   return (
      <Helmet
         title={metaTitle}
         htmlAttributes={{ lang }}
         titleTemplate={`%s | ${site.siteMetadata.title}`}
         meta={[
            { name: `description`, content: metaDescription },
            { property: `og:title`, content: metaTitle },
            { property: `og:description`, content: metaDescription },
            { property: `og:type`, content: `website` },
            { name: `twitter:card`, content: `summary` },
            { name: `twitter:title`, content: metaTitle },
            { name: `twitter:description`, content: metaDescription },
         ].concat(meta)}
         link={[{ rel: 'icon', type: 'image/png', href: favicon }]}
         script={[
            {
               type: 'application/ld+json',
               innerHTML: JSON.stringify(richresult),
            },
         ]}
      />
   )
}

SEO.defaultProps = {
   meta: [],
   title: '',
   description: '',
}

SEO.propTypes = {
   description: PropTypes.string,
   title: PropTypes.string.isRequired,
   meta: PropTypes.arrayOf(PropTypes.object),
}
