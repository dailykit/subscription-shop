import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

import Billing from './billing'
import Products from './products'
import { useMenu } from '../state'
import { SaveButton } from './styled'
import OrderInfo from '../../OrderInfo'
import Fulfillment from './fulfillment'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { CloseIcon } from '../../../assets/icons'

export const CartPanel = ({ noSkip, isCheckout }) => {
   const { state } = useMenu()
   const { configOf } = useConfig()
   const [isCartPanelOpen, setIsCartPanelOpen] = React.useState(false)

   const theme = configOf('theme-color', 'Visual')
   if (
      ['ORDER_PENDING', 'CART_PROCESS'].includes(
         state?.occurenceCustomer?.cart?.status
      )
   )
      return (
         <>
            <CartBar setIsCartPanelOpen={setIsCartPanelOpen} />
            <Styles.Wrapper isCartPanelOpen={isCartPanelOpen}>
               <header tw="md:hidden flex items-center justify-between">
                  <h1 tw="text-green-600 text-2xl tracking-wide">
                     Cart Summary
                  </h1>
                  <button
                     tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center"
                     onClick={() => setIsCartPanelOpen(false)}
                  >
                     <CloseIcon size={16} tw="stroke-current text-green-400" />
                  </button>
               </header>
               <OrderInfo
                  cart={state.occurenceCustomer?.cart}
                  showViewOrderButton
               />
            </Styles.Wrapper>
         </>
      )
   return (
      <>
         <CartBar setIsCartPanelOpen={setIsCartPanelOpen} />
         <Styles.Wrapper isCartPanelOpen={isCartPanelOpen}>
            <header tw="md:hidden flex items-center justify-between">
               <h1 tw="text-green-600 text-2xl tracking-wide">Cart Summary</h1>
               <button
                  tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center"
                  onClick={() => setIsCartPanelOpen(false)}
               >
                  <CloseIcon size={16} tw="stroke-current text-green-400" />
               </button>
            </header>
            {/* Products */}
            <Products noSkip={noSkip} isCheckout={isCheckout} />
            {/* Fulfilment Mode */}
            <Fulfillment />
            {/* Billing Details */}
            <Billing isCheckout={isCheckout} />
            {/* Checkout */}
            {isCheckout && (
               <SaveButton
                  bg={theme?.accent}
                  onClick={() =>
                     navigate(
                        `/subscription/get-started/checkout/?id=${state.occurenceCustomer?.cart?.id}`
                     )
                  }
                  disabled={
                     !state?.week?.isValid ||
                     !state?.occurenceCustomer?.validStatus?.itemCountValid
                  }
               >
                  Proceed to Checkout
               </SaveButton>
            )}
         </Styles.Wrapper>
      </>
   )
}

const CartBar = ({ setIsCartPanelOpen }) => {
   const { state } = useMenu()
   const { user } = useUser()
   return (
      <Styles.CartBar>
         <section>
            <h4 tw="text-base text-gray-700">
               Cart {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>
            <h4
               tw="text-blue-700 pt-2"
               onClick={() => setIsCartPanelOpen(true)}
            >
               View full summary <span>&#8657;</span>
            </h4>
         </section>
         <section tw="sm:hidden md:block">
            {state.cartState === 'SAVING' && (
               <span tw="text-sm bg-blue-200 text-blue-700  rounded-full px-3 font-medium">
                  SAVING
               </span>
            )}
            {state.cartState === 'SAVED' && (
               <span tw="text-sm bg-green-200 text-green-700 rounded-full px-3 font-medium">
                  SAVED
               </span>
            )}
         </section>
      </Styles.CartBar>
   )
}

const Styles = {
   Wrapper: styled.div`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 30%;
         bottom: 0px;
         background-color: #ffff;
         padding: 1rem;
         z-index: 1020;
         overflow: scroll;
         ${({ isCartPanelOpen }) =>
            isCartPanelOpen
               ? css`
                    display: block;
                    top: 100%;
                    animation: slide 0.5s forwards;
                    @keyframes slide {
                       100% {
                          top: 30%;
                       }
                    }
                 `
               : css`
                    display: none;
                 `}
      }
   `,
   CartBar: styled.section`
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
      ${tw`flex items-center justify-between z-10 p-2 md:hidden h-20 fixed bottom-0 right-0 left-0 bg-white border-t`}
   `,
}
