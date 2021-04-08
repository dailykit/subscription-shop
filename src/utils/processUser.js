import { isEmpty } from 'lodash'

export const processUser = (customer, stripeAccountType = '') => {
   const sub = {}
   const { brandCustomers = [], customerByClients, ...rest } = customer

   if (!isEmpty(brandCustomers)) {
      const [brand_customer] = brandCustomers

      const {
         id,
         subscription = null,
         subscriptionId = null,
         subscriptionAddressId = null,
         subscriptionPaymentMethodId = null,
         isSubscriptionCancelled = null,
         pausePeriod = null,
      } = brand_customer

      rest.brandCustomerId = id
      rest.isSubscriptionCancelled = isSubscriptionCancelled
      rest.pausePeriod = pausePeriod
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
   if (stripeAccountType === 'standard' && !isEmpty(customerByClients)) {
      const [customerbyClient] = customerByClients
      rest.platform_customer.stripeCustomerId =
         customerbyClient?.stripeCustomerId
   }
   return { ...rest, ...sub }
}
