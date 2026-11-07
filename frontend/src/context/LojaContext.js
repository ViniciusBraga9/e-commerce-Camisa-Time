import { createContext, useContext } from 'react'

export const LojaContext = createContext(null)
export const useLoja = () => useContext(LojaContext)
