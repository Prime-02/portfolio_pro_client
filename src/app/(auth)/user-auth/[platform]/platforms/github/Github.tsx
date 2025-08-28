import { useGlobalState } from '@/app/globalStateProvider'
import React from 'react'

const Github = () => {
    const {checkParams} = useGlobalState()
    const code = checkParams("code")
    const installation_id = checkParams("installation_id")
  return (
    <div>Github</div>
  )
}

export default Github