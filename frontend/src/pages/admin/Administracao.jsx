import { NavLink, Route, Routes } from 'react-router-dom'
import { Caminho } from '../../components/Interface'
import Icone from '../../components/Icone'
import AdminProdutos from './AdminProdutos'
import AdminCategorias from './AdminCategorias'
import AdminPedidos from './AdminPedidos'

function NavAdmin() {
  return (
    <nav className="admin-nav" aria-label="Áreas do painel">
      <NavLink to="produtos">
        <Icone nome="sacola" tamanho={18} />
        Produtos
      </NavLink>
      <NavLink to="categorias">
        <Icone nome="painel" tamanho={18} />
        Categorias
      </NavLink>
      <NavLink to="pedidos">
        <Icone nome="caixa" tamanho={18} />
        Pedidos
      </NavLink>
    </nav>
  )
}

function Painel() {
  return (
    <div className="container pagina">
      <Caminho atual="Administração" />
      <h1>Administração</h1>
      <NavAdmin />
      <div className="admin-cards">
        <NavLink className="admin-card" to="produtos">
          <Icone nome="sacola" tamanho={28} />
          <strong>Produtos</strong>
          <span>Criar, editar e excluir itens do catálogo</span>
        </NavLink>
        <NavLink className="admin-card" to="categorias">
          <Icone nome="painel" tamanho={28} />
          <strong>Categorias</strong>
          <span>Gerenciar ligas e coleções</span>
        </NavLink>
        <NavLink className="admin-card" to="pedidos">
          <Icone nome="caixa" tamanho={28} />
          <strong>Pedidos</strong>
          <span>Consultar e alterar o status de todos os pedidos</span>
        </NavLink>
      </div>
    </div>
  )
}

export default function Administracao() {
  return (
    <Routes>
      <Route index element={<Painel />} />
      <Route path="produtos" element={<AdminProdutos />} />
      <Route path="categorias" element={<AdminCategorias />} />
      <Route path="pedidos" element={<AdminPedidos />} />
    </Routes>
  )
}
