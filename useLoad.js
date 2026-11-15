// Carrega dados sempre que a tela ganha foco, com estados de carregando, erro e "puxar para atualizar".
import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export function useLoad(loader, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const result = await loaderRef.current()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e?.message || 'Erro ao carregar.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useFocusEffect(
    useCallback(() => {
      run(false)
    }, [run])
  )

  return { data, setData, error, loading, refreshing, reload: () => run(false), refresh: () => run(true) }
}
