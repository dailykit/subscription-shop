import React from 'react'
import { Link } from 'gatsby'
import { isEmpty, uniqBy } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { formatCurrency } from '../../utils'
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'

export const Menu = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state } = useMenu()
   const { configOf } = useConfig()
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
                     />
                  ))}
               </Products>
            </section>
         ))}
      </main>
   )
}

const Product = ({ node, isAdded, theme }) => {
   const { addToast } = useToasts()
   const { state, methods } = useMenu()

   const add = item => {
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
      image:
         node?.productOption?.product?.assets?.images?.length > 0
            ? node?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: node?.productOption?.product?.additionalText || '',
   }

   return (
      <Styles.Product theme={theme} className={`${isActive ? 'active' : ''}`}>
         <div
            css={tw`flex items-center justify-center h-48 bg-gray-200 mb-2 rounded overflow-hidden`}
         >
            {product.image ? (
               <img
                  alt={product.name}
                  src={product.image}
                  title={product?.name}
                  css={tw`h-full w-full object-cover select-none`}
               />
            ) : (
               <span>No Photos</span>
            )}
         </div>
         {node.addOnLabel && (
            <Label>
               {node.addOnLabel} {formatCurrency(Number(node.addOnPrice) || 0)}
            </Label>
         )}
         <div css={tw`flex items-center justify-between`}>
            <section tw="flex items-center">
               <Check
                  size={16}
                  tw="flex-shrink-0"
                  className={`${isActive ? 'active' : ''}`}
               />
               <Link tw="text-gray-700" to={'#'}>
                  {product.name}
               </Link>
            </section>
            {canAdd() && (
               <button
                  onClick={() => add(node.cartItem)}
                  tw="text-sm uppercase font-medium tracking-wider border border-gray-300 rounded px-1 text-gray-500"
               >
                  {isActive ? 'Add Again' : 'Add'}
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
