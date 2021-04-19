import React from 'react'
import { Link } from 'gatsby'
import { isEmpty, uniqBy } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import ReactImageFallback from 'react-image-fallback'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { formatCurrency } from '../../utils'
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'
import VegIcon from '../../assets/imgs/veg.png'
import NonVegIcon from '../../assets/imgs/non-veg.png'

export const Menu = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state } = useMenu()
   const {
      configOf,
      buildImageUrl,
      noProductImage,
      imagePlaceholder,
   } = useConfig()
   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
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
      const products = state.occurenceCustomer?.cart?.products || []

      const index = products?.findIndex(
         node => node.subscriptionOccurenceProductId === id
      )
      return index === -1 ? false : true
   }
   const theme = configOf('theme-color', 'Visual')

   if (loading) return <SkeletonProduct />
   if (isEmpty(categories))
      return (
         <main tw="pt-4">
            <HelperBar>
               <HelperBar.SubTitle>
                  No products available yet!
               </HelperBar.SubTitle>
            </HelperBar>
         </main>
      )
   return (
      <main>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} (
                  {
                     uniqBy(category.productsAggregate.nodes, v =>
                        [
                           v?.cartItem?.productId,
                           v?.cartItem?.productOptionId,
                        ].join()
                     ).length
                  }
                  )
               </h4>
               <Products>
                  {uniqBy(category.productsAggregate.nodes, v =>
                     [
                        v?.cartItem?.productId,
                        v?.cartItem?.option?.productOptionId,
                     ].join()
                  ).map((node, index) => (
                     <Product
                        node={node}
                        theme={theme}
                        key={node.id}
                        isAdded={isAdded}
                        buildImageUrl={buildImageUrl}
                        noProductImage={noProductImage}
                        imagePlaceholder={imagePlaceholder}
                     />
                  ))}
               </Products>
            </section>
         ))}
      </main>
   )
}

const Product = ({
   node,
   theme,
   isAdded,
   noProductImage,
   buildImageUrl,
   imagePlaceholder,
}) => {
   const { addToast } = useToasts()
   const { state, methods } = useMenu()

   const add = item => {
      if (state.occurenceCustomer?.betweenPause) {
         return addToast('You have paused your plan!', {
            appearance: 'warning',
         })
      }
      if (state.occurenceCustomer?.validStatus?.itemCountValid) {
         addToast("Your're cart is already full!", {
            appearance: 'warning',
         })
         return
      }
      methods.products.add(item)
   }

   const canAdd = () => {
      const conditions = [!node.isSingleSelect, state?.week?.isValid, !isActive]
      return (
         conditions.every(node => node) ||
         ['CART_PENDING', undefined].includes(
            state.occurenceCustomer?.cart?.status
         )
      )
   }

   const isActive = isAdded(node?.cartItem?.subscriptionOccurenceProductId)
   const product = {
      name: node?.productOption?.product?.name || '',
      label: node?.productOption?.label || '',
      type: node?.productOption?.simpleRecipeYield?.simpleRecipe?.type,
      image:
         node?.productOption?.product?.assets?.images?.length > 0
            ? node?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: node?.productOption?.product?.additionalText || '',
   }

   return (
      <Styles.Product theme={theme} className={`${isActive ? 'active' : ''}`}>
         {!!product.type && (
            <Styles.Type>
               {product.type === 'Non-vegetarian' ? (
                  <img
                     alt="Non-Veg Icon"
                     src={NonVegIcon}
                     title={product.type}
                     tw="h-6 w-6"
                  />
               ) : (
                  <img
                     alt="Veg Icon"
                     src={VegIcon}
                     title={product.type}
                     tw="h-6 w-6"
                  />
               )}
            </Styles.Type>
         )}
         <div tw="flex items-center justify-center aspect-w-4 aspect-h-3 bg-gray-200 mb-2 rounded overflow-hidden">
            {product.image ? (
               <ReactImageFallback
                  src={buildImageUrl('400x300', product.image)}
                  fallbackImage={product.image}
                  initialImage={imagePlaceholder}
                  alt={product.name}
               />
            ) : (
               <img src={noProductImage} alt={product.name} />
            )}
         </div>
         {node.addOnLabel && <Label>{node.addOnLabel}</Label>}
         <div css={tw`flex items-center justify-between`}>
            <section tw="flex items-center">
               <Check
                  size={16}
                  tw="flex-shrink-0"
                  className={`${isActive ? 'active' : ''}`}
               />
               <Link tw="text-gray-700" to={'#'}>
                  {product.name} - {product.label}
               </Link>
            </section>
            {canAdd() && (
               <button
                  disabled={!node.isAvailable}
                  onClick={() => add(node.cartItem)}
                  title={
                     node.isAvailable
                        ? 'Add product'
                        : 'This product is out of stock.'
                  }
                  css={[
                     tw`flex-shrink-0 text-sm uppercase font-bold tracking-wider border border-gray-300 rounded px-1 text-gray-500`,
                     !node.isAvailable && tw`cursor-not-allowed text-gray-400`,
                  ]}
               >
                  {node.isAvailable ? (
                     <>
                        {isActive ? 'REPEAT' : 'ADD'}
                        {node.addOnPrice > 0 && ' + '}
                        {node.addOnPrice > 0 &&
                           formatCurrency(Number(node.addOnPrice) || 0)}
                     </>
                  ) : (
                     'Out of Stock'
                  )}
               </button>
            )}
         </div>
         <p>{product?.additionalText}</p>
      </Styles.Product>
   )
}

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
   Type: styled.span`
      position: absolute;
      top: 8px;
      right: 8px;
   `,
}

const Products = styled.ul`
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

const Label = styled.span`
   top: 16px;
   ${tw`
      px-2
      absolute 
      rounded-r
      bg-green-500 
      text-sm uppercase font-medium tracking-wider text-white 
   `}
`
