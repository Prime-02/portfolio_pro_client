"use client"
import React, { useEffect } from 'react'
import HomePage from './components/home/HomePage'
import { useRouting } from '@/lib/hooks/routing/useRouting'
import { isAuthenticated } from '@/lib/client/api'

const Home = () => {
  const { router } = useRouting()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/feed")
    }
  }, [])

  return (
    <HomePage />
  )
}

export default Home