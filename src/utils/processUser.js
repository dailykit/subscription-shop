import { isEmpty } from 'lodash'

export const processUser = customer => {
   const sub = {}
   const { brandCustomers = [], ...rest } = customer

   if (!isEmpty(brandCustomers)) {
      const [brand_customer] = brandCustomers

      const {
         id,
         subscription = null,
         subscriptionId = null,
         subscriptionAddressId = null,
         subscriptionPaymentMethodId = null,
      } = brand_customer

      rest.brandCustomerId = id
      rest.subscription = subscription
      rest.subscriptionId = subscriptionId
      rest.subscriptionAddressId = subscriptionAddressId
      rest.subscriptionPaymentMethodId = subscriptionPaymentMethodId

      sub.defaultAddress = rest?.platform_customer?.addresses.find(
         address => address.id === subscriptionAddressId
      )

      sub.defaultPaymentMethod = rest?.platform_customer?.paymentMethods.find(
         method => method.stripePaymentMethodId === subscriptionPaymentMethodId
      )
   }
   return { ...rest, ...sub }
}
