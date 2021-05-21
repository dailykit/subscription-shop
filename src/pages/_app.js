import App from 'next/app'
import Head from 'next/head'
import { UserProvider } from '../context'
import { ApolloProvider, ConfigProvider, ScriptProvider } from '../lib'
import { ToastProvider } from 'react-toast-notifications'
import axios from 'axios'

import GlobalStyles from '../styles/global'
import '../styles/globals.css'

const AppWrapper = ({ Component, pageProps, seo }) => {
   return (
      <ApolloProvider>
         <Head>
            <title>{seo.title}</title>
            <meta property="og:title" content={seo.title} title="og-title" />
            <meta
               property="og:description"
               content={seo.description}
               title="og-desc"
            />
            <meta property="og:image" content={seo.image} title="og-image" />
            <meta property="og:type" content="website" />
            <meta property="twitter:card" content="summary" />
            <meta
               property="twitter:title"
               content={seo.title}
               title="tw-title"
            />
            <meta
               property="twitter:description"
               content={seo.description}
               title="tw-desc"
            />
            <meta
               property="twitter:image:src"
               content={seo.image}
               title="tw-image"
            />
         </Head>
         <GlobalStyles />
         <ConfigProvider>
            <ScriptProvider>
               <UserProvider>
                  <ToastProvider
                     autoDismiss
                     placement="bottom-center"
                     autoDismissTimeout={3000}
                  >
                     <Component {...pageProps} />
                  </ToastProvider>
               </UserProvider>
            </ScriptProvider>
         </ConfigProvider>
      </ApolloProvider>
   )
}

AppWrapper.getInitialProps = async ({ ctx }) => {
   try {
      const domain = ctx.req.headers.host
      const path = ctx.req.url.replace('/subscription', '')

      const response = await axios.post(
         process.env.DATA_HUB_HTTPS,
         {
            query: `
            query Brands($domain: String!) {
               brands(where: { _or : [{domain : { _eq : $domain }}, {isDefault : {_eq : true }}] }) {
                 domain
                 subscriptionStoreSettings(where: { subscriptionStoreSetting : { identifier : { _eq :"seo" } } }) {
                   value
                 }
               }
             }
         `,
            variables: { domain },
         },
         {
            headers: {
               'Content-Type': 'application/json',
               'x-hasura-admin-secret': process.env.ADMIN_SECRET,
            },
         }
      )

      if (response.data?.data) {
         const [brand] = response.data.data.brands
         const [setting] = brand.subscriptionStoreSettings

         if (setting) {
            const seo = setting.value

            const title =
               seo[path]?.title || seo['/']?.title || 'Meal Kit Store'

            const description =
               seo[path]?.description ||
               seo['/']?.description ||
               'A subscription based meal kit store'

            const image =
               seo[path]?.image ||
               seo['/'].image ||
               'https://dailykit-133-test.s3.amazonaws.com/images/1596121558382.png'

            return { seo: { title, description, image } }
         }
      }

      return {
         seo: {
            title: 'Meal Kit Store',
            description: 'A subscription based meal kit store',
            image: 'https://dailykit-133-test.s3.amazonaws.com/images/1596121558382.png',
         },
      }
   } catch (err) {
      console.log(err)
   }
}

export default AppWrapper
