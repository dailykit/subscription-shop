import React from 'react'
import { styled } from 'twin.macro'
import { navigate } from 'gatsby'
import { useKeycloak } from '@react-keycloak/web'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { isClient } from '../../../utils'
import { SEO, Layout, StepsNavbar } from '../../../components'
import { CUSTOMERS, CREATE_CUSTOMER } from '../../../graphql'

export default () => {
   const [keycloak] = useKeycloak()

   const [create] = useMutation(CREATE_CUSTOMER, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         navigate('/subscription/get-started/select-delivery')
      },
   })

   const [customers] = useLazyQuery(CUSTOMERS, {
      onCompleted: ({ customers }) => {
         if (customers.length > 0) {
            const [customer] = customers
            if (customer.isSubscriber) {
               navigate('/subscription/menu')
            } else {
               navigate('/subscription/get-started/select-delivery')
            }
         } else if (customers.length === 0) {
            create({
               variables: {
                  object: {
                     source: 'subscription',
                     email: keycloak?.tokenParsed?.email,
                     clientId: process.env.GATSBY_CLIENTID,
                     keycloakId: keycloak?.tokenParsed?.sub,
                  },
               },
            })
         }
      },
   })

   React.useEffect(() => {
      if (keycloak?.authenticated) {
         if ('tokenParsed' in keycloak) {
            customers({
               variables: {
                  where: { keycloakId: { _eq: keycloak?.tokenParsed?.sub } },
               },
            })
         }
      }
      if (isClient) {
         let eventMethod = window.addEventListener
            ? 'addEventListener'
            : 'attachEvent'
         let eventer = window[eventMethod]
         let messageEvent =
            eventMethod === 'attachEvent' ? 'onmessage' : 'message'

         eventer(messageEvent, e => {
            if (e.origin !== window.origin) return
            try {
               if (JSON.parse(e.data).success) {
                  window.location.reload()
               }
            } catch (error) {}
         })
      }
   }, [keycloak, customers])

   return (
      <Layout noHeader>
         <SEO title="Register" />
         <StepsNavbar />
         <Main tw="pt-8">
            {!keycloak?.authenticated && (
               <iframe
                  frameBorder="0"
                  title="Register"
                  tw="mx-auto w-full md:w-4/12 h-full"
                  src={keycloak?.createRegisterUrl({
                     redirectUri: isClient
                        ? `${window.location.origin}/subscription/login-success.xhtml`
                        : '',
                  })}
               ></iframe>
            )}
         </Main>
      </Layout>
   )
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   height: calc(100vh - 64px);
`