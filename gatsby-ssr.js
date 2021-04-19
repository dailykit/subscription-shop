import React from 'react'
import { ToastProvider } from 'react-toast-notifications'

import { ApolloProvider, ConfigProvider } from './src/lib'

export const onRenderBody = ({ setPostBodyComponents }) => {
   setPostBodyComponents([<script src={'/env-config.js'}></script>])
}

export const wrapRootElement = ({ element }) => {
   return <App element={element} />
}

const App = ({ element }) => {
   return (
      <ApolloProvider>
         <ConfigProvider>
            <ToastProvider
               autoDismiss
               placement="bottom-center"
               autoDismissTimeout={3000}
            >
               {element}
            </ToastProvider>
         </ConfigProvider>
      </ApolloProvider>
   )
}
