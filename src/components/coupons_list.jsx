import { useMutation, useSubscription } from '@apollo/react-hooks'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { COUPONS, MUTATIONS } from '../graphql'
import { useMenu } from '../sections/select-menu'
import { useUser } from '../context'
import { Loader } from './loader'
import { useConfig } from '../lib'

export const CouponsList = ({ closeTunnel }) => {
   const { state } = useMenu()
   const { brand } = useConfig()
   const { user } = useUser()
   const { id } = state?.occurenceCustomer?.cart

   const [availableCoupons, setAvailableCoupons] = React.useState([])
   const [applying, setApplying] = React.useState(false)

   const { loading, error } = useSubscription(COUPONS, {
      variables: {
         params: {
            cartId: id,
            keycloakId: user?.keycloakId,
         },
         brandId: brand.id,
      },
      onSubscriptionData: data => {
         console.log(data)
         const coupons = data.subscriptionData.data.coupons
         setAvailableCoupons([
            ...coupons.filter(
               coupon =>
                  coupon.visibilityCondition === null ||
                  coupon.visibilityCondition.isValid
            ),
         ])
      },
   })
   console.log('🚀 ~ CouponsList ~ error', error)

   // Mutation
   const [createOrderCartRewards] = useMutation(MUTATIONS.CART_REWARDS.CREATE, {
      onCompleted: () => {
         console.log('Applied coupon!')
         closeTunnel()
      },
      onError: error => {
         console.log(error)
      },
   })

   const handleApplyCoupon = coupon => {
      try {
         if (applying) return
         setApplying(true)
         const objects = []
         if (coupon.isRewardMulti) {
            for (const reward in coupon.rewards) {
               objects.push({ rewardId: reward.id, cartId: id })
            }
         } else {
            objects.push({
               rewardId: coupon.rewards[0].id,
               cartId: id,
            })
         }
         createOrderCartRewards({
            variables: {
               objects,
            },
         })
      } catch (err) {
         console.log(err)
      } finally {
         setApplying(false)
      }
   }

   if (loading) return <Loader />
   return (
      <Styles.Wrapper>
         <Styles.ListHeader>
            <Styles.Heading>Available Coupons</Styles.Heading>
         </Styles.ListHeader>
         {!availableCoupons.length && (
            <Styles.Title>No coupons available!</Styles.Title>
         )}
         {availableCoupons.map(coupon => (
            <Styles.Coupon key={coupon.id}>
               <Styles.CouponTop>
                  <Styles.Code>{coupon.code} </Styles.Code>
                  <Styles.Button
                     onClick={() => handleApplyCoupon(coupon)}
                     disabled={
                        !coupon.rewards.every(
                           reward => reward.condition?.isValid
                        )
                     }
                  >
                     Apply
                  </Styles.Button>
               </Styles.CouponTop>
               <Styles.CouponBottom>
                  <Styles.Title>{coupon.metaDetails.title}</Styles.Title>
                  <Styles.Description>
                     {coupon.metaDetails.description}
                  </Styles.Description>
               </Styles.CouponBottom>
            </Styles.Coupon>
         ))}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div`
      padding: 16px;
   `,
   ListHeader: styled.div`
      margin-bottom: 16px;
   `,
   Heading: styled.h3`
      color: gray;
   `,
   Coupon: styled.div`
      padding: 8px;
      border: 1px dashed #cacaca;
      margin-bottom: 16px;
      border-radius: 4px;
   `,
   CouponTop: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
   `,
   Code: styled.h3`
      text-transform: uppercase;
      font-weight: 500;
   `,
   Button: styled.button`
      color: teal;

      &:disabled {
         color: gray;
      }
   `,
   CouponBottom: styled.div``,
   Title: styled.p``,
   Description: styled.p``,
}
