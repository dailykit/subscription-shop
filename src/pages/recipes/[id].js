import React from 'react'
import tw, { styled } from 'twin.macro'
import { useRouter } from 'next/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../utils'
import { RECIPE_DETAILS } from '../../graphql'
import { Loader, Layout, SEO } from '../../components'
import LockIcon from '../../assets/icons/Lock'
import ChefIcon from '../../assets/icons/Chef'
import TimeIcon from '../../assets/icons/Time'
import UtensilsIcon from '../../assets/icons/Utensils'
import CuisineIcon from '../../assets/icons/Cuisine'
import { useConfig } from '../../lib'

const Recipe = () => {
   const router = useRouter()
   const { addToast } = useToasts()
   const [productOption, setProductOption] = React.useState(null)
   const [recipe, setRecipe] = React.useState(null)
   const { configOf } = useConfig()

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
      const { id } = router.query
      getRecipe({
         variables: {
            optionId: id,
         },
      })
   }, [router.query, getRecipe])

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
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {recipe.name}
            </h1>
            <RecipeImage>
               {recipe?.assets?.images?.length ? (
                  <img
                     src={recipe?.assets?.images[0]}
                     alt={recipe.name}
                     tw="w-full h-full border-gray-100 object-cover rounded-lg"
                  />
               ) : (
                  'N/A'
               )}
            </RecipeImage>
            {!!recipe.description && (
               <>
                  <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-2">
                     Description
                  </h2>
                  <p tw="text-teal-900">{recipe.description}</p>
               </>
            )}
            <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-6">
               Details
            </h2>
            <div tw="grid grid-cols-4 gap-2 mb-2">
               {/* {!!recipe.type && (
                  <div>
                     <h6 tw="text-gray-500 text-sm font-normal">Type</h6>
                     <p tw="text-teal-900">{recipe.type}</p>
                  </div>
               )} */}
               {!!recipe.cuisine && (
                  <div tw="flex flex-col items-center">
                     <CuisineIcon size={40} color={theme?.accent} />
                     <p tw="text-teal-900">{recipe.cuisine}</p>
                  </div>
               )}
               {!!recipe.author && (
                  <div tw="flex flex-col items-center">
                     <ChefIcon size={40} color={theme?.accent} />
                     <p tw="text-teal-900">{recipe.author}</p>
                  </div>
               )}
               {!!recipe.cookingTime && (
                  <div tw="flex flex-col items-center">
                     <TimeIcon size={40} color={theme?.accent} />
                     <p tw="text-teal-900">{recipe.cookingTime} mins.</p>
                  </div>
               )}
               {!!recipe.utensils?.length && (
                  <div tw="flex flex-col items-center">
                     <UtensilsIcon size={40} color={theme?.accent} />
                     <p tw="text-teal-900">{recipe.utensils.join(', ')}</p>
                  </div>
               )}
            </div>
            {!!recipe.notIncluded?.length && (
               <div tw="mb-2">
                  <h6 tw="text-gray-500 text-sm font-normal">
                     What you'll need
                  </h6>
                  <p tw="text-teal-900">{recipe.notIncluded.join(', ')}</p>
               </div>
            )}
            {recipe.showIngredients &&
               Boolean(productOption.simpleRecipeYield.sachets.length) && (
                  <>
                     <h2 tw="pb-2 mt-4 border-b border-gray-300 text-gray-600 text-lg font-normal mb-4">
                        Ingredients
                     </h2>
                     <div tw="grid grid-cols-2 gap-2">
                        {productOption.simpleRecipeYield.sachets.map(
                           ({ isVisible, slipName, sachet }, index) => (
                              <div
                                 key={index}
                                 css={[
                                    tw`border h-16 px-2 rounded-sm flex items-center`,
                                    !isVisible && tw`justify-center`,
                                 ]}
                              >
                                 {isVisible ? (
                                    <>
                                       {sachet.ingredient.assets?.images
                                          ?.length && (
                                          <img
                                             src={
                                                sachet.ingredient.assets
                                                   .images[0]
                                             }
                                             tw="w-12 h-12 mr-2 rounded-sm"
                                          />
                                       )}
                                       {renderIngredientName(slipName, sachet)}
                                    </>
                                 ) : (
                                    <LockIcon />
                                 )}
                              </div>
                           )
                        )}
                     </div>
                  </>
               )}
            {recipe.showProcedures && Boolean(recipe.instructionSets.length) && (
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
                              {set.instructionSteps.map(step =>
                                 step.isVisible ? (
                                    <li
                                       key={step.title}
                                       tw="h-auto mb-4 ml-4 mt-2"
                                    >
                                       {step.title && (
                                          <span tw="text-gray-800">
                                             {step.title}
                                          </span>
                                       )}
                                       <StepImage>
                                          {step.assets.images.length > 0 && (
                                             <img
                                                src={step.assets.images[0].url}
                                                alt={
                                                   step.assets.images[0].title
                                                }
                                                title={
                                                   step.assets.images[0].title
                                                }
                                             />
                                          )}
                                       </StepImage>
                                       <p tw="mt-1 text-gray-600">
                                          {step.description}
                                       </p>
                                    </li>
                                 ) : (
                                    <li
                                       key={step.title}
                                       tw="h-auto mb-4 ml-4 mt-2"
                                    >
                                       <LockIcon />
                                    </li>
                                 )
                              )}
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
