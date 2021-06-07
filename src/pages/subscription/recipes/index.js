import React from 'react'
import tw, { styled } from 'twin.macro'
import { useLocation } from '@reach/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../../utils'
import { RECIPE_DETAILS } from '../../../graphql'
import { Loader, Layout, SEO } from '../../../components'
import LockIcon from '../../../assets/icons/Lock'
import ChefIcon from '../../../assets/icons/Chef'
import TimeIcon from '../../../assets/icons/Time'
import UtensilsIcon from '../../../assets/icons/Utensils'
import CuisineIcon from '../../../assets/icons/Cuisine'
import { useConfig } from '../../../lib'

const Recipe = () => {
   const location = useLocation()
   const { addToast } = useToasts()
   const [productOption, setProductOption] = React.useState(null)
   const [recipe, setRecipe] = React.useState(null)
   const { configOf, noProductImage } = useConfig('convention')

   const theme = configOf('theme-color', 'Visual')

   const [getRecipe, { loading }] = useLazyQuery(RECIPE_DETAILS, {
      onCompleted: ({ productOption }) => {
         if (productOption) {
            console.log(productOption)
            setProductOption(productOption)
            if (productOption.simpleRecipeYield?.simpleRecipe) {
               setRecipe(productOption.simpleRecipeYield.simpleRecipe)
            }
         }
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      let params = new URL(location.href).searchParams
      let productOptionId = Number(params.get('id'))
      getRecipe({
         variables: {
            optionId: productOptionId,
         },
      })
   }, [location.href, getRecipe])

   const renderIngredientName = (slipName, sachet) => {
      if (recipe.showIngredientsQuantity) {
         return `${slipName} - ${sachet.quantity} ${sachet.unit}`
      }
      return slipName
   }

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
            <RecipeImage>
               {recipe?.assets?.images?.length ? (
                  <img
                     src={recipe?.assets?.images[0]}
                     alt={recipe.name}
                     tw="w-full h-full border-gray-100 object-cover rounded-sm"
                  />
               ) : (
                  'N/A'
               )}
            </RecipeImage>
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {recipe.name}
            </h1>
            <div tw="grid grid-flow-col gap-2">
               <div tw="col-start-1 col-end-4">
                  {!!recipe.description && (
                     <div>
                        <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-2">
                           Description
                        </h2>
                        <p tw="text-teal-900">{recipe.description}</p>
                     </div>
                  )}
                  {recipe.showIngredients && (
                     <>
                        <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-4">
                           Ingredients
                        </h2>
                        <div tw="grid sm:grid-cols-3 grid-cols-2 gap-4">
                           {productOption.simpleRecipeYield.sachets.map(
                              ({ isVisible, slipName, sachet }, index) => (
                                 <div
                                    key={index}
                                    css={[
                                       tw`px-2 flex flex-col items-center w-48 mb-4`,
                                       !isVisible && tw`justify-center`,
                                    ]}
                                 >
                                    {isVisible ? (
                                       <>
                                          {sachet.ingredient.assets?.images
                                             ?.length ? (
                                             <img
                                                src={
                                                   sachet.ingredient.assets
                                                      .images[0]
                                                }
                                                tw="w-24 h-24 rounded-full"
                                             />
                                          ) : (
                                             <img
                                                src={noProductImage}
                                                tw="w-24 h-24 rounded-full"
                                             />
                                          )}
                                          {renderIngredientName(
                                             slipName,
                                             sachet
                                          )}
                                       </>
                                    ) : (
                                       <LockIcon size="32" />
                                    )}
                                 </div>
                              )
                           )}
                        </div>
                     </>
                  )}
               </div>
               <div tw="col-start-8">
                  <div>
                     <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-6">
                        Details
                     </h2>
                     {/* {!!recipe.type && (
                           <div>
                              <h6 tw="text-gray-500 text-sm font-normal">Type</h6>
                              <p tw="text-teal-900">{recipe.type}</p>
                           </div>
                        )} */}
                     <div tw="mb-2 grid grid-cols-2 gap-4">
                        {!!recipe.cuisine && (
                           <div tw="flex flex-col items-center">
                              <CuisineIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900">{recipe.cuisine}</p>
                           </div>
                        )}
                        {!!recipe.author && (
                           <div tw="flex flex-col items-center">
                              <ChefIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900">{recipe.author}</p>
                           </div>
                        )}
                        {!!recipe.cookingTime && (
                           <div tw="flex flex-col items-center">
                              <TimeIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900">
                                 {recipe.cookingTime} mins.
                              </p>
                           </div>
                        )}
                        {!!recipe.utensils?.length && (
                           <div tw="flex flex-col items-center">
                              <UtensilsIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900">
                                 {recipe.utensils.join(', ')}
                              </p>
                           </div>
                        )}
                     </div>
                  </div>
                  {!!recipe.notIncluded?.length && (
                     <div tw="mb-2">
                        <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-6">
                           What you'll need
                        </h2>
                        <p tw="text-teal-900">
                           {recipe.notIncluded.join(', ')}
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {recipe.showProcedures && (
               <>
                  <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-500 mb-3 text-lg font-medium">
                     Cooking Process
                  </h2>
                  <ul>
                     {recipe.instructionSets.map(set => (
                        <li tw="h-auto mb-4" key={set.id}>
                           <ol tw="list-decimal">
                              <span tw="text-lg font-medium text-gray-700">
                                 {set.title}
                              </span>
                              <div tw="flex flex-wrap justify-evenly items-stretch">
                                 {set.instructionSteps.map(step =>
                                    step.isVisible ? (
                                       <li
                                          key={step.title}
                                          tw=" mb-4 mx-2 mt-2 inline-block"
                                          css={[`width: 30%`]}
                                       >
                                          <StepImage>
                                             {step.assets.images.length > 0 ? (
                                                <img
                                                   src={
                                                      step.assets.images[0].url
                                                   }
                                                   alt={
                                                      step.assets.images[0]
                                                         .title
                                                   }
                                                   title={
                                                      step.assets.images[0]
                                                         .title
                                                   }
                                                   tw="w-24 h-24 "
                                                />
                                             ) : (
                                                <img
                                                   src={noProductImage}
                                                   tw="w-24 h-24 "
                                                />
                                             )}
                                          </StepImage>
                                          {step.title && (
                                             <span tw="text-gray-800 ">
                                                {step.title}
                                             </span>
                                          )}
                                          <p tw="mt-1 text-gray-600">
                                             {step.description}
                                          </p>
                                       </li>
                                    ) : (
                                       <li
                                          key={step.title}
                                          tw="h-auto mb-4 mx-2 mt-2 inline-block flex justify-center"
                                          css={[`width: 30%`]}
                                       >
                                          <LockIcon size="50" />
                                       </li>
                                    )
                                 )}
                              </div>
                           </ol>
                        </li>
                     ))}
                  </ul>
               </>
            )}
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
   max-width: 1090px;
   padding: 16px 0;
   width: calc(100vw - 40px);
`

const RecipeImage = styled.div`
   height: 450px;
   margin: 20px 0;
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
      ${tw`object-cover`}
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
