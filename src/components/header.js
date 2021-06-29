import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'

import { useUser } from '../context'
import { isClient, getInitials } from '../utils'
import MenuIcon from '../assets/icons/Menu'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon } from '../assets/icons'
import { Loader } from './loader'
import NavigationBar from './navbar'
export const Header = ({ settings, navigationMenus }) => {
   const router = useRouter()
   const { isAuthenticated, user, isLoading } = useUser()
   // const [isAuthenticated, user, isLoading] = [false, {}, false]
   // console.log('this is navigation menu', navigationMenus)
   console.log('this is user', user)
   const logout = () => {
      isClient && localStorage.removeItem('token')
      if (isClient) {
         window.location.href = window.location.origin + '/subscription'
      }
   }

   const brand = settings['brand']['theme-brand']
   const theme = settings['Visual']['theme-color']

   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)

   console.log('this is route name', router)

   const newNavigationMenus = DataWithChildNodes(navigationMenus)
   console.log('this is loading', isLoading)
   console.log('this is authenticate', isAuthenticated)
   return (
      <>
         <Wrapper>
            <Link
               href="/"
               // title={brand?.name || 'Subscription Shop'}
            >
               <Brand>
                  {brand?.logo?.logoMark && (
                     <img
                        tw="h-12 md:h-12"
                        src={brand?.logo?.logoMark}
                        alt={brand?.name || 'Subscription Shop'}
                     />
                  )}
                  {brand?.name && <span tw="ml-2">{brand?.name}</span>}
               </Brand>
            </Link>
            <section tw="hidden md:flex items-center justify-between">
               <NavigationBar Data={newNavigationMenus}>
                  {/* <ul tw="ml-auto px-4 flex space-x-4"> */}
                  {isLoading ? (
                     <li>
                        <Loader inline={true} />
                     </li>
                  ) : isAuthenticated && user?.isSubscriber ? (
                     <li tw="pl-2 text-gray-800 hidden hidden md:flex items-center">
                        <Link href="/menu">Select Menu</Link>
                     </li>
                  ) : (
                     <li tw="pl-2 text-gray-800 hidden md:flex items-center">
                        <Link href="/our-menu">Our Menu</Link>
                     </li>
                  )}
                  {!user?.isSubscriber && (
                     <li tw="pl-2 hidden md:flex items-center ">
                        <Link href="/our-plans">Get Started</Link>
                     </li>
                  )}
                  {/* </ul> */}
               </NavigationBar>
            </section>
            <section tw="px-2 ml-auto flex justify-center md:px-4">
               {isLoading ? (
                  <Loader inline={true} />
               ) : isAuthenticated ? (
                  <>
                     {user?.platform_customer?.firstName &&
                        (isClient && window.innerWidth > 786 ? (
                           <Link
                              href="/account/profile/"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ) : (
                           <Link
                              href="#"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                              onClick={() => setToggle(!toggle)}
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ))}

                     <button
                        css={tw`text-red-600 rounded px-2 py-1`}
                        onClick={logout}
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <Login
                     onClick={() => {
                        if (isClient) {
                           localStorage.setItem(
                              'source-route',
                              window.location.pathname
                           )
                        }
                        // router.push('/[brand]/login')
                     }}
                     bg={theme?.accent}
                  >
                     <Link href="/login" as="/login">
                        Log In
                     </Link>
                  </Login>
               )}
               <button
                  css={tw`rounded px-2 py-1 inline-block md:hidden ml-2`}
                  onClick={() => setIsMobileNavVisible(!isMobileNavVisible)}
               >
                  {isMobileNavVisible ? (
                     <CrossIcon stroke="#111" size={24} />
                  ) : (
                     <MenuIcon />
                  )}
               </button>
            </section>
            {isMobileNavVisible && (
               <section tw="absolute block px-0 md:hidden bg-white px-4 w-full top-16 list-none transition-all duration-200 ease-in-out">
                  <NavigationBar Data={newNavigationMenus}>
                     {isAuthenticated && user?.isSubscriber ? (
                        <li tw="text-gray-800 py-2">
                           <Link href="/menu">Select Menu</Link>
                        </li>
                     ) : (
                        <li tw="text-gray-800 py-2">
                           <Link href="/our-menu">Our Menu</Link>
                        </li>
                     )}
                     {!user?.isSubscriber && (
                        <li tw="text-gray-800 py-2">
                           <Link href="/our-plans">Get Started</Link>
                        </li>
                     )}
                  </NavigationBar>
               </section>
            )}
         </Wrapper>
         {isClient && window.innerWidth < 786 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
      </>
   )
}

const Wrapper = styled.header`
   height: 64px;
   z-index: 1000;
   grid-template-columns: auto 1fr auto;
   ${tw`w-full grid top-0 bg-white fixed border-b items-center`}
`

const Brand = styled.div`
   ${tw`h-full px-2 flex items-center border-r md:px-6`}
`

const Login = styled.button(
   ({ bg }) => css`
      ${tw`bg-blue-600 text-white rounded px-2 py-1 w-16 md:w-auto`}
      ${bg && `background-color: ${bg};`}
   `
)
const DataWithChildNodes = dataList => {
   dataList.map(each => {
      const newFilter = dataList.filter(
         x => x.parentNavigationMenuItemId === each.id
      )
      each.childNodes = newFilter
      return each
   })
   return dataList
}
