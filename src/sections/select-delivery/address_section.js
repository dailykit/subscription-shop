import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

import { useDelivery } from './state'
import { useUser } from '../../context'
import { CheckIcon } from '../../assets/icons'
import { AddressTunnel } from './address_tunnel'
import { Button, HelperBar } from '../../components'

export const AddressSection = () => {
   const { user } = useUser()
   const { state, dispatch } = useDelivery()

   React.useEffect(() => {
      if (user.subscriptionAddressId) {
         dispatch({
            type: 'SET_ADDRESS',
            payload: user?.defaultAddress,
         })
      }
   }, [dispatch, user])

   const addressSelection = address => {
      dispatch({ type: 'SET_ADDRESS', payload: address })
   }

   const toggleTunnel = value => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }

   return (
      <>
         <header css={tw`mt-6 mb-3 flex items-center justify-between`}>
            <h2 css={tw`text-gray-600 text-xl`}>Select Address</h2>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button size="sm" onClick={() => toggleTunnel(true)}>
                  Add Address
               </Button>
            )}
         </header>
         {state.address.error && (
            <HelperBar type="error">
               <HelperBar.SubTitle>{state.address.error}</HelperBar.SubTitle>
               <HelperBar.Buttom
                  onClick={() =>
                     navigate('/subscription/get-started/select-plan')
                  }
               >
                  Change Plan
               </HelperBar.Buttom>
            </HelperBar>
         )}
         {user?.platform_customer?.addresses.length > 0 ? (
            <AddressList>
               {user?.platform_customer?.addresses.map(address => (
                  <AddressCard
                     key={address.id}
                     onClick={() => addressSelection(address)}
                  >
                     <AddressCardLeft
                        className={`${
                           state.address.selected?.id === address.id && 'active'
                        }`}
                     >
                        <CheckIcon
                           size={20}
                           tw="stroke-current text-gray-400"
                        />
                     </AddressCardLeft>
                     <label>
                        <span>{address.line1}</span>
                        <span>{address.line2}</span>
                        <span>{address.city}</span>
                        <span>{address.state}</span>
                        <span>{address.country}</span>
                        <span>{address.zipcode}</span>
                     </label>
                  </AddressCard>
               ))}
            </AddressList>
         ) : (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Let's start with adding an address
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  Add Address
               </HelperBar.Button>
            </HelperBar>
         )}
         {state.address.tunnel && <AddressTunnel />}
      </>
   )
}

const AddressList = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-1
      md:grid-cols-2
   `}
   grid-auto-rows: minmax(130px, auto);
`

const AddressCard = styled.li`
   ${tw`flex border text-gray-700 cursor-pointer`}
   label {
      ${tw`p-3`}
   }
   span {
      ${tw`block`}
   }
`

const AddressCardLeft = styled.aside(
   () => css`
      width: 48px;
      ${tw`border-r border-gray-300 flex items-center justify-center h-full bg-gray-200 border-r`}
      &.active {
         svg {
            ${tw`text-green-700`}
         }
      }
   `
)
