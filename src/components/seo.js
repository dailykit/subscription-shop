import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { useConfig } from '../lib'
import { useStaticQuery, graphql } from 'gatsby'
import { useLocation } from '@reach/router'

export const SEO = ({
   description,
   title,
   image,
   lang = 'en',
   meta,
   richresult,
}) => {
   const location = useLocation()

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
   const seo = useConfig().configOf('seo', 'App')

   console.log({ seo })

   const metaTitle =
      title ||
      seo[location.pathname]?.title ||
      seo['/']?.title ||
      'Meal Kit Store'

   const metaDescription =
      description ||
      seo[location.pathname]?.description ||
      seo['/']?.description ||
      'A subscription based meal kit store'

   const metaImage =
      image ||
      seo[location.pathname]?.image ||
      seo['/'].image ||
      'https://dailykit-133-test.s3.amazonaws.com/images/1596121558382.png'

   return (
      <Helmet
         title={metaTitle}
         htmlAttributes={{ lang }}
         titleTemplate={`%s | ${site.siteMetadata.title}`}
         meta={[
            { name: `description`, content: metaDescription },
            { property: `og:title`, content: metaTitle },
            { property: `og:description`, content: metaDescription },
            { property: `og:image`, content: metaImage },
            { property: `og:type`, content: `website` },
            { name: `twitter:card`, content: `summary` },
            { name: `twitter:title`, content: metaTitle },
            { name: `twitter:description`, content: metaDescription },
            { property: `twitter:image:src`, content: metaImage },
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
