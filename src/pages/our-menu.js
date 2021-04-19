/* eslint-disable jsx-a11y/no-onchange */

import React from 'react'
import moment from 'moment'
import { Link } from 'gatsby'
import { rrulestr } from 'rrule'
import tw, { styled } from 'twin.macro'
import ReactImageFallback from 'react-image-fallback'
import { isEmpty, uniqBy } from 'lodash'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { useConfig } from '../lib'
import { formatDate, isClient } from '../utils'
import { ArrowLeftIcon, ArrowRightIcon } from '../assets/icons'
import { Layout, SEO, Form, HelperBar, Loader, Spacer } from '../components'
import {
   OUR_MENU,
   GET_FILEID,
   OCCURENCE_PRODUCTS_BY_CATEGORIES,
} from '../graphql'
import VegIcon from '../assets/imgs/veg.png'
import NonVegIcon from '../assets/imgs/non-veg.png'

const OurMenu = () => {
   return (
      <Layout>
         <SEO title="Our Menu" />
         <Content />
      </Layout>
   )
}

export default OurMenu

const Content = () => {
   const [current, setCurrent] = React.useState(0)
   const [occurences, setOccurences] = React.useState([])
   const [categories, setCategories] = React.useState([])
   const {
      brand,
      configOf,
      buildImageUrl,
      noProductImage,
      imagePlaceholder,
   } = useConfig('conventions')

   const [fetchProducts, { loading: loadingProducts }] = useLazyQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         onCompleted: ({ categories = [] }) => {
            if (categories.length > 0) {
               setCategories(categories)
            }
         },
      }
   )

   const [
      fetchSubscription,
      { loading: loadingSubscription, data: { subscription = {} } = {} },
   ] = useLazyQuery(OUR_MENU.SUBSCRIPTION, {
      onCompleted: ({ subscription = {} }) => {
         if (subscription.occurences.length > 0) {
            const validOccurences = subscription.occurences.filter(
               node => node.isVisible
            )
            if (validOccurences?.length) {
               setOccurences(validOccurences)
               fetchProducts({
                  variables: {
                     occurenceId: { _eq: validOccurences[0].id },
                     subscriptionId: { _eq: subscription.id },
                  },
               })
            }
         }
      },
   })

   const [
      fetchItemCount,
      { loading: loadingItemCount, data: { itemCount = {} } = {} },
   ] = useLazyQuery(OUR_MENU.ITEM_COUNT, {
      onCompleted: ({ itemCount = {} }) => {
         if (itemCount.subscriptions.length > 0) {
            const [subscription] = itemCount.subscriptions
            fetchSubscription({ variables: { id: subscription.id } })
         }
      },
   })

   const [
      fetchServing,
      { loading: loadingServing, data: { serving = {} } = {} },
   ] = useLazyQuery(OUR_MENU.SERVING, {
      onCompleted: ({ serving = {} }) => {
         if (serving.counts.length > 0) {
            const [count] = serving.counts
            fetchItemCount({ variables: { id: count.id } })
         }
      },
   })

   const [
      fetchTitle,
      { loading: loadingTitle, data: { title = {} } = {} },
   ] = useLazyQuery(OUR_MENU.TITLE, {
      onCompleted: ({ title = {} }) => {
         if (title?.servings.length > 0) {
            const [serving] = title?.servings
            fetchServing({ variables: { id: serving.id } })
            setCurrent(0)
         }
      },
   })

   const [fetchTitles, { loading, data: { titles = [] } = {} }] = useLazyQuery(
      OUR_MENU.TITLES,
      {
         onCompleted: ({ titles = [] }) => {
            if (titles.length > 0) {
               const [title] = titles
               fetchTitle({ variables: { id: title.id } })
            }
         },
      }
   )

   React.useEffect(() => {
      fetchTitles({
         variables: { brandId: brand.id },
      })
      return () => {
         setOccurences([])
         setCurrent(0)
         setCategories([])
      }
   }, [fetchTitles, brand.id])

   const next = () => {
      const nextOne = (current + 1 + occurences.length) % occurences.length
      setCurrent(nextOne)
      fetchProducts({
         variables: {
            occurenceId: { _eq: occurences[nextOne].id },
            subscriptionId: { _eq: subscription.id },
         },
      })
   }

   const previous = () => {
      const previousOne = (current - 1 + occurences.length) % occurences.length
      setCurrent(previousOne)
      fetchProducts({
         variables: {
            occurenceId: { _eq: occurences[previousOne].id },
            subscriptionId: { _eq: subscription.id },
         },
      })
   }

   const { loading: contentLoading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['our-menu-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         if (fileData.length) {
            fileData.forEach(data => {
               if (data?.fileId) {
                  const fileId = [data?.fileId]
                  const cssPath = data?.subscriptionDivFileId?.linkedCssFiles.map(
                     file => {
                        return file?.cssFile?.path
                     }
                  )
                  const jsPath = data?.subscriptionDivFileId?.linkedJsFiles.map(
                     file => {
                        return file?.jsFile?.path
                     }
                  )
                  webRenderer({
                     type: 'file',
                     config: {
                        uri: isClient && window._env_.GATSBY_DATA_HUB_HTTPS,
                        adminSecret:
                           isClient && window._env_.GATSBY_ADMIN_SECRET,
                        expressUrl: isClient && window._env_.GATSBY_EXPRESS_URL,
                     },
                     fileDetails: [
                        {
                           elementId: 'our-menu-bottom-01',
                           fileId,
                           cssPath: cssPath,
                           jsPath: jsPath,
                        },
                     ],
                  })
               }
            })
         }
      },

      onError: error => {
         console.error(error)
      },
   })

   const config = configOf('primary-labels')
   const yieldLabel = {
      singular: config?.yieldLabel?.singular || 'serving',
      plural: config?.yieldLabel?.singular || 'servings',
   }
   const itemCountLabel = {
      singular: config?.itemLabel?.singular || 'recipe',
      plural: config?.itemLabel?.singular || 'recipes',
   }
   if (loading)
      return (
         <Main>
            <Loader inline />
         </Main>
      )
   if (isEmpty(titles))
      return (
         <Main>
            <Spacer size="sm" />
            <HelperBar type="info">
               <HelperBar.SubTitle>No Menu Available!</HelperBar.SubTitle>
            </HelperBar>
         </Main>
      )
   return (
      <Main>
         <Header>
            <div>
               {!loading && titles.length > 0 && (
                  <SelectSection>
                     <Form.Label htmlFor="plans">Plans</Form.Label>
                     <select
                        id="plans"
                        name="plans"
                        value={title.id}
                        onChange={e =>
                           fetchTitle({ variables: { id: e.target.value } })
                        }
                     >
                        {titles.map(({ id, title }) => (
                           <option key={id} value={id}>
                              {title}
                           </option>
                        ))}
                     </select>
                  </SelectSection>
               )}

               {[!loading, !loadingTitle].every(node => node) &&
                  title?.servings?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="serving">
                           {yieldLabel.plural}
                        </Form.Label>
                        <select
                           id="servings"
                           name="servings"
                           value={serving.id}
                           onChange={e =>
                              fetchServing({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {title?.servings.map(({ id, size }) => (
                              <option key={id} value={id}>
                                 {size}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}

               {[!loading, !loadingTitle, !loadingServing].every(
                  node => node
               ) &&
                  serving?.counts?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="counts">
                           {itemCountLabel.plural}
                        </Form.Label>
                        <select
                           id="counts"
                           name="counts"
                           value={itemCount.id}
                           onChange={e =>
                              fetchItemCount({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {serving?.counts.map(({ id, count }) => (
                              <option key={id} value={id}>
                                 {count}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}
               {[
                  !loading,
                  !loadingTitle,
                  !loadingServing,
                  !loadingItemCount,
               ].every(node => node) &&
                  itemCount?.subscriptions?.length > 0 && (
                     <SelectSection>
                        <Form.Label htmlFor="subscriptions">
                           Delivery Day
                        </Form.Label>
                        <select
                           id="subscriptions"
                           name="subscriptions"
                           value={subscription.id}
                           onChange={e =>
                              fetchSubscription({
                                 variables: { id: e.target.value },
                              })
                           }
                        >
                           {itemCount?.subscriptions.map(({ id, rrule }) => (
                              <option key={id} value={id}>
                                 {rrulestr(rrule).toText()}
                              </option>
                           ))}
                        </select>
                     </SelectSection>
                  )}
            </div>
         </Header>
         {!loadingSubscription && occurences.length > 0 && (
            <Occurence>
               <SliderButton onClick={previous}>
                  <ArrowLeftIcon tw="stroke-current text-green-800" />
               </SliderButton>
               <span tw="flex items-center justify-center text-base text-center md:text-lg text-indigo-800">
                  Showing menu of:&nbsp;
                  {formatDate(
                     moment(occurences[current].fulfillmentDate)
                        .subtract(7, 'days')
                        .format('YYYY-MM-DD'),
                     {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                     }
                  )}
                  &nbsp;-&nbsp;
                  {formatDate(occurences[current].fulfillmentDate, {
                     month: 'short',
                     day: 'numeric',
                     year: 'numeric',
                  })}
               </span>

               <SliderButton onClick={next}>
                  <ArrowRightIcon tw="stroke-current text-green-800" />
               </SliderButton>
            </Occurence>
         )}
         {!loadingProducts ? (
            <main tw="mt-3">
               {categories.length > 0 ? (
                  categories.map(category => (
                     <section key={category.name} css={tw`mb-8`}>
                        <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                           {category.name} (
                           {
                              uniqBy(category.productsAggregate.nodes, v =>
                                 [
                                    v?.cartItem?.productId,
                                    v?.cartItem?.option?.productOptionId,
                                 ].join()
                              ).length
                           }
                           )
                        </h4>
                        <Products>
                           {uniqBy(category.productsAggregate.nodes, v =>
                              [
                                 v?.cartItem?.productId,
                                 v?.cartItem?.option?.productOptionId,
                              ].join()
                           ).map((node, index) => (
                              <Product
                                 node={node}
                                 key={node.id}
                                 buildImageUrl={buildImageUrl}
                                 noProductImage={noProductImage}
                                 imagePlaceholder={imagePlaceholder}
                              />
                           ))}
                        </Products>
                     </section>
                  ))
               ) : (
                  <HelperBar type="info">
                     <HelperBar.SubTitle>
                        No products available this week!
                     </HelperBar.SubTitle>
                  </HelperBar>
               )}
            </main>
         ) : (
            <Loader inline />
         )}
         {contentLoading ? (
            <Loader inline />
         ) : (
            <div id="our-menu-bottom-01"></div>
         )}
      </Main>
   )
}

const Product = ({ node, noProductImage, buildImageUrl, imagePlaceholder }) => {
   const product = {
      name: node?.productOption?.product?.name || '',
      label: node?.productOption?.label || '',
      type: node?.productOption?.simpleRecipeYield?.simpleRecipe?.type,
      image:
         node?.productOption?.product?.assets?.images?.length > 0
            ? node?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: node?.productOption?.product?.additionalText || '',
   }
   return (
      <Styles.Product>
         {!!product.type && (
            <Styles.Type>
               {product.type === 'Non-vegetarian' ? (
                  <img
                     alt="Non-Veg Icon"
                     src={NonVegIcon}
                     title={product.type}
                     tw="h-6 w-6"
                  />
               ) : (
                  <img
                     alt="Veg Icon"
                     src={VegIcon}
                     title={product.type}
                     tw="h-6 w-6"
                  />
               )}
            </Styles.Type>
         )}
         <div tw="flex items-center justify-center aspect-w-4 aspect-h-3 bg-gray-200 mb-2 rounded overflow-hidden">
            {product.image ? (
               <ReactImageFallback
                  src={buildImageUrl('400x300', product.image)}
                  fallbackImage={product.image}
                  initialImage={imagePlaceholder}
                  alt={product.name}
               />
            ) : (
               <img src={noProductImage} alt={product.name} />
            )}
         </div>
         {node?.addOnLabel && <Label>{node?.addOnLabel}</Label>}
         <div tw="flex items-center justify-between">
            <section>
               <Link tw="text-gray-700" to={'#'}>
                  {product.name} - {product.label}
               </Link>
               <p>{product?.additionalText}</p>
            </section>
         </div>
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li`
      ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
      &.active {
         ${tw`border border-2 border-red-400`}
      }
   `,
   Type: styled.span`
      position: absolute;
      top: 8px;
      right: 8px;
   `,
}

const Main = styled.main`
   max-width: 1180px;
   margin: 0 auto;
   width: calc(100% - 40px);
   min-height: calc(100vh - 128px);
`

const SelectSection = styled.section`
   ${tw`flex flex-col px-3`}
`

const Header = styled.header`
   ${tw`w-full border-b flex justify-center`}
   div {
      ${tw`flex items-center space-x-3 divide-x py-3`}
   }
`

const Occurence = styled.div`
   width: 100%;
   height: 64px;
   display: grid;
   margin: auto;
   grid-template-columns: 64px 1fr 64px;
   @media (max-width: 567px) {
      grid-template-columns: 48px 1fr 48px;
   }
`

const SliderButton = styled.button`
   width: 48px;
   height: 48px;
   ${tw`
      mx-2
      self-center
      rounded-full
      hover:bg-gray-100
      border border-green-800 
      flex items-center justify-center 
   `}
   @media (max-width: 567px) {
      width: 32px;
      height: 32px;
   }
`

const Products = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Label = styled.span`
   top: 16px;
   ${tw`
      px-2
      absolute 
      rounded-r
      bg-green-500 
      text-sm uppercase font-medium tracking-wider text-white 
   `}
`
