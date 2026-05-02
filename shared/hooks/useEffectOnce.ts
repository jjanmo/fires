import { useEffect } from 'react'

/**
 * 마운트 시 1회만 실행되는 useEffect.
 * eslint-disable-next-line react-hooks/exhaustive-deps 주석을 매 사용처마다 작성하지 않아도 됨.
 */
const useEffectOnce = (effect: () => void | (() => void)) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}

export { useEffectOnce }
