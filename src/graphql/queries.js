import gql from 'graphql-tag'

export const ITEM_COUNT = gql`
   query itemCount($id: Int!, $zipcode: String) {
      itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
         id
         valid: subscriptions(
            where: { availableZipcodes: { zipcode: { _eq: $zipcode } } }
         ) {
            id
            rrule
            leadTime
            zipcodes: availableZipcodes(where: { zipcode: { _eq: $zipcode } }) {
               deliveryPrice
               isDeliveryActive
               isPickupActive
            }
         }
         invalid: subscriptions(
            where: {
               _not: { availableZipcodes: { zipcode: { _eq: $zipcode } } }
            }
         ) {
            id
            rrule
            leadTime
            zipcodes: availableZipcodes(where: { zipcode: { _eq: $zipcode } }) {
               deliveryPrice
               isDeliveryActive
               isPickupActive
            }
         }
      }
   }
`

export const PLANS = gql`
   subscription plans($brandId: Int!) {
      plans: subscription_subscriptionTitle(
         where: {
            isActive: { _eq: true }
            brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
         }
      ) {
         id
         title
         defaultServingId: defaultSubscriptionServingId
         defaultServing: defaultSubscriptionServing {
            id
            size: servingSize
            defaultItemCount: defaultSubscriptionItemCount {
               id
               count
               price
               isTaxIncluded
            }
            itemCounts: subscriptionItemCounts {
               id
               count
               price
               isTaxIncluded
            }
         }
         servings: subscriptionServings(
            order_by: { servingSize: asc }
            where: { isActive: { _eq: true } }
         ) {
            id
            size: servingSize
            defaultItemCountId: defaultSubscriptionItemCountId
            defaultItemCount: defaultSubscriptionItemCount {
               id
               count
               price
               isTaxIncluded
            }
            itemCounts: subscriptionItemCounts(
               order_by: { count: asc, price: asc }
               where: { isActive: { _eq: true } }
            ) {
               id
               count
               price
               isTaxIncluded
            }
         }
      }
   }
`

export const OCCURENCES_BY_SUBSCRIPTION = gql`
   query subscription(
      $id: Int!
      $where: subscription_subscriptionOccurence_bool_exp
   ) {
      subscription: subscription_subscription_by_pk(id: $id) {
         id
         occurences: subscriptionOccurences(where: $where) {
            id
            isValid
            isVisible
            fulfillmentDate
         }
      }
   }
`

export const OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES = gql`
   query categories(
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      categories: productCategories(
         where: {
            subscriptionOccurenceAddOnProducts: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
               isAvailable: { _eq: true }
               isVisible: { _eq: true }
            }
         }
      ) {
         name
         productsAggregate: subscriptionOccurenceAddOnProducts_aggregate(
            where: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
            }
         ) {
            aggregate {
               count
            }
            nodes {
               id
               cartItem
               isSingleSelect
               productOption {
                  id
                  label
                  product {
                     name
                     assets
                     additionalText
                  }
               }
            }
         }
      }
   }
`

export const OCCURENCE_PRODUCTS_BY_CATEGORIES = gql`
   query categories(
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      categories: productCategories(
         where: {
            subscriptionOccurenceProducts: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
               isAvailable: { _eq: true }
               isVisible: { _eq: true }
            }
         }
      ) {
         name
         productsAggregate: subscriptionOccurenceProducts_aggregate(
            where: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
            }
         ) {
            aggregate {
               count
            }
            nodes {
               id
               cartItem
               addOnLabel
               addOnPrice
               isSingleSelect
               productOption {
                  id
                  label
                  product {
                     name
                     assets
                     additionalText
                  }
               }
            }
         }
      }
   }
`

export const RECIPE_DETAILS = gql`
   query product($id: Int!, $yieldId: Int!) {
      product: simpleRecipeProduct(id: $id) {
         id
         recipe: simpleRecipe {
            id
            name
            author
            cookingTime
            cuisine
            description
            image
            assets
            richResult
            yields: simpleRecipeYields(where: { id: { _eq: $yieldId } }) {
               id
               yield
               sachets: ingredientSachets {
                  isVisible
                  slipName
                  ingredient: ingredientSachet {
                     id
                  }
               }
            }
         }
      }
   }
`

export const INVENTORY_DETAILS = gql`
   query inventoryProduct(
      $id: Int!
      $args: products_inventoryProductCartItem_args!
   ) {
      inventoryProduct(id: $id) {
         cartItem(args: $args)
      }
   }
`

export const CART_BY_WEEK = gql`
   subscription subscriptionOccurenceCustomer(
      $keycloakId: String!
      $weekId: Int!
      $brand_customerId: Int!
   ) {
      subscriptionOccurenceCustomer: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         subscriptionOccurenceId: $weekId
         brand_customerId: $brand_customerId
      ) {
         isAuto
         isSkipped
         validStatus
         cart {
            id
            status
            address
            walletAmountUsable
            loyaltyPointsUsable
            walletAmountUsed
            loyaltyPointsUsed
            billingDetails
            fulfillmentInfo
            transactionId
            products: cartItemViews(where: { level: { _eq: 1 } }) {
               id
               name: displayName
               image: displayImage
               isAddOn
               unitPrice
               addOnLabel
               addOnPrice
               isAutoAdded
               subscriptionOccurenceProductId
               subscriptionOccurenceAddOnProductId
            }
         }
      }
   }
`

