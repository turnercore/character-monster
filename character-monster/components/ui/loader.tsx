'use client'
import React from 'react'
import PacmanLoader from 'react-spinners/PacmanLoader'

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
      <PacmanLoader color="#000000" />
      <p className="text-2xl font-bold">Loading...</p>
    </div>
  )
}
