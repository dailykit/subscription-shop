import React from 'react'
import moment from 'moment'
import gql from 'graphql-tag'
import { navigate, Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { Loader } from './loader'
import { Tunnel } from './tunnel'
import { Button } from './button'
import { Header } from './header'
import { useUser } from '../context'
import { HelperBar } from './helper_bar'
import { useConfig } from '../lib/config'
import { normalizeAddress, formatCurrency } from '../utils'
import { CloseIcon, MailIcon, PhoneIcon } from '../assets/icons'

export const Layout = ({ children, noHeader }) => {
   const { isAuthenticated, user } = useUser()
   const { hasConfig, configOf } = useConfig()

   const {
      isPrivacyPolicyAvailable,
      isRefundPolicyAvailable,
      isTermsAndConditionsAvailable,
   } = configOf('Policy Availability', 'brand')
   const store = configOf('Store Availability', 'availability')
   return (
      <>
         {!noHeader && <Header />}
         {children}
         <div tw="p-2 bg-gray-200 text-gray-700 w-full flex flex-col items-center justify-center gap-2">
            {(user?.isTest === true || store?.isStoreLive === false) && (
               <p>Store running in test mode so payments will be bypassed</p>
            )}
            {user?.isDemo && <p>Logged in user is in demo mode.</p>}
         </div>
         <Footer theme={configOf('theme-color', 'Visual')}>
            <div>
               <section>
                  <h4 tw="text-2xl mb-4 mt-2">Contact Us</h4>
                  {hasConfig('Location', 'availability') && (
                     <p tw="mt-2">
                        {normalizeAddress(configOf('Location', 'availability'))}
                     </p>
                  )}

                  {hasConfig('Contact', 'brand') && (
                     <>
                        <span tw="mt-4 flex items-center">
                           <MailIcon size={18} tw="stroke-current mr-2" />
                           <a
                              href={`mailto:${
                                 configOf('Contact', 'brand')?.email
                              }`}
                              tw="underline"
                           >
                              {configOf('Contact', 'brand')?.email}
                           </a>
                        </span>
                        {configOf('Contact', 'brand')?.phoneNo && (
                           <a
                              target="_blank"
                              rel="noreferrer noopener"
                              tw="mt-4 flex items-center"
                              href={`https://api.whatsapp.com/send?phone=${
                                 configOf('Contact', 'brand')?.phoneNo
                              }`}
                           >
                              <PhoneIcon size={18} tw="stroke-current mr-2" />
                              {configOf('Contact', 'brand')?.phoneNo}
                           </a>
                        )}
                     </>
                  )}
               </section>
               <section>
                  <h4 tw="text-2xl mb-4 mt-2">Navigation</h4>
                  <ul>
                     <li tw="mb-3">
                        <Link to="/subscription">Home</Link>
                     </li>
                     {isAuthenticated && (
                        <li tw="mb-3">
                           <Link to="/subscription/account/profile/">
                              Profile
                           </Link>
                        </li>
                     )}
                     <li tw="mb-3">
                        <Link to="/subscription/menu">Menu</Link>
                     </li>
                  </ul>
               </section>
               {(isTermsAndConditionsAvailable ||
                  isPrivacyPolicyAvailable ||
                  isRefundPolicyAvailable) && (
                  <section>
                     <h4 tw="text-2xl mb-4 mt-2">Policy</h4>
                     <ul>
                        {isTermsAndConditionsAvailable && (
                           <li tw="mb-3">
                              <Link to="/subscription/terms-and-conditions/">
                                 Terms and Conditions
                              </Link>
                           </li>
                        )}
                        {isPrivacyPolicyAvailable && (
                           <li tw="mb-3">
                              <Link to="/subscription/privacy-policy/">
                                 Privacy Policy
                              </Link>
                           </li>
                        )}
                        {isRefundPolicyAvailable && (
                           <li tw="mb-3">
                              <Link to="/subscription/refund-policy/">
                                 Refund Policy
                              </Link>
                           </li>
                        )}
                     </ul>
                  </section>
               )}
            </div>
         </Footer>
         {isAuthenticated && user?.keycloakId && <FloatingBar />}
      </>
   )
}

const FloatingBar = () => {
   const { brand } = useConfig()
   const { user } = useUser()
   const [isOpen, setIsOpen] = React.useState(false)
   const { loading, error, data: { carts = {} } = {} } = useSubscription(
      CARTS_AGGREGATE,
      {
         skip: !brand?.id || !user.keycloakId,
         variables: {
            where: {
               brandId: { _eq: brand?.id },
               customerKeycloakId: { _eq: user?.keycloakId },
               paymentStatus: { _nin: ['PENDING', 'SUCCEEDED'] },
               order: {
                  _or: [
                     { isRejected: { _eq: false } },
                     { isRejected: { _is_null: true } },
                  ],
               },
            },
         },
      }
   )

   if (loading) return null
   if (error) return null
   if (carts?.aggregate?.count === 0) return null
   return (
      <>
         <section tw="fixed bottom-0 right-0 left-0 mb-24 md:mb-3 px-3 md:px-0">
            <div tw="pl-3 pr-2 flex items-center justify-between mx-auto rounded bg-red-400 text-white border-white h-14 border w-full md:w-5/12">
               <span>Incomplete Payments: {carts?.aggregate?.count || 0}</span>
               <button
                  onClick={() => setIsOpen(!isOpen)}
                  tw="bg-red-600 text-white rounded px-3 py-2"
               >
                  View
               </button>
            </div>
         </section>
         <Tunnel isOpen={isOpen} toggleTunnel={setIsOpen} size="md">
            <Tunnel.Header title="Incomplete Payments">
               <Button size="sm" onClick={() => setIsOpen(false)}>
                  <CloseIcon size={20} tw="stroke-current" />
               </Button>
            </Tunnel.Header>
            <Tunnel.Body>
               {loading ? (
                  <Loader inline />
               ) : (
                  <>
                     {carts?.aggregate?.count === 0 ? (
                        <HelperBar type="success">
                           <HelperBar.SubTitle>
                              No Incomplete payments
                           </HelperBar.SubTitle>
                        </HelperBar>
                     ) : (
                        <ul tw="space-y-3">
                           {carts.nodes.map(cart => (
                              <li
                                 key={cart.id}
                                 tw="p-3 border border-gray-200 rounded"
                              >
                                 <section tw="flex items-center justify-between">
                                    <span>
                                       Delivery on:&nbsp;
                                       {cart.subscriptionOccurence
                                          ?.fulfillmentDate
                                          ? moment(
                                               cart.subscriptionOccurence
                                                  ?.fulfillmentDate
                                            ).format('MMM DD, YYYY')
                                          : 'N/A'}
                                    </span>
                                    <button
                                       tw="uppercase rounded px-3 py-2 hover:bg-green-100 text-green-700"
                                       onClick={() => {
                                          navigate(
                                             '/subscription/checkout/?id=' +
                                                cart.id
                                          )
                                          setIsOpen(false)
                                       }}
                                    >
                                       Pay{' '}
                                       {formatCurrency(
                                          Number(cart?.totalPrice) || 0
                                       )}
                                    </button>
                                 </section>
                                 <span>
                                    Payment Status: {cart.paymentStatus}
                                 </span>
                              </li>
                           ))}
                        </ul>
                     )}
                  </>
               )}
            </Tunnel.Body>
         </Tunnel>
      </>
   )
}

const CARTS_AGGREGATE = gql`
   subscription carts($where: order_cart_bool_exp = {}) {
      carts: cartsAggregate(
         where: $where
         order_by: { subscriptionOccurence: { fulfillmentDate: asc } }
      ) {
         aggregate {
            count
         }
         nodes {
            id
            totalPrice
            paymentStatus
            subscriptionOccurence {
               id
               fulfillmentDate
            }
         }
      }
   }
`

const Footer = styled.footer(
   ({ theme }) => css`
      height: 320px;
      padding: 24px 0;
      background-size: 160px;
      ${tw`bg-green-600 text-white`}
      ${theme?.accent && `background-color: ${theme.accent}`};
      div {
         margin: 0 auto;
         max-width: 980px;
         width: calc(100% - 40px);
         ${tw`grid gap-6`}
         grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      @media (max-width: 768px) {
         height: auto;
      }
   `
)
