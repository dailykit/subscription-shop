import React from 'react'
export const ChevronRight = ({ size = 56, color = '#000000' }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="arcs"
   >
      <path d="M9 18l6-6-6-6" />
   </svg>
)
