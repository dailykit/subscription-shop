import gql from 'graphql-tag'

export const UPDATE_CUSTOMER = gql`
   mutation updateCustomer(
      $id: Int!
      $keycloakId: String!
      $_set: crm_customer_set_input!
   ) {
      updateCustomer(
         pk_columns: { id: $id, keycloakId: $keycloakId }
         _set: $_set
      ) {
         id
      }
   }
`

export const CREATE_CUSTOMER = gql`
   mutation createCustomer($object: crm_customer_insert_input!) {
      createCustomer(object: $object) {
         id
      }
   }
`

export const UPDATE_CUSTOMERS = gql`
   mutation updateCustomers(
      $_set: crm_customer_set_input!
      $where: crm_customer_bool_exp!
   ) {
      updateCustomers(where: $where, _set: $_set) {
         returning {
            id
         }
      }
   }
`

export const CREATE_CUSTOMER_ADDRESS = gql`
   mutation createCustomerAddress(
      $object: platform_customerAddress_insert_input!
   ) {
      createCustomerAddress: platform_createCustomerAddress(object: $object) {
         id
      }
   }
`
