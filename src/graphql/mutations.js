import gql from 'graphql-tag'

export const MUTATIONS = {
   CUSTOMER: {
      UPDATE: gql`
         mutation updateCustomer(
            $keycloakId: String!
            $_set: crm_customer_set_input!
         ) {
            updateCustomer(
               pk_columns: { keycloakId: $keycloakId }
               _set: $_set
            ) {
               id
            }
         }
      `,
      CREATE: gql`
         mutation createCustomer($object: crm_customer_insert_input!) {
            createCustomer(object: $object) {
               id
               keycloakId
            }
         }
      `,
      ADDRESS: {
         CREATE: gql`
            mutation createCustomerAddress(
               $object: platform_customerAddress_insert_input!
            ) {
               createCustomerAddress: platform_createCustomerAddress(
                  object: $object
               ) {
                  id
               }
            }
         `,
      },
   },
   OCCURENCE: {
      CUSTOMER: {
         CREATE: {
            MULTIPLE: gql`
               mutation insertSubscriptionOccurenceCustomers(
                  $objects: [subscription_subscriptionOccurence_customer_insert_input!]!
               ) {
                  insertSubscriptionOccurenceCustomers: insert_subscription_subscriptionOccurence_customer(
                     objects: $objects
                  ) {
                     returning {
                        keycloakId
                        subscriptionOccurenceId
                     }
                  }
               }
            `,
         },
         UPDATE: gql`
            mutation updateOccurenceCustomer(
               $pk_columns: subscription_subscriptionOccurence_customer_pk_columns_input!
               $_set: subscription_subscriptionOccurence_customer_set_input!
            ) {
               updateOccurenceCustomer: update_subscription_subscriptionOccurence_customer_by_pk(
                  pk_columns: $pk_columns
                  _set: $_set
               ) {
                  isAuto
                  isSkipped
                  validStatus
               }
            }
         `,
         UPSERT: gql`
            mutation upsertOccurenceCustomerCart(
               $object: subscription_subscriptionOccurence_customer_insert_input!
            ) {
               upsertOccurenceCustomerCart: insert_subscription_subscriptionOccurence_customer_one(
                  on_conflict: {
                     constraint: subscriptionOccurence_customer_pkey
                     update_columns: [isSkipped]
                  }
                  object: $object
               ) {
                  isSkipped
               }
            }
         `,
      },
   },
   CART: {
      CREATE: gql`
         mutation createCart($object: order_cart_insert_input!) {
            createCart(object: $object) {
               id
               subscriptionOccurenceCustomer {
                  isSkipped
                  validStatus
               }
            }
         }
      `,
      UPSERT: gql`
         mutation upsertCart(
            $object: order_cart_insert_input!
            $on_conflict: order_cart_on_conflict!
         ) {
            upsertCart: createCart(object: $object, on_conflict: $on_conflict) {
               id
               subscriptionOccurenceCustomer {
                  validStatus
                  isSkipped
               }
            }
         }
      `,
   },
}

export const UPDATE_DAILYKEY_CUSTOMER = gql`
   mutation updateCustomers(
      $keycloakId: String!
      $_set: platform_customer_set_input!
   ) {
      platform_updateCustomer(
         pk_columns: { keycloakId: $keycloakId }
         _set: $_set
      ) {
         keycloakId
      }
   }
`

export const CREATE_STRIPE_PAYMENT_METHOD = gql`
   mutation paymentMethod($object: platform_stripePaymentMethod_insert_input!) {
      paymentMethod: platform_createStripePaymentMethod(object: $object) {
         keycloakId
         stripePaymentMethodId
      }
   }
`

export const UPDATE_CART = gql`
   mutation updateCart($id: Int!, $_set: order_cart_set_input!) {
      updateCart(pk_columns: { id: $id }, _set: $_set) {
         id
      }
   }
`

export const BRAND = {
   CUSTOMER: {
      CREATE: gql`
         mutation createBrandCustomer(
            $object: crm_brand_customer_insert_input!
         ) {
            createBrandCustomer(object: $object) {
               id
            }
         }
      `,
      UPDATE: gql`
         mutation updateBrandCustomers(
            $where: crm_brand_customer_bool_exp!
            $_set: crm_brand_customer_set_input!
         ) {
            updateBrandCustomers(where: $where, _set: $_set) {
               affected_rows
            }
         }
      `,
   },
}

export const DELETE_CART_ITEM = gql`
   mutation deleteCartItem($id: Int!) {
      deleteCartItem(id: $id) {
         id
      }
   }
`

export const INSERT_CART_ITEM = gql`
   mutation createCartItem($object: order_cartItem_insert_input!) {
      createCartItem(object: $object) {
         id
         cart {
            id
            subscriptionOccurenceCustomer {
               isSkipped
               validStatus
            }
         }
         cartItemProducts {
            id
            name
            image
         }
      }
   }
`
