import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { Erro } from '../../components/Interface'
import Icone from '../../components/Icone'

export default function Administracao() {
  const { usuario, alterar } = useLoja()
  const navegar = useNavigate()
  const [erro, setErro] = useState('')

  function sair() {
    try {
      alterar((banco) => {
        banco.sessao = null
      })
      navegar('/', { replace: true })
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <div className="container pagina admin-pagina">
      <div className="admin-identidade">
        <span className="rotulo">Camisa10 · Administração</span>
        <Link className="link-seta" to="/produtos">
          Ver loja <Icone nome="diagonal" tamanho={16} />
        </Link>
      </div>
      <nav className="admin-menu" aria-label="Administração">
        <NavLink to="/admin" end>
          Painel
        </NavLink>
        <NavLink to="/admin/produtos">Produtos</NavLink>
        <NavLink to="/admin/categorias">Categorias</NavLink>
        <NavLink to="/admin/pedidos">Pedidos</NavLink>
        <button onClick={sair}>
          <Icone nome="sair" tamanho={16} /> Sair
        </button>
      </nav>
      <Erro>{erro}</Erro>
      <Outlet />
      <p className="admin-assinatura">Conectado como {usuario.nome}.</p>
    </div>
  )
}
