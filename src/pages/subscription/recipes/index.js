import React from 'react'
import Masonry from 'react-masonry-css'
import tw, { styled, css } from 'twin.macro'
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
   const [selectedImage, setSelectedImage] = React.useState(null)
   const { configOf, noProductImage } = useConfig('convention')
   const imageRatio = useConfig().configOf('image-aspect-ratio', 'Visual')
      ?.recipeImage
   const theme = configOf('theme-color', 'Visual')

   const [getRecipe, { loading }] = useLazyQuery(RECIPE_DETAILS, {
      onCompleted: ({ productOption }) => {
         if (productOption) {
            console.log(productOption)
            setProductOption(productOption)
            if (productOption.simpleRecipeYield?.simpleRecipe) {
               setRecipe(productOption.simpleRecipeYield.simpleRecipe)
               setSelectedImage(
                  productOption.simpleRecipeYield.simpleRecipe?.assets
                     ?.images[0]
               )
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
            <RecipeImages>
               {recipe?.assets?.images?.length > 1 && (
                  <div tw=" mx-2 my-4 flex md:block">
                     {recipe?.assets?.images.map(image => (
                        <img
                           src={image}
                           alt={recipe.name}
                           tw="w-24 h-20 my-2 mx-2 object-cover rounded-sm cursor-pointer"
                           onClick={() => setSelectedImage(image)}
                           css={[
                              `${
                                 selectedImage === image &&
                                 `border: 2px solid ${theme?.accent}`
                              }`,
                           ]}
                        />
                     ))}
                  </div>
               )}

               <RecipeImage imageRatio={imageRatio}>
                  {recipe?.assets?.images?.length ? (
                     <img
                        src={selectedImage}
                        alt={recipe.name}
                        tw="w-full h-full border-gray-100 object-cover rounded-sm"
                        css={css`
                           aspect-ratio: ${imageRatio && imageRatio.width
                              ? imageRatio.width / imageRatio.height
                              : 4 / 3};
                        `}
                     />
                  ) : (
                     'N/A'
                  )}
               </RecipeImage>
            </RecipeImages>
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {recipe.name}
            </h1>
            <div tw="md:grid grid-flow-col gap-2">
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
                     <div tw="mb-2 gap-4">
                        {!!recipe.cuisine && (
                           <div tw="grid grid-cols-2 m-auto my-2 ">
                              <CuisineIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900 flex items-center">
                                 {recipe.cuisine}
                              </p>
                           </div>
                        )}
                        {!!recipe.author && (
                           <div tw="grid grid-cols-2 m-auto my-2">
                              <ChefIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900 flex items-center">
                                 {recipe.author}
                              </p>
                           </div>
                        )}
                        {!!recipe.cookingTime && (
                           <div tw="grid grid-cols-2 m-auto my-2">
                              <TimeIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900 flex items-center">
                                 {recipe.cookingTime} mins.
                              </p>
                           </div>
                        )}
                        {!!recipe.utensils?.length && (
                           <div tw="grid grid-cols-2 m-auto my-2">
                              <UtensilsIcon size={50} color={theme?.accent} />
                              <p tw="text-teal-900 flex items-center">
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

                              <Masonry
                                 breakpointCols={2}
                                 css={[`display: flex`]}
                              >
                                 {set.instructionSteps.map(step =>
                                    step.isVisible ? (
                                       <Step key={step.title}>
                                          {step.title && (
                                             <span tw="text-gray-800 ">
                                                {step.title}
                                             </span>
                                          )}
                                          <p tw="mt-1 text-gray-600">
                                             {step.description}
                                          </p>
                                          <StepImage>
                                             {step.assets.images.length > 0 && (
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
                                             )}
                                          </StepImage>
                                       </Step>
                                    ) : (
                                       <li
                                          key={step.title}
                                          tw="h-auto mb-4 mx-2 mt-2 ml-8 inline-block 
                                             flex-col justify-center items-center
                                          "
                                          css={[`width: 90%`]}
                                       >
                                          <div
                                             tw="flex justify-center items-center border border-2"
                                             css={[`height: 200px`]}
                                          >
                                             <LockIcon size="100" />
                                          </div>
                                       </li>
                                    )
                                 )}
                              </Masonry>
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
const RecipeImages = styled.div`
   ${tw`flex justify-between md:flex-row flex-col-reverse`}
`

const RecipeImage = styled.div(
   ({ imageRatio }) => css`
      height: 450px;
      width: 100%;
      margin: 20px auto;
      ${imageRatio && imageRatio.width
         ? `aspect-ratio: ${imageRatio.width}/ ${imageRatio.height} }`
         : tw`aspect-w-4 aspect-h-3`}
      @media (max-width: 567px) {
         height: 240px;
      }
   `
)
const LockStep = styled.li`
   ${tw`h-auto mb-4 mx-2 mt-2 inline-block flex justify-center`},
   width: 30%
`

const Step = styled.li`
   ${tw` mb-4 mx-2 mt-2 inline-block pl-7`},
   width: 100%;
`

const StepImage = styled.div`
    {
      /* max-width: 340px; */
   }
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
