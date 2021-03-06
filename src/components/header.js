import React from 'react'
import { Link, navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

import { useConfig } from '../lib'
import { useUser } from '../context'
import { isClient, getInitials } from '../utils'

import { ProfileSidebar } from './profile_sidebar'

export const Header = () => {
   const { isAuthenticated, user } = useUser()
   const { configOf } = useConfig()
   const logout = () => {
      isClient && localStorage.removeItem('token')
      if (isClient) {
         window.location.href = window.location.origin + '/subscription'
      }
   }

   const brand = configOf('theme-brand', 'brand')
   const theme = configOf('theme-color', 'Visual')

   const [toggle, setToggle] = React.useState(true)

   return (
      <>
         <Wrapper>
            <Brand
               to="/subscription"
               title={brand?.name || 'Subscription Shop'}
            >
               {brand?.logo?.logoMark && (
                  <img
                     tw="h-10 w-10"
                     src={brand?.logo?.logoMark}
                     alt={brand?.name || 'Subscription Shop'}
                  />
               )}
               {brand?.name && <span tw="ml-2">{brand?.name}</span>}
            </Brand>
            <section tw="flex items-center justify-between">
               <ul />
               <ul tw="px-4 flex space-x-4">
                  {isAuthenticated && user?.isSubscriber ? (
                     <li tw="text-gray-800">
                        <Link to="/subscription/menu">Select Menu</Link>
                     </li>
                  ) : (
                     <li tw="text-gray-800">
                        <Link to="/subscription/our-menu">Our Menu</Link>
                     </li>
                  )}
                  {!isAuthenticated && (
                     <li tw="text-gray-800">
                        <Link to="/subscription/get-started/select-plan">
                           Our Plans
                        </Link>
                     </li>
                  )}
               </ul>
            </section>
            <section tw="px-4 ml-auto">
               {isAuthenticated ? (
                  <>
                     {user?.platform_customer?.firstName &&
                        (isClient && window.innerWidth > 786 ? (
                           <Link
                              to="/subscription/account/profile/"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ) : (
                           <Link
                              to="#"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                              onClick={() => setToggle(!toggle)}
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ))}

                     <button
                        css={tw`text-red-600 rounded px-2 py-1 hidden md:inline-block `}
                        onClick={logout}
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <Login to="/subscription/login" bg={theme?.accent}>
                     Log In
                  </Login>
               )}
            </section>
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

const Brand = styled(Link)`
   ${tw`w-auto h-full px-6 flex items-center border-r`}
`

const Login = styled(Link)(
   ({ bg }) => css`
      ${tw`bg-blue-600 text-white rounded px-2 py-1`}
      ${bg && `background-color: ${bg};`}
   `
)
