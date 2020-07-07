import React from 'react'
import fetch from 'isomorphic-fetch'

// Apollo Client Imports
import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { ApolloProvider as Provider } from '@apollo/react-hooks'

const authLink = setContext((_, { headers }) => {
   return {
      headers: {
         ...headers,
         'x-hasura-admin-secret': `${process.env.GATSBY_ADMIN_SECRET}`,
      },
   }
})

const wsLink = process.browser
   ? new WebSocketLink({
        uri: process.env.GATSBY_DATA_HUB_WSS,
        options: {
           reconnect: true,
           connectionParams: {
              headers: {
                 'x-hasura-admin-secret': `${process.env.GATSBY_ADMIN_SECRET}`,
              },
           },
        },
     })
   : null

const httpLink = new HttpLink({
   uri: process.env.GATSBY_DATA_HUB_HTTPS,
})

const link = process.browser
   ? split(
        ({ query }) => {
           const definition = getMainDefinition(query)
           return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
           )
        },
        wsLink,
        authLink.concat(httpLink)
     )
   : httpLink

const client = new ApolloClient({
   link,
   fetch,
   cache: new InMemoryCache(),
})

export const ApolloProvider = ({ children }) => {
   return <Provider client={client}>{children}</Provider>
}
