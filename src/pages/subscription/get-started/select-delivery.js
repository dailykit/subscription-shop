import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import { webRenderer } from '@dailykit/web-renderer'

import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { BRAND, DELETE_OCCURENCE_CUSTOMER, GET_FILEID } from '../../../graphql'
import { SEO, Layout, StepsNavbar, Loader, Button } from '../../../components'

import {
   useDelivery,
   AddressSection,
   DeliverySection,
   DeliveryProvider,
   DeliveryDateSection,
} from '../../../sections/select-delivery'
import { isClient } from '../../../utils'

const SelectDelivery = () => {
   const { isAuthenticated } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription/get-started/register')
      }
   }, [isAuthenticated])

   return (
      <Layout noHeader>
         <SEO title="Delivery" />
         <StepsNavbar />
         <DeliveryProvider>
            <DeliveryContent />
         </DeliveryProvider>
      </Layout>
   )
}

export default SelectDelivery

const DeliveryContent = () => {
   const { user } = useUser()
   const { state } = useDelivery()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const [deleteOccurenceCustomer] = useMutation(DELETE_OCCURENCE_CUSTOMER, {
      onError: error => console.log('DELETE CART -> ERROR -> ', error),
   })
   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['select-delivery-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         if (fileData.length) {
            fileData.forEach(data => {
               if (data?.fileId) {
                  const fileId = [data?.fileId]
                  const cssPath = data?.subscriptionDivFileId?.linkedCssFiles.map(
                     file => {
                        return file?.cssFile?.path
                     }
                  )
                  const jsPath = data?.subscriptionDivFileId?.linkedJsFiles.map(
                     file => {
                        return file?.jsFile?.path
                     }
                  )
                  webRenderer({
                     type: 'file',
                     config: {
                        uri: isClient && window._env_.GATSBY_DATA_HUB_HTTPS,
                        adminSecret:
                           isClient && window._env_.GATSBY_ADMIN_SECRET,
                        expressUrl: isClient && window._env_.GATSBY_EXPRESS_URL,
                     },
                     fileDetails: [
                        {
                           elementId: 'select-delivery-bottom-01',
                           fileId,
                           cssPath: cssPath,
                           jsPath: jsPath,
                        },
                     ],
                  })
               }
            })
         }
      },

      onError: error => {
         console.error(error)
      },
   })
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         addToast('Successfully saved delivery preferences.', {
            appearance: 'success',
         })
         navigate(
            `/subscription/get-started/select-menu/?date=${
               state.delivery_date.selected.fulfillmentDate
            }${
               state.skip_list.length > 0 ? `&previous=${state.skip_list}` : ''
            }`
         )
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const nextStep = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               subscriptionOnboardStatus: 'SELECT_MENU',
               subscriptionId: state.delivery.selected.id,
               subscriptionAddressId: state.address.selected.id,
            },
         },
      })
   }

   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }
   const theme = configOf('theme-color', 'Visual')
   if (loading) return <Loader inline />
   return (
      <Main>
         <header css={tw`flex items-center justify-between border-b`}>
            <Title theme={theme}>Delivery</Title>
         </header>
         <AddressSection />
         <SectionTitle theme={theme}>Delivery Day</SectionTitle>
         <DeliverySection />
         <SectionTitle theme={theme}>
            Select your first delivery date
         </SectionTitle>
         <DeliveryDateSection />
         <div tw="mt-4 w-full flex items-center justify-center">
            <Button bg={theme?.accent} onClick={nextStep} disabled={!isValid()}>
               Continue
            </Button>
         </div>
         <div id="select-delivery-bottom-01"></div>
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   padding-bottom: 24px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl py-3`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`my-3 text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)