export const ZIPCODE = gql`
   subscription zipcode($subscriptionId: Int!, $zipcode: String!) {
      zipcode: subscription_subscription_zipcode_by_pk(
         subscriptionId: $subscriptionId
         zipcode: $zipcode
      ) {
         deliveryTime
         deliveryPrice
         isPickupActive
         isDeliveryActive
         defaultAutoSelectFulfillmentMode
         pickupOptionId: subscriptionPickupOptionId
         pickupOption: subscriptionPickupOption {
            id
            time
            address
         }
      }
   }
`

export const CART = gql`
   query cart($id: Int!) {
      cart(id: $id) {
         id
         tax
         tip
         address
         totalPrice
         paymentStatus
         deliveryPrice
         billingDetails
         fulfillmentInfo
         transactionId
         transactionRemark
         stripeInvoiceId
         stripeInvoiceDetails
         products: cartItemViews(where: { level: { _eq: 1 } }) {
            id
            isAddOn
            unitPrice
            addOnLabel
            addOnPrice
            isAutoAdded
            name: displayName
            image: displayImage
            subscriptionOccurenceProductId
            subscriptionOccurenceAddOnProductId
         }
      }
   }
`

export const CART_STATUS = gql`
   subscription cart($id: Int!) {
      cart(id: $id) {
         status
         orderId
         address
         transactionId
         transactionRemark
         paymentStatus
         fulfillmentInfo
         billingDetails
         products: cartItemViews(where: { level: { _eq: 1 } }) {
            id
            name: displayName
            image: displayImage
            isAddOn
            unitPrice
            addOnLabel
            addOnPrice
            isAutoAdded
            subscriptionOccurenceProductId
            subscriptionOccurenceAddOnProductId
         }
      }
   }
`

export const ORDER_HISTORY = gql`
   subscription orders($keycloakId: String_comparison_exp!) {
      orders: subscription_subscriptionOccurence_customer_aggregate(
         where: {
            keycloakId: $keycloakId
            cart: {
               paymentStatus: { _eq: "SUCCEEDED" }
               status: { _nin: ["CART_PENDING", "CART_PROCESS"] }
            }
         }
         order_by: { subscriptionOccurence: { fulfillmentDate: desc } }
      ) {
         aggregate {
            count
         }
         nodes {
            occurenceId: subscriptionOccurenceId
            occurence: subscriptionOccurence {
               date: fulfillmentDate
            }
         }
      }
   }
`

export const ORDER = gql`
   subscription order(
      $keycloakId: String!
      $subscriptionOccurenceId: Int!
      $brand_customerId: Int!
   ) {
      order: subscription_subscriptionOccurence_customer_by_pk(
         keycloakId: $keycloakId
         brand_customerId: $brand_customerId
         subscriptionOccurenceId: $subscriptionOccurenceId
      ) {
         isSkipped
         validStatus
         occurrence: subscriptionOccurence {
            id
            subscription {
               id
               item: subscriptionItemCount {
                  id
                  price
               }
            }
         }
         cart {
            id
            status
            address
            itemTotal
            addOnTotal
            totalPrice
            deliveryPrice
            paymentMethodId
            billingDetails
            fulfillmentInfo
            products: cartItemViews(where: { level: { _eq: 1 } }) {
               id
               name: displayName
               image: displayImage
               isAddOn
               unitPrice
               addOnLabel
               addOnPrice
               isAutoAdded
               subscriptionOccurenceProductId
               subscriptionOccurenceAddOnProductId
            }
         }
      }
   }
`

export const ZIPCODE_AVAILABILITY = gql`
   query subscription_zipcode(
      $subscriptionId: Int_comparison_exp!
      $zipcode: String_comparison_exp!
   ) {
      subscription_zipcode: subscription_subscription_zipcode(
         where: { subscriptionId: $subscriptionId, zipcode: $zipcode }
      ) {
         zipcode
         subscriptionId
      }
   }
`

export const INFORMATION_GRID = gql`
   subscription infoGrid($identifier: String_comparison_exp!) {
      infoGrid: content_informationGrid(
         where: { isVisible: { _eq: true }, identifier: $identifier }
      ) {
         id
         heading
         subHeading
         identifier
         columnsCount
         blockOrientation
         blocks: informationBlocks {
            id
            title
            thumbnail
            description
         }
      }
   }
`

export const FAQ = gql`
   subscription faq(
      $page: String_comparison_exp!
      $identifier: String_comparison_exp!
   ) {
      faq: content_faqs(
         where: {
            page: $page
            isVisible: { _eq: true }
            identifier: $identifier
         }
      ) {
         id
         heading
         subHeading
         identifier
         blocks: informationBlocks {
            id
            title
            description
         }
      }
   }
`

