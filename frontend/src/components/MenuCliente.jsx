import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import Icone from './Icone'
import { Erro } from './Interface'

export default function MenuCliente() {
  const { alterar } = useLoja()
  const [erro, setErro] = useState('')
  const navegar = useNavigate()
  function sair() {
    try {
      alterar((bancoAtual) => {
        bancoAtual.sessao = null
        bancoAtual.carrinho = []
      })
      navegar('/', { replace: true })
    } catch (falha) {
      setErro(falha.message)
    }
  }
  return (
    <>
      <nav className="menu-cliente" aria-label="Área do cliente">
        <NavLink to="/pedidos">
          <Icone nome="caixa" tamanho={17} />
          Meus pedidos
        </NavLink>
        <NavLink to="/perfil">
          <Icone nome="pessoa" tamanho={17} />
          Meu perfil
        </NavLink>
        <button onClick={sair}>
          <Icone nome="sair" tamanho={16} />
          Sair
        </button>
      </nav>
      <Erro>{erro}</Erro>
    </>
  )
}
