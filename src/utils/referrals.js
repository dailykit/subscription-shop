import axios from 'axios'

export const fetchReferrer = async (brandId, code) => {
   const res = await axios.post(
      window._env_.GATSBY_DATA_HUB_HTTPS,
      {
         query: `
            query CustomerReferralAggregate($brandId: Int!, $code: String!) {
               customerReferralsAggregate(where: { brandId : { _eq : $brandId }, referralCode : { _eq : $code } }) {
                  aggregate {
                     count
                  }
               }
            }
         `,
         variables: { brandId, code },
      },
      {
         headers: {
            'x-hasura-admin-secret': window._env_.GATSBY_ADMIN_SECRET,
            'Content-Type': 'application/json',
         },
      }
   )
   return res
}

export const getStoredReferralCode = defaultValue => {
   return localStorage.getItem('code') ?? defaultValue
}

export const setStoredReferralCode = value => {
   return localStorage.setItem('code', value)
}

export const deleteStoredReferralCode = () => {
   return localStorage.removeItem('code')
}

export const isReferralCodeValid = async (brandId, enteredCode) => {
   if (!enteredCode) {
      return true
   } else {
      const response = await fetchReferrer(brandId, enteredCode)
      if (response.data?.data) {
         const { customerReferralsAggregate: cra } = response.data.data
         console.log(cra.aggregate.count)
         if (cra.aggregate.count) {
            return true
         } else {
            return false
         }
      } else {
         return false
      }
   }
}