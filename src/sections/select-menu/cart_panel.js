import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import { useLocation } from '@reach/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { CloseIcon } from '../../assets/icons'
import {
   isClient,
   formatCurrency,
   formatDate,
   normalizeAddress,
} from '../../utils'
import {
   ZIPCODE,
   CREATE_CART,
   UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
   INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS,
} from '../../graphql'

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

export const CartPanel = ({ noSkip, isCheckout }) => {
   const { user } = useUser()
   const location = useLocation()
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   console.log(state, user)
   const { configOf } = useConfig()
   const [skipCarts] = useMutation(INSERT_SUBSCRIPTION_OCCURENCE_CUSTOMERS)
   const [upsertCart] = useMutation(CREATE_CART, {
      refetchQueries: () => ['cart'],
      onCompleted: ({ createCart }) => {
         isClient && window.localStorage.setItem('cartId', createCart.id)

         const skipList = new URL(location.href).searchParams.get('previous')

         if (skipList && skipList.split(',').length > 0) {
            skipCarts({
               variables: {
                  objects: skipList.split(',').map(id => ({
                     isSkipped: true,
                     keycloakId: user.keycloakId,
                     subscriptionOccurenceId: id,
                  })),
               },
            })
         }
         addToast('Selected menu has been saved.', {
            appearance: 'success',
         })
         isCheckout && navigate('/subscription/get-started/checkout')
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const [updateCartSkipStatus] = useMutation(
      UPSERT_OCCURENCE_CUSTOMER_CART_SKIP,
      {
         refetchQueries: ['cart'],
         onCompleted: () => {
            if (week.isSkipped) {
               return addToast('Skipped this week', { appearance: 'warning' })
            }
            addToast('This week is now available for menu selection', {
               appearance: 'success',
            })
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )
   const { data: { zipcode = {} } = {} } = useQuery(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
   })
   console.log(zipcode)
   const submitSelection = () => {
      upsertCart({
         variables: {
            object: {
               status: 'PENDING',
               customerId: user.id,
               paymentStatus: 'PENDING',
               cartInfo: {
                  tax,
                  products: week.cart.products,
                  total: isTaxIncluded
                     ? weekTotal - (addOnTotal + zipcode.price)
                     : basePrice,
               },
               ...(user?.subscriptionPaymentMethodId && {
                  paymentMethodId: user?.subscriptionPaymentMethodId,
               }),
               cartSource: 'subscription',
               address: user.defaultAddress,
               customerKeycloakId: user.keycloakId,
               subscriptionOccurenceId: state.week.id,
               stripeCustomerId: user?.platform_customer?.stripeCustomerId,
               ...(week.orderCartId && { id: week.orderCartId }),
               customerInfo: {
                  customerEmail: user?.platform_customer?.email || '',
                  customerPhone: user?.platform_customer?.phoneNumber || '',
                  customerLastName: user?.platform_customer?.lastName || '',
                  customerFirstName: user?.platform_customer?.firstName || '',
               },
               fulfillmentInfo: {
                  type: 'PREORDER_DELIVERY',
                  slot: {
                     from: evalTime(state.week.fulfillmentDate, zipcode?.from),
                     to: evalTime(state.week.fulfillmentDate, zipcode?.to),
                  },
               },

               subscriptionOccurenceCustomers: {
                  data: [
                     {
                        isSkipped: week.isSkipped,
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: state.week.id,
                        brand_customerId: user.brandCustomerId,
                     },
                  ],
                  on_conflict: {
                     constraint: 'subscriptionOccurence_customer_pkey',
                     update_columns: ['isSkipped', 'orderCartId'],
                  },
               },
            },
            on_conflict: {
               constraint: 'orderCart_pkey',
               update_columns: [
                  'amount',
                  'address',
                  'cartInfo',
                  'fulfillmentInfo',
               ],
            },
         },
      })
   }

   const skipWeek = e => {
      dispatch({
         type: 'SKIP_WEEK',
         payload: { weekId: state.week.id, checked: e.target.checked },
      })
      updateCartSkipStatus({
         variables: {
            isSkipped: e.target.checked,
            keycloakId: user.keycloakId,
            subscriptionOccurenceId: state.week.id,
         },
      })
   }

   const isCartValid = () => {
      return (
         week?.cart.products.filter(node => Object.keys(node).length !== 0)
            .length !== user?.subscription?.recipes?.count
      )
   }

   const [showSummaryBar, setShowSummaryBar] = React.useState(true)

   const basePrice = user?.subscription?.recipes?.price
   const itemCountTax = user?.subscription?.recipes?.tax
   const isTaxIncluded = user?.subscription?.recipes?.isTaxIncluded
   const week = state?.weeks[state.week.id]
   const addOnTotal = week?.cart?.products
      .filter(node => Object.keys(node).length > 0)
      .reduce((a, b) => a + b.addOnPrice || 0, 0)
   const chargesTotal = basePrice + addOnTotal + zipcode.price
   const weekTotal = isTaxIncluded
      ? chargesTotal -
        (chargesTotal - (chargesTotal * 100) / (100 + itemCountTax))
      : chargesTotal
   const tax = weekTotal * (itemCountTax / 100)

   const theme = configOf('theme-color', 'Visual')
   return (
      <div>
         {showSummaryBar &&
            (['ORDER_PLACED', 'PROCESS'].includes(week?.orderCartStatus) ? (
               <HelperBar type="success">
                  <HelperBar.SubTitle>
                     Your order has been placed for this week.
                  </HelperBar.SubTitle>
               </HelperBar>
            ) : (
               <SummaryBar>
                  <div>
                     <h4 tw="text-base text-gray-700">
                        Cart{' '}
                        {
                           week?.cart.products.filter(
                              node => Object.keys(node).length !== 0
                           ).length
                        }
                        /{user?.subscription?.recipes?.count}
                     </h4>
                     <h4
                        tw="text-blue-700 pt-2"
                        onClick={() => setShowSummaryBar(false)}
                     >
                        View full summary <span>&#8657;</span>
                     </h4>
                  </div>
                  <SaveButton
                     bg={theme?.accent}
                     disabled={!state?.week?.isValid || isCartValid()}
                     small={true}
                  >
                     {isCheckout ? 'Save and Proceed to Checkout' : 'Save '}
                  </SaveButton>
               </SummaryBar>
            ))}
         <Overlay
            showOverlay={!showSummaryBar}
            onClick={() => setShowSummaryBar(true)}
         />
         <CartWrapper showSummaryBar={showSummaryBar}>
            <header tw="my-3 pb-1 border-b flex items-center justify-between">
               <h4 tw="text-lg text-gray-700">
                  Cart{' '}
                  {
                     week?.cart.products.filter(
                        node => Object.keys(node).length !== 0
                     ).length
                  }
                  /{user?.subscription?.recipes?.count}
               </h4>
               {['PENDING', undefined].includes(week?.orderCartStatus) &&
                  state?.week?.isValid &&
                  !noSkip && (
                     <SkipWeek>
                        <label htmlFor="skip" tw="mr-2 text-gray-600">
                           Skip
                        </label>
                        <input
                           name="skip"
                           type="checkbox"
                           className="toggle"
                           onChange={skipWeek}
                           checked={week?.isSkipped}
                           tw="cursor-pointer appearance-none"
                        />
                     </SkipWeek>
                  )}
               <button
                  tw="md:hidden rounded-full border-2 border-green-400 h-6 w-6 "
                  onClick={() => setShowSummaryBar(true)}
               >
                  <CloseIcon size={16} tw="stroke-current text-green-400" />
               </button>
            </header>
            <CartProducts>
               {week?.cart.products.map((product, index) =>
                  isEmpty(product) ? (
                     <SkeletonCartProduct key={index} />
                  ) : (
                     <CartProduct
                        index={index}
                        product={product}
                        key={`product-${product.cartItemId}-${index}`}
                     />
                  )
               )}
            </CartProducts>
            <h4 tw="text-lg text-gray-700 my-3 pb-1 border-b">Charges</h4>
            <table tw="my-3 w-full table-auto">
               <tbody>
                  <tr>
                     <td tw="border px-2 py-1">Base Price</td>
                     <td tw="text-right border px-2 py-1">
                        {formatCurrency(
                           isTaxIncluded
                              ? weekTotal - (addOnTotal + zipcode.price)
                              : basePrice
                        )}
                     </td>
                  </tr>
                  <tr tw="bg-gray-100">
                     <td tw="border px-2 py-1">Add on Total</td>
                     <td tw="text-right border px-2 py-1">
                        {formatCurrency(addOnTotal)}
                     </td>
                  </tr>
                  <tr>
                     <td tw="border px-2 py-1">Delivery</td>
                     <td tw="text-right border px-2 py-1">
                        {formatCurrency(zipcode.price)}
                     </td>
                  </tr>
                  <tr tw="bg-gray-100">
                     <td tw="border px-2 py-1">Tax</td>
                     <td tw="text-right border px-2 py-1">
                        {formatCurrency(tax || 0)}
                     </td>
                  </tr>
                  <tr>
                     <td tw="border px-2 py-1">Total</td>
                     <td tw="text-right border px-2 py-1">
                        {formatCurrency(weekTotal + tax || 0)}
                     </td>
                  </tr>
               </tbody>
            </table>
            {['ORDER_PLACED', 'PROCESS'].includes(week?.orderCartStatus) ? (
               <HelperBar type="success">
                  <HelperBar.SubTitle>
                     Your order has been placed for this week.
                  </HelperBar.SubTitle>
               </HelperBar>
            ) : (
               <SaveButton
                  bg={theme?.accent}
                  onClick={submitSelection}
                  disabled={!state?.week?.isValid || isCartValid()}
               >
                  {isCheckout
                     ? 'Save and Proceed to Checkout'
                     : 'Save Selection'}
               </SaveButton>
            )}
            <div tw="mt-4 text-gray-500">
               * Your box will be delivered on{' '}
               <span>
                  {formatDate(state.week.fulfillmentDate, {
                     month: 'short',
                     day: 'numeric',
                  })}
                  &nbsp;between {zipcode.from}
                  &nbsp;-&nbsp;
                  {zipcode.to}
               </span>{' '}
               at <span>{normalizeAddress(user.defaultAddress)}</span>
            </div>
         </CartWrapper>
      </div>
   )
}

const SkeletonCartProduct = () => {
   return (
      <SkeletonCartProductContainer>
         <aside tw="w-32 h-16 bg-gray-300 rounded" />
         <main tw="w-full h-16 pl-3">
            <span />
            <span />
         </main>
      </SkeletonCartProductContainer>
   )
}

const CartProduct = ({ product, index }) => {
   const { addToast } = useToasts()
   const { state, dispatch } = useMenu()
   const removeRecipe = () => {
      dispatch({
         type: 'REMOVE_RECIPE',
         payload: { weekId: state.week.id, index },
      })
      addToast(`You've removed the recipe ${product.name}.`, {
         appearance: 'warning',
      })
   }
   return (
      <CartProductContainer>
         <aside tw="flex-shrink-0 relative">
            {product.image ? (
               <img
                  src={product.image}
                  alt={product.name}
                  title={product.name}
                  tw="object-cover rounded w-full h-full"
               />
            ) : (
               <span tw="text-teal-500" title={product.name}>
                  N/A
               </span>
            )}
            {!['ORDER_PLACED', 'PROCESS'].includes(
               state?.weeks[state?.week?.id]?.orderCartStatus
            ) &&
               state?.week?.isValid && (
                  <span className="remove_product">
                     <button onClick={() => removeRecipe()}>
                        <CloseIcon
                           size={16}
                           tw="stroke-current text-green-400"
                        />
                     </button>
                  </span>
               )}
         </aside>
         <main tw="h-16 pl-3">
            <p tw="text-gray-800" title={product.name}>
               {product.name}
            </p>
         </main>
      </CartProductContainer>
   )
}

const CartProducts = styled.ul`
   ${tw`space-y-2`}
   overflow-y: auto;
   max-height: 257px;
`

const SkeletonCartProductContainer = styled.li`
   ${tw`h-20 border flex items-center px-2 rounded`}
   main {
      span {
         ${tw`block h-4 w-40 mb-1 bg-gray-200 rounded-full`}
         :last-child {
            ${tw`w-24`}
         }
      }
   }
`

const CartProductContainer = styled.li`
   ${tw`h-20 bg-white border flex items-center px-2 rounded`}
   aside {
      ${tw`w-24 h-16 bg-gray-300 rounded flex items-center justify-center`}
      span.remove_product {
         display: none;
         background: rgba(0, 0, 0, 0.3);
         ${tw`absolute h-full w-full items-center justify-center`}
         button {
            ${tw`bg-white h-6 w-6 rounded-full flex items-center justify-center`}
         }
      }
      :hover {
         span.remove_product {
            display: flex;
         }
      }
   }
`

const SaveButton = styled.button(
   ({ disabled, bg, small }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-white
      text-center
      bg-green-500
   `}
      ${bg && `background-color: ${bg};`}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-gray-600
         text-center
         bg-gray-200
         cursor-not-allowed 
      `}
      ${small && ` width: max-content; padding: 0 2rem`}
   `
)

const SkipWeek = styled.span(
   () => css`
      ${tw`flex items-center`}

      .toggle {
         height: 18px;
         transition: all 0.2s ease;
         ${tw`relative w-8 inline-block rounded-full border border-gray-400`}
      }
      .toggle:after {
         content: '';
         top: 1px;
         left: 1px;
         width: 14px;
         height: 14px;
         transition: all 0.2s cubic-bezier(0.5, 0.1, 0.75, 1.35);
         ${tw`absolute bg-green-500 rounded-full`}
      }
      .toggle:checked {
         ${tw`border-green-500 bg-green-500`}
      }
      .toggle:checked:after {
         transform: translatex(14px);
         ${tw`bg-white`}
      }
   `
)

const SummaryBar = styled.div`
   ${tw`md:hidden fixed left-0 right-0 bottom-0 z-10 bg-white flex p-3 border-2 justify-between items-center`}
`
const CartWrapper = styled.section(
   ({ showSummaryBar }) => css`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 30%;
         bottom: 0px;
         background-color: #ffff;
         padding: 1rem;
         z-index: 1020;
         overflow: scroll;
         ${showSummaryBar
            ? `display: none`
            : `display: block;
            top: 100%;
            animation: slide 0.5s forwards;
            @keyframes slide{
               100% { top: 30%; }
            }
         `}
      }
   `
)

const Overlay = styled.div(
   ({ showOverlay }) => css`
      @media (max-width: 786px) {
         position: fixed;
         left: 0px;
         right: 0px;
         top: 0px;
         bottom: 0px;
         background-color: rgba(0, 0, 0, 0.6);
         z-index: 1010;
         ${showOverlay ? `display: block` : `display: none`}
      }
   `
)
