"use client"
import { redirect, useParams } from 'next/navigation'

const UserProfile = () => {
  const params = useParams()
  const username = params.username as string
  redirect(`/${username}`)
}

export default UserProfile