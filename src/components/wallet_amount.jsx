import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { useUser } from '../context'
import { MUTATIONS } from '../graphql'
import { formatCurrency } from '../utils'

export const WalletAmount = ({ cart }) => {
   const { user } = useUser()

   const [amount, setAmount] = React.useState(cart.walletAmountUsable)

   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => console.log('Wallet amount added!'),
      onError: error => console.log(error),
   })

   const handleSubmit = e => {
      e.preventDefault()
      if (amount <= cart.walletAmountUsable) {
         updateCart({
            variables: {
               id: cart?.id,
               _set: {
                  walletAmountUsed: amount,
               },
            },
         })
      }
   }

   if (!cart.walletAmountUsable) return null
   return (
      <Styles.Wrapper>
         {cart.walletAmountUsed ? (
            <Styles.Stat>
               <Styles.Text> Walled amount used: </Styles.Text>
               <Styles.Text>
                  <Styles.Cross
                     role="button"
                     tabIndex={0}
                     onClick={() =>
                        updateCart({
                           variables: {
                              id: cart.id,
                              _set: {
                                 walletAmountUsed: 0,
                              },
                           },
                        })
                     }
                  >
                     &times;{' '}
                  </Styles.Cross>
                  ${cart.walletAmountUsed}
               </Styles.Text>
            </Styles.Stat>
         ) : (
            <>
               <Styles.Form onSubmit={handleSubmit}>
                  <Styles.InputWrapper>
                     <Styles.Label> Wallet amount </Styles.Label>
                     <Styles.Input
                        type="number"
                        min="0"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                     />
                  </Styles.InputWrapper>
                  <Styles.Button type="submit"> Add </Styles.Button>
               </Styles.Form>
               <Styles.Help>
                  <Styles.Small>
                     Max usable: {formatCurrency(cart.walletAmountUsable)}
                  </Styles.Small>
                  {!!user.wallets?.length && (
                     <Styles.Small>
                        Balance: {formatCurrency(user.wallets[0].amount)}
                     </Styles.Small>
                  )}
               </Styles.Help>
            </>
         )}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      ${tw`m-1`}
      border: 1px solid #efefef;
      padding: 8px;
      border-radius: 2px;
   `,
   Form: styled.form`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   InputWrapper: styled.div``,
   Label: styled.label``,
   Input: styled.input`
      border: 1px solid #cacaca;
      padding: 4px;
      border-radius: 2px;
      display: block;
   `,
   Button: styled.button`
      background: #b8238f;
      color: #fff;
      border-radius: 2px;
      padding: 4px;
   `,
   Help: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Small: styled.small``,
   Stat: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Text: styled.span``,
   Cross: styled.span`
      color: #ff5a52;
      font-size: 18px;
      cursor: pointer;
   `,
}
