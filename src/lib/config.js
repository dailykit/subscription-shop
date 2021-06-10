import React from 'react'
import { groupBy, has, isEmpty } from 'lodash'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import { isClient } from '../utils'
import { PageLoader } from '../components'
import { ORGANIZATION, SETTINGS } from '../graphql/queries'

const ConfigContext = React.createContext()

const initialState = {
   organization: {},
   brand: {
      id: null,
   },
   settings: {},
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_ORGANIZATION':
         return { ...state, organization: payload }
      case 'SET_BRANDID':
         return { ...state, brand: payload }
      case 'SET_SETTINGS':
         return { ...state, settings: payload }
      default:
         return state
   }
}

export const ConfigProvider = ({ children }) => {
   const [isLoading, setIsLoading] = React.useState(true)
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const {
      loading: organizationLoading,
      data: { organizations = [] } = {},
   } = useQuery(ORGANIZATION)
   const { loading, data: { settings = [] } = {} } = useSubscription(SETTINGS, {
      variables: {
         domain: {
            _eq: isClient ? window.location.hostname : null,
         },
      },
   })

   const transform = React.useCallback(
      ({ value, meta }) => ({
         value,
         type: meta.type,
         identifier: meta.identifier,
      }),
      []
   )

   React.useEffect(() => {
      if (!loading && !organizationLoading) {
         if (!isEmpty(settings)) {
            dispatch({
               type: 'SET_BRANDID',
               payload: { id: settings[0].brandId },
            })
            dispatch({
               type: 'SET_SETTINGS',
               payload: groupBy(settings.map(transform), 'type'),
            })
         }
         if (!isEmpty(organizations)) {
            const [organization] = organizations
            dispatch({ type: 'SET_ORGANIZATION', payload: organization })
         }
         setIsLoading(false)
      }
   }, [loading, settings, transform])

   const buildImageUrl = React.useCallback((size, url) => {
      const server_url = `${
         new URL(window._env_.GATSBY_DATA_HUB_HTTPS).origin
      }/server/images`
      let bucket = ''
      if (new URL(url).host.split('.').length > 0) {
         bucket = new URL(url).host.split('.')[0]
      }
      const name = url.slice(url.lastIndexOf('/') + 1)

      return `${server_url}/http://${bucket}.s3-website.us-east-2.amazonaws.com\\${size}\\${name}`
   }, [])

   if (isLoading) return <PageLoader />
   return (
      <ConfigContext.Provider
         value={{
            state,
            dispatch,
            buildImageUrl,
            noProductImage:
               'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAH0CAYAAADfWf7fAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAACl/SURBVHgB7d1vbxRHvvfhXh+I8IF1+GNAjkBkURC8/9eRx0dCi0DOsrFAsDYOyFa8YW99J3dnnQTbM56Z7qrq65JGhj05Cdjj8Weqf131l++///4/HQAANGqjAwCAhgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACaJngBAGia4AUAoGmCFwCApgleAACadqWDhm1sbHS3b9/url+/3m1ubnZXr16d/e+//PJLd3Jy0h0dHXWfPn3q9vf3OwCgTYKXJl27dq375ptvZqH7Jf/zP/8ze+Sfu3XrVnfv3r3u4OCg+9e//jULYQCgHYKX5iR079y5s9D/z1dffTWL3ps3b3Z7e3vd4eFhBwC0wQwvzcj4wuPHjxeO3dMSvo8ePeru37/fAQBtsMJLMxK7mdNdhaz2xps3bzoAoG5WeGlCxhhWFbu9RK+VXgCon+ClernpbJkxhvOIXgCon+Clev34wTr//aIXAOoleKna1tbW7EazdRO9AFAvwUvVMs4wFNELAHUSvFTtrIMl1kX0AkB9BC/VyilpOS1taKIXAOoieKnWGLHbE70AUA/BS7XGDN4QvQBQB8ELSxC9AFA+wUu1fv75564EohcAyiZ4qdbJyUlXCtELAOW60kGlfvnl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',
         }}
      >
         {children}
      </ConfigContext.Provider>
   )
}

export const useConfig = (globalType = '') => {
   const {
      state,
      buildImageUrl,
      noProductImage,
      imagePlaceholder,
   } = React.useContext(ConfigContext)

   const hasConfig = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType || globalType
         if (isEmpty(state.settings)) return false
         if (identifier && type && has(state.settings, type)) {
            const index = state.settings[type].findIndex(
               node => node.identifier === identifier
            )
            if (index === -1) return false
            if (isEmpty(state.settings[type][index].value)) return false
            return true
         }
         return false
      },
      [state, globalType]
   )

   const configOf = React.useCallback(
      (identifier = '', localType = '') => {
         const type = localType || globalType
         if (isEmpty(state.settings)) return {}
         if (identifier && type && has(state.settings, type)) {
            return (
               state.settings[type].find(node => node.identifier === identifier)
                  ?.value || {}
            )
         }
         return {}
      },
      [state, globalType]
   )

   return {
      configOf,
      hasConfig,
      buildImageUrl,
      noProductImage,
      imagePlaceholder,
      brand: state.brand,
      organization: state.organization,
   }
}
