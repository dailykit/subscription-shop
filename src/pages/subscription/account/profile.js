import React from 'react'
import { navigate } from 'gatsby'
import tw, { styled, css } from 'twin.macro'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { SEO, Layout, ProfileSidebar, Form, Button } from '../../../components'
import { formatCurrency } from '../../../utils'
import { useToasts } from 'react-toast-notifications'

const Profile = () => {
   const { isAuthenticated } = useUser()

   React.useEffect(() => {
      if (!isAuthenticated) {
         navigate('/subscription')
      }
   }, [isAuthenticated])

   return (
      <Layout>
         <SEO title="Profile" />
         <Main>
            <ProfileSidebar />
            <ProfileForm />
         </Main>
      </Layout>
   )
}

export default Profile

const ProfileForm = () => {
   const { addToast } = useToasts()
   const { user } = useUser()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const loyaltyPointsAllowed = configOf('Loyalty Points', 'rewards')
      ?.isAvailable
   const walletAllowed = configOf('Wallet', 'rewards')?.isAvailable
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable

   return (
      <section tw="px-6 w-full md:w-5/12">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>Profile</Title>
         </header>
         <Form.Field tw="mr-3">
            <Form.Label>Email</Form.Label>
            <Form.DisabledText>
               {user?.platform_customer?.email}
            </Form.DisabledText>
         </Form.Field>
         <div tw="flex flex-wrap md:flex-nowrap">
            <Form.Field tw="mr-3">
               <Form.Label>First Name</Form.Label>
               <Form.Text
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  defaultValue={user?.platform_customer?.firstName}
               />
            </Form.Field>
            <Form.Field>
               <Form.Label>Last Name</Form.Label>
               <Form.Text
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  defaultValue={user?.platform_customer?.lastName}
               />
            </Form.Field>
         </div>
         {referralsAllowed && !!user?.customerReferrals?.length && (
            <>
               <Form.Label>Referral Code</Form.Label>
               <Flex>
                  {user?.customerReferrals[0]?.referralCode}
                  <CopyToClipboard
                     text={`${window.location.origin}/subscription?invite-code=${user?.customerReferrals[0]?.referralCode}`}
                     onCopy={() =>
                        addToast('Invite like copied!', {
                           appearance: 'success',
                        })
                     }
                  >
                     <Button size="sm"> Copy invite link </Button>
                  </CopyToClipboard>
               </Flex>
            </>
         )}
         <div tw="h-2" />
         {walletAllowed && !!user?.wallets?.length && (
            <>
               <Form.Label>Wallet Amount</Form.Label>
               {formatCurrency(user?.wallets[0]?.amount)}
            </>
         )}
         <div tw="h-2" />
         {loyaltyPointsAllowed && !!user?.loyaltyPoints?.length && (
            <>
               <Form.Label>Loyalty Points</Form.Label>
               {user?.loyaltyPoints[0]?.points}
            </>
         )}
      </section>
   )
}

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   min-height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
   position: relative;
   @media (max-width: 768px) {
      display: block;
   }
`

const Flex = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
`
