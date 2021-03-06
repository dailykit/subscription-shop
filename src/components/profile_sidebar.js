import React, { useState } from 'react'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

export const ProfileSidebar = ({ toggle = true, logout }) => {
   const [menu] = useState([
      { title: 'Profile', href: '/subscription/account/profile/' },
      { title: 'Order History', href: '/subscription/account/orders/' },
      { title: 'Manage Addresses', href: '/subscription/account/addresses/' },
      { title: 'Manage Cards', href: '/subscription/account/cards/' },
   ])

   return (
      <Aside toggle={toggle}>
         <ul>
            {menu.map(node => (
               <MenuLink
                  to={node.href}
                  key={node.href}
                  activeClassName="active"
               >
                  {node.title}
               </MenuLink>
            ))}
            <button
               css={tw`text-red-600 rounded pl-3 py-1 md:hidden block`}
               onClick={logout}
            >
               Logout
            </button>
         </ul>
      </Aside>
   )
}

const MenuLink = styled(Link)`
   ${tw`pl-3 flex items-center w-full h-12`}
   &.active {
      ${tw`bg-gray-300`}
   }
`
const Aside = styled.aside(
   ({ toggle }) => css`
      ${tw`bg-gray-100 border-r block z-30`}
      ${
         toggle
            ? tw`hidden md:block`
            : tw`block md:hidden md:static absolute top-16 right-0 bottom-0 left-0`
      }
       ${
          !toggle &&
          `
            left: -100px;
            animation: slide 0.5s forwards;
            @keyframes slide {
               100% { left: 0; }
            }
         `
       }  
   `
)