export const OUR_MENU = {
   TITLES: gql`
      query titles($brandId: Int!) {
         titles: subscription_subscriptionTitle(
            where: {
               isActive: { _eq: true }
               brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
            }
         ) {
            id
            title
         }
      }
   `,
   TITLE: gql`
      query title($id: Int!) {
         title: subscription_subscriptionTitle_by_pk(id: $id) {
            id
            servings: subscriptionServings(where: { isActive: { _eq: true } }) {
               id
               size: servingSize
            }
         }
      }
   `,
   SERVING: gql`
      query serving($id: Int!) {
         serving: subscription_subscriptionServing_by_pk(id: $id) {
            id
            size: servingSize
            counts: subscriptionItemCounts(where: { isActive: { _eq: true } }) {
               id
               count
            }
         }
      }
   `,
   ITEM_COUNT: gql`
      query itemCount($id: Int!) {
         itemCount: subscription_subscriptionItemCount_by_pk(id: $id) {
            id
            count
            subscriptions {
               id
               rrule
            }
         }
      }
   `,
   SUBSCRIPTION: gql`
      query subscription($id: Int!) {
         subscription: subscription_subscription_by_pk(id: $id) {
            id
            occurences: subscriptionOccurences {
               id
               isValid
               isVisible
               fulfillmentDate
            }
         }
      }
   `,
}

export const SETTINGS = gql`
   subscription settings($domain: String_comparison_exp) {
      settings: brands_brand_subscriptionStoreSetting(
         where: {
            brand: { _or: [{ domain: $domain }, { isDefault: { _eq: true } }] }
         }
      ) {
         value
         brandId
         meta: subscriptionStoreSetting {
            id
            type
            identifier
         }
      }
   }
`

export const CUSTOMER = {
   DETAILS: gql`
      query customer($keycloakId: String!, $brandId: Int!) {
         customer(keycloakId: $keycloakId) {
            id
            keycloakId
            isSubscriber
            wallets(where: { brandId: { _eq: $brandId } }) {
               id
               amount
            }
            loyaltyPoints(where: { brandId: { _eq: $brandId } }) {
               id
               points
            }
            customerReferrals(where: { brandId: { _eq: $brandId } }) {
               id
               referralCode
               referredByCode
            }
            customerByClients: platform_customerByClients {
               stripeCustomerId: organizationStripeCustomerId
            }
            brandCustomers(where: { brandId: { _eq: $brandId } }) {
               id
               brandId
               keycloakId
               isSubscriber
               subscriptionId
               subscriptionAddressId
               subscriptionPaymentMethodId
               subscription {
                  recipes: subscriptionItemCount {
                     count
                     price
                     tax
                     isTaxIncluded
                     servingId: subscriptionServingId
                     serving: subscriptionServing {
                        size: servingSize
                     }
                  }
               }
            }
            platform_customer {
               email
               firstName
               lastName
               keycloakId
               phoneNumber
               stripeCustomerId
               addresses: customerAddresses(order_by: { created_at: desc }) {
                  id
                  lat
                  lng
                  line1
                  line2
                  city
                  state
                  country
                  zipcode
                  label
                  notes
               }
               paymentMethods: stripePaymentMethods {
                  brand
                  last4
                  country
                  expMonth
                  expYear
                  funding
                  keycloakId
                  cardHolderName
                  stripePaymentMethodId
               }
            }
         }
      }
   `,
}

export const GET_FILEID = gql`
   query GET_FILEID($divId: [String!]!) {
      content_subscriptionDivIds(where: { id: { _in: $divId } }) {
         fileId
         id
         subscriptionDivFileId {
            linkedCssFiles {
               cssFile {
                  path
               }
            }
            linkedJsFiles {
               jsFile {
                  path
               }
            }
         }
      }
   }
`
export const COUPONS = gql`
   subscription Coupons($params: jsonb, $brandId: Int!) {
      coupons(
         where: {
            isActive: { _eq: true }
            isArchived: { _eq: false }
            brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
         }
      ) {
         id
         code
         isRewardMulti
         rewards(order_by: { priority: desc }) {
            id
            condition {
               isValid(args: { params: $params })
            }
         }
         metaDetails
         visibilityCondition {
            isValid(args: { params: $params })
         }
      }
   }
`

export const CART_REWARDS = gql`
   subscription CartRewards($cartId: Int!, $params: jsonb) {
      cartRewards(where: { cartId: { _eq: $cartId } }) {
         reward {
            id
            coupon {
               id
               code
            }
            condition {
               isValid(args: { params: $params })
            }
         }
      }
   }
`

export const ORGANIZATION = gql`
   query organizations {
      organizations {
         id
         stripeAccountId
         stripeAccountType
      }
   }
`

export const REFERRER = gql`
   query customerReferral($brandId: Int!, $code: String!) {
      customerReferrals(
         where: { brandId: { _eq: $brandId }, referralCode: { _eq: $code } }
      ) {
         id
         customer {
            platform_customer {
               firstName
               lastName
            }
         }
      }
   }
`
