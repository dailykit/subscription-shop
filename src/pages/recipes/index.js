import React from 'react'
import tw, { styled } from 'twin.macro'
import { useLocation } from '@reach/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../utils'
import { RECIPE_DETAILS } from '../../graphql'
import { Loader, Layout, SEO } from '../../components'

const Recipe = () => {
   const location = useLocation()
   const { addToast } = useToasts()
   const [recipe, setRecipe] = React.useState(null)

   const [getRecipe, { loading }] = useLazyQuery(RECIPE_DETAILS, {
      onCompleted: ({ product }) => {
         setRecipe(product?.recipe)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   console.log(recipe)
   React.useEffect(() => {
      let params = new URL(location.href).searchParams
      let recipeId = Number(params.get('id'))
      let yieldId = Number(params.get('serving'))
      getRecipe({
         variables: {
            id: recipeId,
            yieldId,
         },
      })
   }, [location.href, getRecipe])

   if (loading)
      return (
         <Layout>
            <SEO title="Loading" />
            <Loader inline />
         </Layout>
      )
   if (!recipe)
      return (
         <Layout>
            <SEO title="Not found" />
            <h1 tw="py-4 text-2xl text-gray-600 text-center">
               No such recipe exists!
            </h1>
         </Layout>
      )
   return (
      <Layout>
         <SEO title={recipe.name} richresult={recipe.richResult} />
         <RecipeContainer>
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {recipe.name}
            </h1>
            <RecipeImage>
               {recipe?.image ? (
                  <img
                     src={recipe.image}
                     alt={recipe.name}
                     tw="w-full h-full border-gray-100 object-cover rounded-lg"
                  />
               ) : (
                  'N/A'
               )}
            </RecipeImage>
            <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal">
               Ingredients
            </h2>
            <span tw="text-sm text-gray-500 mb-3 block">
               *Some items may be hidden.
            </span>
            <ol tw="list-decimal ml-6">
               {recipe.yields.length > 0 &&
                  recipe.yields[0].sachets.map(
                     ({ isVisible, slipName, ingredient }) => (
                        <li key={ingredient.id} tw="h-8 text-teal-900">
                           {isVisible ? slipName : 'Hidden by recipe author'}
                        </li>
                     )
                  )}
            </ol>
            <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-500 mb-3 text-lg font-medium">
               Cooking Process
            </h2>
            <ul>
               {recipe.procedures.map(procedure => (
                  <li tw="h-auto mb-4" key={procedure.name}>
                     <ol tw="list-decimal">
                        <span tw="text-lg font-medium text-gray-700">
                           {procedure.title}
                        </span>
                        {procedure.steps.map(step =>
                           step.isVisible ? (
                              <li key={step.title} tw="h-auto mb-4 ml-4 mt-2">
                                 {step.title && (
                                    <span tw="text-gray-800">{step.title}</span>
                                 )}
                                 <StepImage>
                                    {step.assets.images.length > 0 && (
                                       <img
                                          src={step.assets.images[0].url}
                                          alt={step.assets.images[0].title}
                                          title={step.assets.images[0].title}
                                       />
                                    )}
                                 </StepImage>
                                 <p tw="mt-1 text-gray-600">
                                    {step.description}
                                 </p>
                              </li>
                           ) : (
                              <li key={step.title} tw="h-auto mb-4 ml-4 mt-2">
                                 <span tw="text-gray-800">
                                    Hidden by recipe author
                                 </span>
                              </li>
                           )
                        )}
                     </ol>
                  </li>
               ))}
            </ul>
         </RecipeContainer>
         <Button onClick={() => isClient && window.history.go(-1)}>
            Go back to menu
         </Button>
      </Layout>
   )
}

export default Recipe

const RecipeContainer = styled.div`
   margin: auto;
   max-width: 640px;
   padding: 16px 0;
   width: calc(100vw - 40px);
`

const RecipeImage = styled.div`
   height: 320px;
   @media (max-width: 567px) {
      height: 240px;
   }
`

const StepImage = styled.div`
   max-width: 340px;
   ${tw`my-2`}
   img {
      width: 100%;
      height: 220px;
      ${tw`object-cover rounded`}
      @media (max-width: 567px) {
         height: 160px;
      }
   }
`

const Button = styled.button`
   left: 50%;
   bottom: 16px;
   ${tw`fixed bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
`
