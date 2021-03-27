import React from 'react'
import tw, { styled } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'
import { REFERRER } from '../graphql'
import { useConfig } from '../lib'
import { Form } from './form'
import { useUser } from '../context'
import { usePayment } from '../sections/checkout/state'

export const Referral = () => {
   const { state, dispatch } = usePayment()
   const { brand } = useConfig()
   const { user } = useUser()

   const code = localStorage.getItem('code')
   const [referrer, setReferrer] = React.useState('')

   const [fetchReferrer, { loading }] = useLazyQuery(REFERRER, {
      onCompleted: data => {
         if (data.customerReferrals.length) {
            const {
               firstName,
               lastName,
            } = data.customerReferrals[0].customer.platform_customer
            setReferrer(`${firstName} ${lastName}`)
         }
      },
   })

   React.useEffect(() => {
      if (code) {
         fetchReferrer({
            variables: {
               brandId: brand.id,
               code,
            },
         })
         dispatch({
            type: 'SET_CODE',
            payload: code,
         })
      }
   }, [code])

   if (user?.isSubscriber) return null
   return (
      <Styles.Wrapper>
         <Form.Label>Referral Code</Form.Label>
         {!loading && (
            <Styles.Form>
               <Form.Text
                  required
                  type="text"
                  name="code"
                  onChange={e =>
                     dispatch({
                        type: 'SET_CODE',
                        payload: e.target.value,
                     })
                  }
                  value={state.code}
                  disabled={code && referrer}
                  placeholder="Enter referral code"
               />
               {referrer && (
                  <Styles.HelpText>referred by: {referrer}</Styles.HelpText>
               )}
            </Styles.Form>
         )}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div``,
   Heading: styled.h3``,
   Form: styled.form``,
   HelpText: styled.small`
      display: block;
   `,
}
