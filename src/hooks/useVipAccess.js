import { useEffect, useState } from 'react'

const VIP_ACCESS_STORAGE_KEY = 'path-to-graduation:vip-access'

function loadVipAccess() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(VIP_ACCESS_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useVipAccess() {
  const [hasVipAccess, setHasVipAccess] = useState(loadVipAccess)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(VIP_ACCESS_STORAGE_KEY, String(hasVipAccess))
  }, [hasVipAccess])

  function grantVipAccess() {
    setHasVipAccess(true)
  }

  return {
    hasVipAccess,
    grantVipAccess,
  }
}