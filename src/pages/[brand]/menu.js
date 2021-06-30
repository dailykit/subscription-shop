import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'

import { SEO, Layout, HelperBar, Loader } from '../../components'
import {
   Menu,
   CartPanel,
   WeekPicker,
   MenuProvider,
   useMenu,
} from '../../sections/select-menu'
import { useUser } from '../../context'
import { graphQLClient, useConfig } from '../../lib'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { getSettings } from '../../utils'

const MenuPage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { seo, settings, navigationMenus } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         router.push('/get-started/select-plan')
      }
   }, [isAuthenticated, isLoading])

   return (
      <MenuProvider>
         <Layout settings={settings} navigationMenus={navigationMenus}>
            <SEO title="Select Menu" />
            <MenuContent />
         </Layout>
      </MenuProvider>
   )
}

export default MenuPage

const MenuContent = () => {
   const { user } = useUser()
   const { state } = useMenu()
   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')

   if (state?.isOccurencesLoading)
      return (
         <Main>
            <Loader inline />
         </Main>
      )
   if (user?.isSubscriber)
      return (
         <Main>
            <div>
               <WeekPicker />
               <Header
                  url={
                     !isEmpty(config?.header?.images)
                        ? config?.header?.images[0]?.url
                        : ''
                  }
               >
                  {config?.header?.heading && (
                     <h1 css={tw`text-4xl text-white z-10`}>
                        {config?.header?.heading}
                     </h1>
                  )}
                  {config?.header?.subHeading && (
                     <h3 css={tw`text-xl text-gray-100 z-10`}>
                        {config?.header?.subHeading}
                     </h3>
                  )}
               </Header>
               {!user.isSubscriptionCancelled &&
                  state.occurenceCustomer?.betweenPause && (
                     <MessageBar>
                        You've paused the plan for this week.&nbsp;
                        <Link href="/account/profile">
                           UNPAUSE SUBSCRIPTION
                        </Link>
                     </MessageBar>
                  )}
               {user.isSubscriptionCancelled && (
                  <MessageBar large>
                     Oh! Looks like you cancelled your subscription.&nbsp;
                     <Link href="/account/profile">
                        REACTIVATE SUBSCRIPTION
                     </Link>
                  </MessageBar>
               )}
            </div>
            {!user.isSubscriptionCancelled && (
               <Content>
                  <Menu />
                  <CartPanel />
               </Content>
            )}
         </Main>
      )
   return (
      <Main>
         <div tw="py-3 mx-auto container">
            <HelperBar type="info">
               <HelperBar.Title>No plans selected?</HelperBar.Title>
               <HelperBar.SubTitle>
                  Let's start with setting up a plan for you.
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() => router.push('/get-started/select-plan')}
               >
                  Select Plan
               </HelperBar.Button>
            </HelperBar>
         </div>
      </Main>
   )
}

export const getStaticProps = async ({ params }) => {
   const dataByRoute = await graphQLClient.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/menu',
   })

   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/menu')
   //navigation menu
   const navigationMenu = await graphQLClient.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: { seo, settings, navigationMenus },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

const Main = styled.main`
   margin: auto;
   padding-bottom: 24px;
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

const MessageBar = styled.div`
   height: ${props => (props.large ? '120px' : '80px')};
   display: flex;
   align-items: center;
   justify-content: center;
   ${props =>
      props.large
         ? tw`bg-red-200 text-red-600 text-center`
         : tw`bg-yellow-200 text-yellow-600 text-center`}

   a {
      text-decoration: underline;
   }
`

const Content = styled.section`
   ${tw`px-4 grid gap-8`}
   grid-template-columns: 1fr 400px;
   @media (max-width: 768px) {
      grid-template-columns: 1fr;
   }
`
