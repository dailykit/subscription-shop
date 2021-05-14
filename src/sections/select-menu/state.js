import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { navigate } from 'gatsby'
import { useLocation } from '@reach/router'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { PageLoader } from '../../components'
import {
   ZIPCODE,
   MUTATIONS,
   CART_BY_WEEK,
   INSERT_CART_ITEM,
   DELETE_CART_ITEM,
   OCCURENCES_BY_SUBSCRIPTION,
} from '../../graphql'

export const MenuContext = React.createContext()

const initialState = {
   week: {},
   isOccurencesLoading: true,
   occurences: [],
   isCartFull: false,
   cartState: 'IDLE',
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_WEEK': {
         return {
            ...state,
            week: payload,
            cartState: 'IDLE',
         }
      }
      case 'SET_IS_OCCURENCES_LOADING':
         return { ...state, isOccurencesLoading: payload }
      case 'IS_CART_FULL':
         return { ...state, isCartFull: payload }
      case 'CART_STATE':
         return {
            ...state,
            cartState: payload,
         }
      case 'SET_OCCURENCES':
         return {
            ...state,
            occurences: payload,
         }
      default:
         return 'No such type!'
   }
}

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

const insertCartId = (node, cartId) => {
   if (node.childs.data.length > 0) {
      node.childs.data = node.childs.data.map(item => {
         if (item.childs.data.length > 0) {
            item.childs.data = item.childs.data.map(item => ({
               ...item,
               cartId,
            }))
         }
         return { ...item, cartId }
      })
   }
   node.cartId = cartId

   return node
}

