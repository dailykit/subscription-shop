import React from 'react'
import { Link } from 'gatsby'
import { uniqBy } from 'lodash'
import tw, { css, styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from '../../state'
import { CartProducts } from '../styled'
import { useConfig } from '../../../../lib'
import { useUser } from '../../../../context'
import { PlusIcon, CloseIcon, CheckIcon } from '../../../../assets/icons'
import { Tunnel, Loader, Button, CartProduct } from '../../../../components'
import { OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES } from '../../../../graphql'

const AddOnProducts = () => {
   const { state, methods } = useMenu()
   const [tunnel, toggleTunnel] = React.useState(false)

   React.useEffect(() => {
      if (state.isCartFull) {
         toggleTunnel(state.isCartFull)
      }
   }, [state.isCartFull])

   const isRemovable =
      ['PENDING', undefined].includes(state?.occurenceCustomer?.cart?.status) &&
      state?.week?.isValid
   return (
      <div>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <h4 tw="text-lg text-gray-700">Your Add Ons</h4>
            <button
               onClick={() => toggleTunnel(true)}
               tw="text-green-800 uppercase px-3 py-1 rounded-full border text-sm font-medium border-green-400 flex items-center"
            >
               Explore
               <span tw="pl-2">
                  <PlusIcon size={16} tw="stroke-current text-green-400" />
               </span>
            </button>
         </header>
         <CartProducts>
            {state?.occurenceCustomer?.cart?.cartInfo?.products?.map(
               product =>
                  product.isAddOn && (
                     <CartProduct
                        product={product}
                        key={product.cartItemId}
                        isRemovable={isRemovable}
                        onDelete={methods.products.delete}
                     />
                  )
            )}
         </CartProducts>
         {tunnel && (
            <Tunnel
               size="md"
               isOpen={tunnel}
               toggleTunnel={() => toggleTunnel(false)}
            >
               <Tunnel.Header title="Add Ons">
                  <Button size="sm" onClick={() => toggleTunnel(false)}>
                     <CloseIcon size={20} tw="stroke-current" />
                  </Button>
               </Tunnel.Header>
               <Tunnel.Body>
                  <AddOns />
               </Tunnel.Body>
            </Tunnel>
         )}
      </div>
   )
}

export default AddOnProducts

const AddOns = () => {
   const { user } = useUser()
   const { state } = useMenu()
   const { configOf } = useConfig()
   const { addToast } = useToasts()

   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: { _eq: state?.week?.id },
            subscriptionId: { _eq: user?.subscriptionId },
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const isAdded = id => {
      const products = state.occurenceCustomer?.cart?.cartInfo?.products || []

      const index = products?.findIndex(
         node => node.subscriptionOccurenceProductId === id
      )
      return index === -1 ? false : true
   }

   const theme = configOf('theme-color', 'Visual')
   if (loading) return <Loader inline />
   if (categories.length === 0) return <div>No Add Ons Available</div>
   return (
      <div>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} (
                  {
                     uniqBy(category.productsAggregate.nodes, v =>
                        [v?.cartItem?.id, v?.cartItem?.option?.id].join()
                     ).length
                  }
                  )
               </h4>
               <ProductsWrapper>
                  {uniqBy(category.productsAggregate.nodes, v =>
                     [v?.cartItem?.id, v?.cartItem?.option?.id].join()
                  ).map(node => (
                     <AddOnProduct
                        node={node}
                        theme={theme}
                        key={node.id}
                        isAdded={isAdded}
                     />
                  ))}
               </ProductsWrapper>
            </section>
         ))}
      </div>
   )
}

const AddOnProduct = ({ node, isAdded, theme }) => {
   const { state, methods } = useMenu()
   const type = node?.simpleRecipeProductOption?.id ? 'SRP' : 'IP'
   const option =
      type === 'SRP'
         ? node.simpleRecipeProductOption
         : node.inventoryProductOption

   const canAdd = () => {
      const conditions = [!node.isSingleSelect, state?.week?.isValid]
      return (
         conditions.every(node => node) ||
         ['PENDING', undefined].includes(state.occurenceCustomer?.cart?.status)
      )
   }
   return (
      <Styles.Product
         theme={theme}
         className={`${isAdded(node?.id) ? 'active' : ''}`}
      >
         <div
            css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
         >
            {node?.cartItem?.image ? (
               <img
                  alt={node?.cartItem?.name}
                  title={node?.cartItem?.name}
                  src={node?.cartItem?.image}
                  css={tw`h-full w-full object-cover select-none`}
               />
            ) : (
               <span>No Photos</span>
            )}
         </div>
         <div css={tw`flex items-center justify-between`}>
            <section tw="flex items-center">
               <Check
                  size={16}
                  tw="flex-shrink-0"
                  className={`${isAdded(node?.id) ? 'active' : ''}`}
               />
               <Link
                  tw="text-gray-700"
                  to={`/subscription/${
                     type === 'SRP' ? 'recipes' : 'inventory'
                  }?id=${node?.cartItem?.id}${
                     type === 'SRP'
                        ? `&serving=${option?.simpleRecipeYieldId}`
                        : `&option=${option?.id}`
                  }`}
               >
                  {node?.cartItem?.name}
               </Link>
            </section>
            {canAdd() && (
               <button
                  onClick={() => methods.products.add(node.cartItem)}
                  tw="text-sm uppercase font-medium tracking-wider border border-gray-300 rounded px-1 text-gray-500"
               >
                  {isAdded(node?.id) ? 'Add Again' : 'Add'}
               </button>
            )}
         </div>
         <p>
            {type === 'SRP'
               ? option?.simpleRecipeProduct?.additionalText
               : option?.inventoryProduct?.additionalText}
         </p>
      </Styles.Product>
   )
}

const ProductsWrapper = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Check = styled(CheckIcon)(
   () => css`
      ${tw`mr-2 stroke-current text-gray-300`}
      &.active {
         ${tw`text-green-700`}
      }
   `
)

const Styles = {
   Product: styled.li(
      ({ theme }) => css`
         ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
         &.active {
            ${tw`border border-2 border-red-400`}
            border-color: ${theme?.highlight ? theme.highlight : '#38a169'}
         }
      `
   ),
}
