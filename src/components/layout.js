import React from 'react'
import { Link } from 'gatsby'
import tw, { styled, css } from 'twin.macro'

import { Header } from './header'
import { useUser } from '../context'
import { normalizeAddress } from '../utils'
import { useConfig } from '../lib/config'
import { MailIcon, PhoneIcon } from '../assets/icons'

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
                  {configOf('footerTitle', 'footer')?.value && (
                     <h2 tw="text-3xl">
                        {configOf('footerTitle', 'footer')?.value}
                     </h2>
                  )}
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
                           <span tw="mt-4 flex items-center">
                              <PhoneIcon size={18} tw="stroke-current mr-2" />
                              {configOf('Contact', 'brand')?.phoneNo}
                           </span>
                        )}
                     </>
                  )}
               </section>
               <section>
                  <h4 tw="text-2xl mb-4 mt-2">Navigation</h4>
                  <ul>
                     <li tw="mb-3">
                        <Link to="/">Home</Link>
                     </li>
                     {isAuthenticated && (
                        <li tw="mb-3">
                           <Link to="/account/profile/">Profile</Link>
                        </li>
                     )}
                     <li tw="mb-3">
                        <Link to="/menu">Menu</Link>
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
                              <Link to="/terms-and-conditions/">
                                 Terms and Conditions
                              </Link>
                           </li>
                        )}
                        {isPrivacyPolicyAvailable && (
                           <li tw="mb-3">
                              <Link to="/privacy-policy/">Privacy Policy</Link>
                           </li>
                        )}
                        {isRefundPolicyAvailable && (
                           <li tw="mb-3">
                              <Link to="/refund-policy/">Refund Policy</Link>
                           </li>
                        )}
                     </ul>
                  </section>
               )}
            </div>
         </Footer>
         {configOf('footerWhatsappPhone', 'footer')?.isVisible && (
            <a
               target="_blank"
               rel="noreferrer noopener"
               tw="fixed right-0 bottom-0 mb-4 mr-4"
               href={`https://api.whatsapp.com/send?phone=${
                  configOf('footerWhatsappPhone', 'footer')?.value
               }`}
            >
               <img
                  tw="h-10 w-10"
                  alt="WhatsApp"
                  src="https://s3.us-east-2.amazonaws.com/dailykit.org/whatsapp.png"
               />
            </a>
         )}
      </>
   )
}

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
