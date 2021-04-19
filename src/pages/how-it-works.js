import tw from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { isClient } from '../utils'
import { GET_FILEID } from '../graphql'
import { SEO, Layout, PageLoader } from '../components'

const HowItWorks = () => {
   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['how-it-works'],
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
                           elementId: 'how-it-works',
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

   if (loading) return <PageLoader />
   return (
      <Layout>
         <SEO title="How it works" />
         <div id="how-it-works"></div>
      </Layout>
   )
}

export default HowItWorks
