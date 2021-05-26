import React from 'react'
import { navigate } from 'gatsby-link'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { isClient } from '../../../utils'
import { useUser } from '../../../context'
import { GET_FILEID } from '../../../graphql'
import { Plans } from '../../../sections/select-plan'
import { SEO, Layout, StepsNavbar } from '../../../components'

const SelectPlan = () => {
   const { isAuthenticated } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription/get-started/register')
      }
   }, [isAuthenticated])

   React.useEffect(() => {
      if (isClient) {
         const plan = localStorage.getItem('plan')
         if (plan) {
            navigate('/subscription/get-started/select-delivery')
         }
      }
   }, [])

   useQuery(GET_FILEID, {
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
