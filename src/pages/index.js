import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import 'regenerator-runtime'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../lib'
import { GET_FILEID } from '../graphql'
import { useUser } from '../context'
import { SEO, Layout, Loader } from '../components'
import { FaqSection, InfoSection } from '../sections'
import { webRenderer } from '@dailykit/web-renderer'
import { isClient } from '../utils'
import { useQueryParams } from '../utils/useQueryParams'

export default () => {
   const { configOf } = useConfig()
   const { user, isAuthenticated } = useUser()
   const params = useQueryParams()
   const theme = configOf('theme-color', 'Visual')

   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['home-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         if (fileData.length) {
            fileData.forEach(data => {
               if (data?.fileId) {
                  const fileId = [data?.fileId]
                  const cssPath = data?.subscriptionDivFileId?.linkedCssFiles.map(
                     file => {
                        return file?.cssFile?.path
                     }
                  )
                  const jsPath = data?.subscriptionDivFileId?.linkedJsFiles.map(
                     file => {
                        return file?.jsFile?.path
                     }
                  )
                  webRenderer({
                     type: 'file',
                     config: {
                        uri: isClient && window._env_.GATSBY_DATA_HUB_HTTPS,
                        adminSecret:
                           isClient && window._env_.GATSBY_ADMIN_SECRET,
                        expressUrl: isClient && window._env_.GATSBY_EXPRESS_URL,
                     },
                     fileDetails: [
                        {
                           elementId: 'home-bottom-01',
                           fileId,
                           cssPath: cssPath,
                           jsPath: jsPath,
                        },
                     ],
                  })
               }
            })
         }
      },

      onError: error => {
         console.error(error)
      },
   })

   // useEffect(() => {
   //    webRenderer({
   //       type: 'file',
   //       config: {
   //          uri: window._env_.GATSBY_DATA_HUB_HTTPS,
   //          adminSecret: window._env_.GATSBY_ADMIN_SECRET,
   //       },
   //       fileDetails:[
   //          {
   //             elementId: 'home-bottom-01',
   //             fileId: file,
   //          }
   //       ]

   //    })
   // }, [file])

   React.useEffect(() => {
      if (params) {
         const code = params['invite-code']
         if (code) {
            localStorage.setItem('code', code)
         }
         const token = params['imp-token']
         if (token && isClient) {
            localStorage.setItem('token', token)
            localStorage.setItem('impersonating', true)
            window.location.href =
               window.location.origin + window.location.pathname
         }
      }
   }, [params])

   if (loading) return <Loader />

   return (
      <Layout>
         <SEO title="Home" />
         <Main>
            <div id="home-bottom-01"></div>
         </Main>
      </Layout>
   )
}

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Tagline = styled.h1`
   width: 100%;
   max-width: 480px;
   font-family: 'DM Serif Display', serif;
   ${tw`mb-4 text-teal-900 text-4xl md:text-5xl font-bold`}
`

const Header = styled.header`
   height: 560px;
   background-size: cover;
   background-position: bottom;
   background-repeat: no-repeat;
   background-image: url('https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/banner.png');
   ${tw`relative bg-gray-200 overflow-hidden flex flex-col justify-center`}
   div {
      margin: auto;
      max-width: 980px;
      width: calc(100vw - 40px);
   }
   :after {
      background: linear-gradient(-45deg, #ffffff 16px, transparent 0),
         linear-gradient(45deg, #ffffff 16px, transparent 0);
      background-position: left-bottom;
      background-repeat: repeat-x;
      background-size: 24px 24px;
      content: ' ';
      display: block;
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      height: 24px;
   }
`

const CTA = styled(Link)(
   ({ theme }) => css`
      ${tw`
      rounded
      px-6 h-12
      shadow-xl
      text-white
      bg-green-700
      inline-flex items-center
      uppercase tracking-wider font-medium
   `}
      ${theme?.accent && `background-color: ${theme.accent}`}
   `
)
