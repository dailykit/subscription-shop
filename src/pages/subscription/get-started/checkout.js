import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../../lib'
import * as QUERIES from '../../../graphql'
import * as Icon from '../../../assets/icons'
import OrderInfo from '../../../sections/OrderInfo'
import { isClient, formatCurrency } from '../../../utils'
import { SEO, Loader, Layout, StepsNavbar, Button } from '../../../components'
import {
   usePayment,
   ProfileSection,
   PaymentProvider,
   PaymentSection,
} from '../../../sections/checkout'
import { useUser } from '../../../context'
import { UPDATE_BRAND_CUSTOMER } from '../../../graphql'

const Checkout = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription/get-started/register')
      }
   }, [isAuthenticated])

   return (
      <Layout noHeader>
         <SEO title="Checkout" />
         <StepsNavbar />
         <PaymentProvider>
            <PaymentContent />
         </PaymentProvider>
      </Layout>
   )
}

const messages = {
   PENDING: 'We are processing your payment.',
   SUCCEEDED: 'Payment for your order has succeeded, you will redirected soon.',
   REQUIRES_PAYMENT_METHOD: '',
   REQUIRES_ACTION:
      'A window will open in short while for further payment authorization required by your bank!',
   PAYMENT_FAILED: 'Your payment has failed, please try again.',
   REQUIRES_ACTION_WITH_URL:
      'A window will open in short while for further payment authorization required by your bank. In case the new window has not opened own yet, please click the button below.',
}

