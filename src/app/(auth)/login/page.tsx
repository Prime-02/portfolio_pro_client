"use client"
import InputDemo from '@/app/components/inputs/InputDemo'
import LoaderDemo from '@/app/components/loaders/Loader'
import ThemeToggle from '@/app/components/theme/ThemeToggle'
import { ToastDemo } from '@/app/components/toastify/ToastDemo'
import React, { useState } from 'react'

const page = () => {
    const [value, setValue] = useState("")
  return (
    <div>
        <ToastDemo/>
        <InputDemo/>
        <ThemeToggle/>
        <LoaderDemo/>
    </div>
  )
}

export default page