export const MenuProvider = ({ children }) => {
   const { user } = useUser()
   const location = useLocation()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const [cart, setCart] = React.useState({})
   const [fulfillment, setFulfillment] = React.useState({})
   const [isCustomerLoading, setIsCustomerLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initialState)

   const {
      error: occurenceCustomerError,
      loading: occurenceCustomerLoading,
      data: { subscriptionOccurenceCustomer: occurenceCustomer = {} } = {},
   } = useSubscription(CART_BY_WEEK, {
      skip: !state.week.id || !user.keycloakId || !user.brandCustomerId,
      variables: {
         weekId: state.week.id,
         keycloakId: user?.keycloakId,
         brand_customerId: user?.brandCustomerId,
      },
      onSubscriptionData: () => {
         dispatch({ type: 'IS_CART_FULL', payload: false })
         setIsCustomerLoading(false)
      },
   })

   if (!occurenceCustomerLoading && occurenceCustomerError) {
      setIsCustomerLoading(false)
      addToast('Failed to fetch week details', {
         appearance: 'error',
      })
   }

   const [updateOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPDATE,
      {
         onError: error =>
            console.log('updateOccurenceCustomer => error =>', error),
      }
   )
   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onError: error => console.log('createCart => error =>', error),
   })
   const [insertCartItem] = useMutation(INSERT_CART_ITEM, {
      onCompleted: () => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => console.log('insertCartItem => error =>', error),
   })
   const [deleteCartItem] = useMutation(DELETE_CART_ITEM, {
      onCompleted: () => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => console.log('deleteCartItem => error =>', error),
   })
   const {
      loading: loadingZipcode,
      data: { zipcode = {} } = {},
   } = useSubscription(ZIPCODE, {
      skip:
         !user?.subscriptionId ||
         !user?.defaultAddress?.zipcode ||
         !state.week?.id,
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
   })

   React.useEffect(() => {
      if (!loadingZipcode && !isEmpty(zipcode) && state.week?.fulfillmentDate) {
         if (
            zipcode.isDeliveryActive &&
            zipcode?.deliveryTime?.from &&
            zipcode?.deliveryTime?.to
         ) {
            setFulfillment({
               type: 'PREORDER_DELIVERY',
               slot: {
                  from: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.deliveryTime?.from
                  ),
                  to: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.deliveryTime?.to
                  ),
               },
            })
         } else if (
            zipcode.isPickupActive &&
            zipcode.pickupOptionId &&
            zipcode?.pickupOption?.time?.from &&
            zipcode?.pickupOption?.time?.to
         ) {
            setFulfillment({
               type: 'PREORDER_PICKUP',
               slot: {
                  from: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.pickupOption?.time?.from
                  ),
                  to: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.pickupOption?.time?.to
                  ),
               },
               address: zipcode?.pickupOption?.address,
            })
         }
      }
   }, [loadingZipcode, zipcode, state.week])

   const [insertOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.CREATE.ONE,
      {
         skip:
            state.isOccurencesLoading ||
            occurenceCustomerLoading ||
            !state?.week?.id,
         onError: error => console.log(error),
      }
   )
   useQuery(OCCURENCES_BY_SUBSCRIPTION, {
      skip: !user?.subscriptionId,
      variables: {
         id: user?.subscriptionId,
         where: {
            subscriptionOccurenceView: {
               isValid: { _eq: true },
               isVisible: { _eq: true },
            },
            ...(Boolean(new URL(location.href).searchParams.get('date')) && {
               fulfillmentDate: {
                  _eq: new URL(location.href).searchParams.get('date'),
               },
            }),
         },
         where1: { keycloakId: { _eq: user?.keycloakId } },
      },
      onCompleted: ({ subscription = {} } = {}) => {
         if (subscription?.occurences?.length > 0) {
            const d = new URL(location.href).searchParams.get('d')
            const date = new URL(location.href).searchParams.get('date')
            let validWeekIndex = null
            if (d !== undefined && d !== null) {
               validWeekIndex = subscription?.occurences.findIndex(
                  node => node.fulfillmentDate === d
               )
            } else if (date !== undefined && date !== null) {
               validWeekIndex = subscription?.occurences.findIndex(
                  node => node.fulfillmentDate === date
               )
            } else {
               validWeekIndex = subscription?.occurences.findIndex(node => {
                  const { customers = [] } = node
                  return customers.every(
                     ({ itemCountValid }) => !itemCountValid
                  )
               })
               navigate(
                  '/subscription/menu?d=' +
                     subscription?.occurences[validWeekIndex].fulfillmentDate
               )
            }
            if (validWeekIndex === -1) {
               dispatch({
                  type: 'SET_WEEK',
                  payload: subscription?.occurences[0],
               })
            } else {
               dispatch({
                  type: 'SET_WEEK',
                  payload: subscription?.occurences[validWeekIndex],
               })
            }
            dispatch({ type: 'SET_IS_OCCURENCES_LOADING', payload: false })
            dispatch({
               type: 'SET_OCCURENCES',
               payload: subscription?.occurences,
            })
         } else if (
            subscription?.occurences?.length === 0 &&
            user?.subscriptionId
         ) {
            addToast('No weeks are available for menu selection.', {
               appearance: 'error',
            })
         }
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      if (
         !isCustomerLoading &&
         !state.isOccurencesLoading &&
         !occurenceCustomerLoading &&
         state.week?.id
      ) {
         if (isEmpty(occurenceCustomer)) {
            insertOccurenceCustomer({
               variables: {
                  object: {
                     isAuto: false,
                     keycloakId: user.keycloakId,
                     isSkipped: !state.week.isValid,
                     subscriptionOccurenceId: state.week.id,
                     brand_customerId: user.brandCustomerId,
                  },
               },
            })
         } else {
            setCart(occurenceCustomer)
         }
      }
   }, [
      isCustomerLoading,
      state.isOccurencesLoading,
      occurenceCustomerLoading,
      state.week,
      occurenceCustomer,
   ])

   const removeProduct = item => {
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })
      deleteCartItem({
         variables: { id: item.id },
      }).then(() =>
         addToast(`You've removed the product - ${item.name}.`, {
            appearance: 'info',
         })
      )
   }

   const store = configOf('Store Availability', 'availability')
   const addProduct = item => {
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })

      const isSkipped = occurenceCustomer?.isSkipped
      if (occurenceCustomer?.validStatus?.hasCart) {
         const cart = insertCartId(item, occurenceCustomer?.cart?.id)
         insertCartItem({
            variables: { object: cart },
         })
            .then(({ data: { createCartItem = {} } = {} }) => {
               const { products = [] } = createCartItem
               if (!isEmpty(products)) {
                  const [product] = products
                  addToast(`You've added the product - ${product.name}.`, {
                     appearance: 'info',
                  })
               }

               updateOccurenceCustomer({
                  variables: {
                     pk_columns: {
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: state.week.id,
                        brand_customerId: user.brandCustomerId,
                     },
                     _set: {
                        isSkipped: false,
                        cartId: createCartItem?.cart?.id,
                     },
                  },
               }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
                  if (!item?.isAddOn) {
                     dispatch({
                        type: 'IS_CART_FULL',
                        payload:
                           updateOccurenceCustomer?.validStatus?.itemCountValid,
                     })
                  }
                  if (updateOccurenceCustomer?.isSkipped !== isSkipped) {
                     if (!updateOccurenceCustomer?.isSkipped) {
                        addToast('This week has been unskipped.', {
                           appearance: 'info',
                        })
                     }
                  }
               })
            })
            .catch(error =>
               console.log('addProduct -> insertCartItem ->', error)
            )
      } else {
         const customerInfo = {
            customerEmail: user?.platform_customer?.email || '',
            customerPhone: user?.platform_customer?.phoneNumber || '',
            customerLastName: user?.platform_customer?.lastName || '',
            customerFirstName: user?.platform_customer?.firstName || '',
         }
         createCart({
            variables: {
               object: {
                  customerInfo,
                  brandId: brand.id,
                  status: 'CART_PENDING',
                  customerId: user.id,
                  source: 'subscription',
                  paymentStatus: 'PENDING',
                  address: user.defaultAddress,
                  fulfillmentInfo: fulfillment,
                  customerKeycloakId: user.keycloakId,
                  subscriptionOccurenceId: state.week.id,
                  isTest: user?.isTest || !store?.isStoreLive,
                  ...(user?.subscriptionPaymentMethodId && {
                     paymentMethodId: user?.subscriptionPaymentMethodId,
                  }),
                  stripeCustomerId: user?.platform_customer?.stripeCustomerId,
               },
            },
         })
            .then(({ data: { createCart = {} } = {} }) => {
               const cart = insertCartId(item, createCart?.id)
               insertCartItem({
                  variables: { object: cart },
               }).then(({ data: { createCartItem = {} } = {} }) => {
                  const { products = [] } = createCartItem
                  if (!isEmpty(products)) {
                     const [product] = products
                     addToast(`You've added the product - ${product.name}.`, {
                        appearance: 'info',
                     })
                  }
                  updateOccurenceCustomer({
                     variables: {
                        pk_columns: {
                           keycloakId: user.keycloakId,
                           subscriptionOccurenceId: state.week.id,
                           brand_customerId: user.brandCustomerId,
                        },
                        _set: {
                           isSkipped: false,
                           cartId: createCartItem?.cart?.id,
                        },
                     },
                  }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
                     if (!item?.isAddOn) {
                        dispatch({
                           type: 'IS_CART_FULL',
                           payload:
                              updateOccurenceCustomer?.validStatus
                                 ?.itemCountValid,
                        })
                     }
                     if (updateOccurenceCustomer?.isSkipped !== isSkipped) {
                        if (!updateOccurenceCustomer?.isSkipped) {
                           addToast('This week has been unskipped.', {
                              appearance: 'info',
                           })
                        }
                     }
                  })
               })
            })
            .catch(error => console.log('addProduct -> createCart ->', error))
      }
   }

   if (
      [
         state.isOccurencesLoading,
         loadingZipcode,
         isCustomerLoading,
         occurenceCustomerLoading,
         !Boolean(state.week?.id),
      ].every(node => node)
   )
      return <PageLoader />
   return (
      <MenuContext.Provider
         value={{
            state: { ...state, occurenceCustomer: cart, fulfillment },
            methods: {
               products: {
                  add: addProduct,
                  delete: removeProduct,
               },
            },
            dispatch,
         }}
      >
         {children}
      </MenuContext.Provider>
   )
}

export const useMenu = () => React.useContext(MenuContext)