const PaymentContent = () => {
   const { user } = useUser()
   const { state } = usePayment()
   const { addToast } = useToasts()
   const authTabRef = React.useRef()
   const { brand, configOf } = useConfig()
   const [otpPageUrl, setOtpPageUrl] = React.useState('')
   const [isOverlayOpen, toggleOverlay] = React.useState(false)
   const [overlayMessage, setOverlayMessage] = React.useState('')
   const [updateBrandCustomer] = useMutation(UPDATE_BRAND_CUSTOMER, {
      skip: !user?.brandCustomerId,
      onError: error => {
         console.log('UPDATE BRAND CUSTOMER -> ERROR -> ', error)
      },
   })

   const { loading, data: { cart = {} } = {} } = useSubscription(
      QUERIES.CART_SUBSCRIPTION,
      {
         skip: !isClient,
         variables: {
            id: isClient ? new URLSearchParams(location.search).get('id') : '',
         },
      }
   )

   React.useEffect(() => {
      if (!loading) {
         if (cart.customerKeycloakId !== user.keycloakId) {
            navigate(`/subscription/menu`)
         } else {
            ;(async () => {
               const status = cart.paymentStatus
               const remark = cart.transactionRemark
               const next_action = cart.transactionRemark?.next_action

               try {
                  if (status === 'PENDING') {
                     setOverlayMessage(messages['PENDING'])
                  } else if (
                     status === 'REQUIRES_ACTION' &&
                     !next_action?.type
                  ) {
                     toggleOverlay(true)
                     setOverlayMessage(messages['REQUIRES_ACTION'])
                  } else if (
                     status === 'REQUIRES_ACTION' &&
                     next_action?.type
                  ) {
                     toggleOverlay(true)
                     setOverlayMessage(messages['REQUIRES_ACTION_WITH_URL'])
                     let TAB_URL = ''
                     let remark = remark
                     if (next_action?.type === 'use_stripe_sdk') {
                        TAB_URL = next_action?.use_stripe_sdk?.stripe_js
                     } else {
                        TAB_URL = next_action?.redirect_to_url?.url
                     }
                     setOtpPageUrl(TAB_URL)
                     authTabRef.current = window.open(
                        TAB_URL,
                        'payment_auth_page'
                     )
                  } else if (
                     status === 'REQUIRES_PAYMENT_METHOD' &&
                     remark?.last_payment_error?.code
                  ) {
                     toggleOverlay(false)
                     setOverlayMessage(messages['PENDING'])
                     addToast(remark?.last_payment_error?.message, {
                        appearance: 'error',
                     })
                  } else if (status === 'SUCCEEDED') {
                     if (authTabRef.current) {
                        authTabRef.current.close()
                        if (!authTabRef.current.closed) {
                           window.open(
                              `/subscription/checkout?id=${cart.id}`,
                              'payment_auth_page'
                           )
                        }
                     }
                     setOverlayMessage(messages['SUCCEEDED'])
                     addToast(messages['SUCCEEDED'], { appearance: 'success' })
                     navigate(`/subscription/placing-order?id=${cart.id}`)
                  } else if (status === 'PAYMENT_FAILED') {
                     toggleOverlay(false)
                     addToast(messages['PAYMENT_FAILED'], {
                        appearance: 'error',
                     })
                  }
               } catch (error) {
                  console.log('on succeeded -> error -> ', error)
               }
            })()
         }
      }
   }, [cart.paymentStatus, cart.transactionRemark])

   const [updateCustomerReferralRecord] = useMutation(
      QUERIES.MUTATIONS.CUSTOMER_REFERRAL.UPDATE,
      {
         refetchQueries: ['customer'],
         onError: error => {
            console.log(error)
            addToast('Referral code not applied!', { appearance: 'error' })
         },
      }
   )

   const [insertOccurenceCustomers] = useMutation(
      QUERIES.MUTATIONS.OCCURENCE.CUSTOMER.CREATE.MULTIPLE,
      {
         onCompleted: () => {
            if (isClient) {
               localStorage.removeItem('skipList')
            }
         },
         onError: error => console.log('SKIP CARTS -> ERROR -> ', error),
      }
   )

   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onCompleted: async ({ updateCart = {} }) => {
         try {
            let referralCode = null
            if (
               Array.isArray(user?.customerReferrals) &&
               user?.customerReferrals.length > 0
            ) {
               const [referral] = user?.customerReferrals
               referralCode = referral?.referralCode
            }

            if (state.code.value && state.code.value !== referralCode) {
               await updateCustomerReferralRecord({
                  variables: {
                     brandId: brand.id,
                     keycloakId: user.keycloakId,
                     _set: {
                        referredByCode: state.code.value,
                     },
                  },
               })
            }
         } catch (error) {}

         try {
            if (
               updateCart?.paymentMethodId &&
               !user?.subscriptionPaymentMethodId
            ) {
               await updateBrandCustomer({
                  variables: {
                     id: user?.brandCustomerId,
                     _set: {
                        subscriptionPaymentMethodId:
                           updateCart?.paymentMethodId,
                     },
                  },
               })
            }
         } catch (error) {}

         try {
            if (isClient) {
               const skipList = localStorage.getItem('skipList')
               await insertOccurenceCustomers({
                  variables: {
                     objects: skipList.split(',').map(id => ({
                        isSkipped: true,
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: Number(id),
                        brand_customerId: user.brandCustomerId,
                     })),
                  },
               })
            }
         } catch (error) {}
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

   const [updatePlatformCustomer] = useMutation(
      QUERIES.UPDATE_DAILYKEY_CUSTOMER,
      {
         refetchQueries: ['customer'],
         onCompleted: () => {
            updateCart({
               variables: {
                  id: cart.id,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     paymentMethodId: state.payment.selected.id,
                     customerInfo: {
                        customerEmail: user?.platform_customer?.email,
                        customerPhone: state?.profile?.phoneNumber,
                        customerLastName: state?.profile?.lastName,
                        customerFirstName: state?.profile?.firstName,
                     },
                  },
               },
            })
         },
         onError: error => {
            console.log('updatePlatformCustomer -> error -> ', error)
            addToast('Failed to update the user profile!', {
               appearance: 'success',
            })
         },
      }
   )

   const handleSubmit = () => {
      toggleOverlay(true)
      updatePlatformCustomer({
         variables: {
            keycloakId: user.keycloakId,
            _set: { ...state.profile },
         },
      })
   }

   const isValid = () => {
      return (
         state.profile.firstName &&
         state.profile.lastName &&
         state.profile.phoneNumber &&
         state.payment.selected?.id &&
         state.code.isValid
      )
   }
   const onOverlayClose = () => {
      setOtpPageUrl('')
      setOverlayMessage('We are processing your payment.')
      toggleOverlay(false)
   }

   const theme = configOf('theme-color', 'Visual')

   if (loading) return <Loader inline />
   return (
      <Main>
         <Form>
            <header tw="my-3 pb-1 border-b flex items-center justify-between">
               <SectionTitle theme={theme}>Profile Details</SectionTitle>
            </header>
            <ProfileSection />
            <PaymentSection />
         </Form>
         {cart?.products?.length > 0 && (
            <CartDetails>
               <OrderInfo cart={cart} />
               <section>
                  <Button
                     tw="w-full"
                     bg={theme?.accent}
                     onClick={handleSubmit}
                     disabled={!Boolean(isValid())}
                  >
                     Confirm & Pay {formatCurrency(cart.totalPrice)}
                  </Button>
               </section>
            </CartDetails>
         )}
         {isOverlayOpen && (
            <Overlay>
               <header tw="flex pr-3 pt-3">
                  <button
                     onClick={onOverlayClose}
                     tw="ml-auto bg-white h-10 w-10 flex items-center justify-center rounded-full"
                  >
                     <Icon.CloseIcon tw="stroke-current text-gray-600" />
                  </button>
               </header>
               <main tw="flex-1 flex flex-col items-center justify-center">
                  <section tw="p-4 w-11/12 lg:w-8/12 bg-white rounded flex flex-col items-center">
                     <p tw="lg:w-3/4 text-gray-700 md:text-lg mb-4 text-center">
                        {overlayMessage}{' '}
                     </p>
                     {cart.paymentStatus === 'REQUIRES_ACTION' && otpPageUrl && (
                        <a
                           target="_blank"
                           href={otpPageUrl}
                           title={otpPageUrl}
                           rel="noreferer noopener"
                           style={{ color: '#fff' }}
                           tw="inline-block px-4 py-2 bg-orange-400 text-sm uppercase rounded font-medium tracking-wider text-indigo-600"
                        >
                           Complete Payment
                        </a>
                     )}
                     {cart.paymentStatus !== 'PENDING' && <Loader inline />}
                  </section>
               </main>
            </Overlay>
         )}
      </Main>
   )
}

export default Checkout

const Overlay = styled.section`
   ${tw`fixed flex flex-col inset-0`};
   z-index: 1000;
   background: rgba(0, 0, 0, 0.3);
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   display: flex;
   padding: 0 16px;
   margin-bottom: 24px;
   min-height: calc(100vh - 160px);
   ${tw`gap-4`}
   @media (max-width: 768px) {
      flex-direction: column;
   }
`

const Form = styled.section`
   flex: 1;
`
const CartDetails = styled.section`
   width: 420px;
   @media (max-width: 768px) {
      width: 100%;
      > section {
         padding: 16px;
         position: fixed;
         bottom: 0;
         left: 0;
         right: 0;
         background-color: #fff;
         > button {
            ${tw`shadow-lg`}
         }
      }
   }
`
