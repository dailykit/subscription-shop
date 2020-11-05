import React from 'react'
import tw, { styled } from 'twin.macro'
import { useLocation } from '@reach/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../../utils'
import { INVENTORY_DETAILS } from '../../../graphql'
import { Loader, Layout, SEO } from '../../../components'

const Inventory = () => {
   const location = useLocation()
   const { addToast } = useToasts()
   const [inventory, setInventory] = React.useState(null)

   const [getInventory, { loading }] = useLazyQuery(INVENTORY_DETAILS, {
      onCompleted: ({ inventoryProduct }) => {
         setInventory(inventoryProduct)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      let params = new URL(location.href).searchParams
      let inventoryId = Number(params.get('id'))
      let optionId = Number(params.get('option'))
      getInventory({
         variables: {
            id: inventoryId,
            args: {
               optionId: optionId,
            },
         },
      })
   }, [location.href, getInventory])

   if (loading)
      return (
         <Layout>
            <SEO title="Loading" />
            <Loader inline />
         </Layout>
      )
   if (!inventory)
      return (
         <Layout>
            <SEO title="Not found" />
            <h1 tw="py-4 text-2xl text-gray-600 text-center">
               No such inventory exists!
            </h1>
         </Layout>
      )
   return (
      <Layout>
         <SEO title={inventory?.cartItem?.name} />
         <InventoryContainer>
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {inventory?.cartItem?.name}
            </h1>
            <InventoryImage>
               {inventory?.cartItem.image ? (
                  <img
                     src={inventory?.cartItem.image}
                     alt={inventory?.cartItem.name}
                     tw="w-full h-full border-gray-100 object-cover rounded-lg"
                  />
               ) : (
                  'N/A'
               )}
            </InventoryImage>
         </InventoryContainer>
         <Button onClick={() => isClient && window.history.go(-1)}>
            Go back to menu
         </Button>
      </Layout>
   )
}

export default Inventory

const InventoryContainer = styled.div`
   margin: auto;
   max-width: 640px;
   padding: 16px 0;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const InventoryImage = styled.div`
   height: 320px;
   @media (max-width: 567px) {
      height: 240px;
   }
`

const StepImage = styled.div`
   max-width: 340px;
   ${tw`my-2`}
   img {
      width: 100%;
      height: 220px;
      ${tw`object-cover rounded`}
      @media (max-width: 567px) {
         height: 160px;
      }
   }
`

const Button = styled.button`
   left: 50%;
   bottom: 16px;
   ${tw`fixed bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
`
