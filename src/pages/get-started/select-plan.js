import React, { useState, useEffect } from 'react'
import { isEmpty } from 'lodash'
import tw, { styled } from 'twin.macro'
import { webRenderer } from '@dailykit/web-renderer'
import { useQuery } from '@apollo/react-hooks'
import { GET_FILEID } from '../../graphql'
import { useConfig } from '../../lib'
import { InfoSection } from '../../sections'
import { Plans } from '../../sections/select-plan'
import { SEO, Layout, StepsNavbar, Loader } from '../../components'
import { isClient } from '../../utils'

const SelectPlan = () => {
   const { configOf } = useConfig('Select-Plan')
   const config = configOf('select-plan-header')
   // const [file, setFile] = useState([])
   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['select-plan-top-01', 'select-plan-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         if (fileData.length) {
            fileData.forEach(data => {
               if (data?.fileId) {
                  const fileIdsForTop = []
                  const fileIdsForBottom = []
                  let cssPathForTop = []
                  let cssPathForBottom = []
                  let jsPathForTop = []
                  let jsPathForBottom = []
                  if (data?.id === 'select-plan-top-01') {
                     fileIdsForTop.push(data.fileId)
                     cssPathForTop = data?.subscriptionDivFileId?.linkedCssFiles.map(
                        file => {
                           return file?.cssFile?.path
                        }
                     )
                     jsPathForTop = data?.subscriptionDivFileId?.linkedJsFiles.map(
                        file => {
                           return file?.jsFile?.path
                        }
                     )
                  } else if (data?.id === 'select-plan-bottom-01') {
                     fileIdsForBottom.push(data.fileId)
                     cssPathForBottom = data?.subscriptionDivFileId?.linkedCssFiles.map(
                        file => {
                           return file?.cssFile?.path
                        }
                     )
                     jsPathForBottom = data?.subscriptionDivFileId?.linkedJsFiles.map(
                        file => {
                           return file?.jsFile?.path
                        }
                     )
                  }

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
                           elementId: 'select-plan-top-01',
                           fileId: fileIdsForTop,
                           cssPath: cssPathForTop,
                           jsPath: jsPathForTop,
                        },
                        {
                           elementId: 'select-plan-bottom-01',
                           fileId: fileIdsForBottom,
                           cssPath: cssPathForBottom,
                           jsPath: jsPathForBottom,
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
   //             elementId:'select-plan-top-01',
   //             fileId: file.filter(f=>f.id==='select-plan-top-01'),
   //             cssId: file.filter(f=>f.)

   //          }
   //       ]
   //       elementId: 'select-plan-top-01',
   //       fileId: fileId[0],
   //    })
   // }, [fileId])
   // useEffect(() => {
   //    webRenderer({
   //       type: 'file',
   //       config: {
   //          uri: window._env_.GATSBY_DATA_HUB_HTTPS,
   //          adminSecret: window._env_.GATSBY_ADMIN_SECRET,
   //       },
   //       elementId: 'select-plan-bottom-01',
   //       fileId: fileId[1],
   //    })
   // }, [fileId])

   if (loading) return <Loader />
   return (
      <Layout noHeader>
         <SEO title="Plans" />
         <StepsNavbar />
         <Main>
            <div id="select-plan-top-01"></div>
            <Plans />
         </Main>
         <div id="select-plan-bottom-01"></div>
      </Layout>
   )
}

export default SelectPlan

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Header = styled.header`
   height: 480px;
   position: relative;
   ${tw`bg-gray-100 flex flex-col items-center justify-center`}
   ::before {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 0;
      background-image: url(${props => props.url});
      ${tw`bg-no-repeat bg-center bg-cover`}
   }
   ::after {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 1;
      ${tw`bg-black opacity-25`}
   }
`
