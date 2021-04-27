import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import tw, { css, styled } from 'twin.macro'
import { Tunnel } from '../../../../components'
import CardList from '../../../../components/card_list'
import { useUser } from '../../../../context'
import { MUTATIONS, UPDATE_CART } from '../../../../graphql'
import { useMenu } from '../../state'

const PaymentCard = () => {
   const { state, dispatch } = useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()

   const [isCardListOpen, setIsCardListOpen] = React.useState(false)

   const [updateOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPDATE,
      { onError: error => console.log(error) }
   )
   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: ({ updateCart: { id = '' } = {} }) => {
         const isSkipped = state.occurenceCustomer?.isSkipped
         updateOccurenceCustomer({
            variables: {
               pk_columns: {
                  keycloakId: user.keycloakId,
                  brand_customerId: user.brandCustomerId,
                  subscriptionOccurenceId: state.week.id,
               },
               _set: { isSkipped: false, cartId: id },
            },
         }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
            if (isSkipped !== updateOccurenceCustomer?.isSkipped) {
               addToast('This week has been unskipped', { appearance: 'info' })
            }
         })

         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
         console.log(error)
      },
   })

   const renderCard = paymentMethodId => {
      const card = user.platform_customer.paymentMethods.find(
         pm => pm.stripePaymentMethodId === paymentMethodId
      )

      return (
         <main>
            <p tw="text-gray-500">{card.cardHolderName}</p>
            <p>XXXX XXXX XXXX {card.last4}</p>
            <p>
               {card.expMonth}/{card.expYear}
            </p>
            <p tw="text-sm text-gray-500 uppercase">{card?.brand}</p>
         </main>
      )
   }

   if (!state.occurenceCustomer?.cart?.paymentMethodId) return null
   return (
      <div>
         <section tw="mt-3">
            <h4 tw="text-lg text-gray-700 border-b mb-2">Payment Card</h4>

            <section tw="space-y-2">
               <Option isActive>
                  {renderCard(state.occurenceCustomer.cart.paymentMethodId)}
                  <span
                     tw="text-green-700 absolute top-1 right-1 text-sm cursor-pointer"
                     onClick={e => {
                        e.stopPropagation()
                        setIsCardListOpen(true)
                     }}
                  >
                     Change
                  </span>
               </Option>
            </section>
         </section>
         <Tunnel
            isOpen={isCardListOpen}
            toggleTunnel={setIsCardListOpen}
            style={{ zIndex: 1030 }}
         >
            <CardList
               closeTunnel={() => setIsCardListOpen(false)}
               onSelect={card =>
                  updateCart({
                     variables: {
                        id: state.occurenceCustomer?.cart?.id,
                        _set: { paymentMethodId: card.stripePaymentMethodId },
                     },
                  }).then(() => {
                     addToast('Payment card updated!', {
                        appearance: 'success',
                     })
                     setIsCardListOpen(false)
                  })
               }
            />
         </Tunnel>
      </div>
   )
}

export default PaymentCard

const Option = styled.section`
   ${tw`p-2 rounded border text-gray-700 relative`}

   ${({ isActive }) =>
      isActive &&
      css`
         ${tw`border-2 border-green-600`}
      `}
`
