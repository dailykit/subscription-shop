import React from 'react'
import { isEmpty } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import { isClient } from '../../../utils'
import { CART_STATUS } from '../../../graphql'
import { Layout, SEO, Loader, HelperBar } from '../../../components'
import { PlacedOrderIllo, CartIllo, PaymentIllo } from '../../../assets/icons'
import OrderInfo from '../../../sections/OrderInfo'
import { navigate } from 'gatsby-link'

const PlacingOrder = () => {
   const { configOf } = useConfig()
   const [isPaymentPopup, setIsPaymentPopup] = React.useState(false)
   const { loading, data: { cart = {} } = {} } = useSubscription(CART_STATUS, {
      skip: !isClient,
      variables: {
         id: isClient ? new URLSearchParams(location.search).get('id') : '',
      },
   })

   React.useEffect(() => {
      if (!loading && !isEmpty(cart)) {
         if (
            cart.paymentStatus === 'REQUIRES_ACTION' &&
            cart.transactionRemark?.next_action?.redirect_to_url?.url
         ) {
            setIsPaymentPopup(true)
         } else if (
            ['CANCELLED', 'PAYMENT_FAILED', 'REQUIRES_PAYMENT_METHOD'].includes(
               cart.paymentStatus
            )
         ) {
            navigate(`/subscription/get-started/checkout/?id=${cart.id}`)
         } else if (cart.paymentStatus === 'SUCCEEDED') {
            setIsPaymentPopup(false)
         }
      }
   }, [loading, cart])

   const gotoMenu = () => {
      isClient && window.localStorage.removeItem('plan')
      if (isClient) {
         window.location.href = window.location.origin + '/subscription/menu'
      }
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <Layout>
         <SEO title="Placing Order" />
         <Wrapper>
            <Main tw="pt-4">
               {loading ? (
                  <Loader inline />
               ) : (
                  <Content>
                     {cart && (
                        <>
                           <header tw="my-3 pb-1 border-b flex items-center justify-between">
                              <SectionTitle theme={theme}>
                                 Order Summary
                              </SectionTitle>
                           </header>
                           <OrderInfo cart={cart} />
                           <Steps>
                              <Step
                                 className={`${
                                    cart.status !== 'CART_PENDING'
                                       ? 'active'
                                       : ''
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <CartIllo />
                                 </span>
                                 Saving Cart
                                 {cart.status === 'CART_PENDING' && <Pulse />}
                              </Step>
                              <Step
                                 className={`${
                                    cart.paymentStatus === 'SUCCEEDED'
                                       ? 'active'
                                       : ''
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <PaymentIllo />
                                 </span>
                                 Processing Payment
                                 {cart.paymentStatus !== 'SUCCEEDED' && (
                                    <Pulse />
                                 )}
                              </Step>
                              <Step
                                 className={`${
                                    cart.status === 'ORDER_PENDING' &&
                                    cart.orderId
                                       ? 'active'
                                       : 'null'
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <PlacedOrderIllo />
                                 </span>
                                 Order Placed
                                 {cart.status !== 'ORDER_PENDING' ||
                                    (!Boolean(cart.orderId) && <Pulse />)}
                              </Step>
                           </Steps>
                           {cart.paymentStatus === 'SUCCEEDED' &&
                              cart.status === 'ORDER_PENDING' &&
                              cart.orderId && (
                                 <HelperBar type="success" tw="mt-3">
                                    <HelperBar.Title>
                                       <span role="img" aria-label="celebrate">
                                          🎉
                                       </span>
                                       Congratulations!{' '}
                                    </HelperBar.Title>
                                    <HelperBar.SubTitle>
                                       Your order has been placed. Continue
                                       selecting menu for others weeks.
                                    </HelperBar.SubTitle>
                                    <HelperBar.Button onClick={gotoMenu}>
                                       Browse Menu
                                    </HelperBar.Button>
                                 </HelperBar>
                              )}
                        </>
                     )}
                  </Content>
               )}
            </Main>
         </Wrapper>
         {isPaymentPopup && (
            <div tw="fixed inset-0 m-3 mt-20 bg-white shadow-md z-10">
               <iframe
                  frameborder="0"
                  title="Payment Authentication"
                  tw="h-full w-full"
                  src={
                     cart.transactionRemark?.next_action?.redirect_to_url?.url
                  }
               ></iframe>
            </div>
         )}
      </Layout>
   )
}

export default PlacingOrder

const Pulse = () => (
   <span tw="mt-3 flex h-3 w-3 relative">
      <span tw="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
      <span tw="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
   </span>
)

const Wrapper = styled.div`
   ${tw`bg-gray-100`}
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   background: #fff;
   padding-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Content = styled.section`
   margin: auto;
   max-width: 567px;
   width: calc(100% - 40px);
   ${tw`flex flex-col items-center`}
`

const Steps = styled.ul`
   ${tw`w-full flex items-start justify-between`}
`

const Step = styled.li`
   ${tw`flex flex-col items-center justify-center text-gray-600`}
   &.active {
      ${tw`text-green-600`}
   }
`

const CartProducts = styled.ul`
   ${tw`space-y-2 mb-3`}
   overflow-y: auto;
   max-height: 257px;
`
