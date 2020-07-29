import React from 'react'
import tw, { styled, css } from 'twin.macro'

import { usePayment } from './state'
import { useUser } from '../../context'
import { CheckIcon } from '../../assets/icons'
import { PaymentTunnel } from './payment_tunnel'
import { HelperBar } from '../../components'

export const PaymentSection = () => {
   const { user } = useUser()
   const { state, dispatch } = usePayment()

   React.useEffect(() => {
      if (user.subscriptionPaymentMethodId) {
         dispatch({
            type: 'SET_PAYMENT_METHOD',
            payload: {
               selected: { id: user.subscriptionPaymentMethodId },
            },
         })
      }
   }, [user, dispatch])

   const toggleTunnel = value => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            isVisible: value,
         },
      })
   }

   return (
      <>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">Select Payment Method</h4>
            {user?.platfrom_customer?.paymentMethods.length > 0 && (
               <OutlineButton onClick={() => toggleTunnel(true)}>
                  Add Card
               </OutlineButton>
            )}
         </header>
         {user?.platfrom_customer?.paymentMethods.length === 0 && (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Let's start with adding a payment method.
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  Add Payment Method
               </HelperBar.Button>
            </HelperBar>
         )}
         <PaymentMethods>
            {user?.platfrom_customer?.paymentMethods.map(method => (
               <PaymentMethod
                  key={method.stripePaymentMethodId}
                  onClick={() =>
                     dispatch({
                        type: 'SET_PAYMENT_METHOD',
                        payload: {
                           selected: { id: method.stripePaymentMethodId },
                        },
                     })
                  }
               >
                  <PaymentMethodLeft
                     className={`${
                        state.payment.selected?.id ===
                           method.stripePaymentMethodId && 'active'
                     }`}
                  >
                     <CheckIcon size={20} tw="stroke-current text-gray-400" />
                  </PaymentMethodLeft>
                  <section tw="p-2 w-full">
                     {user.subscriptionPaymentMethodId ===
                        method.stripePaymentMethodId && (
                        <span tw="rounded border bg-teal-200 border-teal-300 px-2 text-teal-700">
                           Default
                        </span>
                     )}
                     <div tw="flex items-center justify-between">
                        <span tw="text-xl my-2">{method.cardHolderName}</span>
                        <div tw="flex items-center">
                           <span tw="font-medium">{method.expMonth}</span>
                           &nbsp;/&nbsp;
                           <span tw="font-medium">{method.expYear}</span>
                        </div>
                     </div>
                     <span>
                        <span tw="text-gray-500">Last 4:</span> {method.last4}
                     </span>
                  </section>
               </PaymentMethod>
            ))}
         </PaymentMethods>
         {state.tunnel.isVisible && <PaymentTunnel />}
      </>
   )
}

const PaymentMethods = styled.ul`
   ${tw`
   grid 
   gap-2
   sm:grid-cols-1
   md:grid-cols-2
`}
   grid-auto-rows: minmax(120px, auto);
`

const PaymentMethod = styled.li`
   ${tw`flex border text-gray-700`}
   > aside {
      width: 48px;
      ${tw`border-r border-gray-300 flex justify-center h-full bg-gray-200 border-r`}
   }
`

const PaymentMethodLeft = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`border-r border-gray-300 h-full mr-2 flex flex-shrink-0 items-center justify-center bg-gray-200`}
      &.active {
         svg {
            ${tw`text-green-700`}
         }
      }
   `
)

const Button = styled.button(
   () => css`
      ${tw`bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
   `
)

const OutlineButton = styled(Button)`
   ${tw`bg-transparent hover:bg-green-600 text-green-600 border border-green-600 hover:text-white`}
`
