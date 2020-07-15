import React from 'react'
import { styled } from 'twin.macro'

const InlineLoader = () => (
   <StyledLoader>
      <div />
      <div />
      <div />
      <div />
   </StyledLoader>
)

export const Loader = ({ inline }) => {
   if (inline) return <InlineLoader />
   return (
      <StyledWrapper>
         <InlineLoader />
      </StyledWrapper>
   )
}

const StyledWrapper = styled.div`
   position: absolute;
   left: 0;
   right: 0;
   top: 0;
   bottom: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   background: rgba(255, 255, 255, 0.3);
`

const StyledLoader = styled.div`
   width: 80px;
   height: 13px;
   margin: 16px auto;
   position: relative;
   > div {
      width: 13px;
      height: 13px;
      position: absolute;
      border-radius: 50%;
      background: #58b970;
      animation-timing-function: cubic-bezier(0, 1, 1, 0);
   }
   div:nth-of-type(1) {
      left: 8px;
      animation: lds-ellipsis1 0.6s infinite;
   }
   div:nth-of-type(2) {
      left: 8px;
      animation: lds-ellipsis2 0.6s infinite;
   }
   div:nth-of-type(3) {
      left: 32px;
      animation: lds-ellipsis2 0.6s infinite;
   }
   div:nth-of-type(4) {
      left: 56px;
      animation: lds-ellipsis3 0.6s infinite;
   }
   @keyframes lds-ellipsis1 {
      0% {
         transform: scale(0);
      }
      100% {
         transform: scale(1);
      }
   }
   @keyframes lds-ellipsis3 {
      0% {
         transform: scale(1);
      }
      100% {
         transform: scale(0);
      }
   }
   @keyframes lds-ellipsis2 {
      0% {
         transform: translate(0, 0);
      }
      100% {
         transform: translate(24px, 0);
      }
   }
`
