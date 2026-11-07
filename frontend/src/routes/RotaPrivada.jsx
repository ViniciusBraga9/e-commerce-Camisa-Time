import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'

export default function RotaPrivada({ perfil = 'cliente' }) {
  const { usuario, banco } = useLoja()
  const local = useLocation()
  if (local.pathname === '/checkout' && !banco.carrinho.length)
    return <Navigate to="/carrinho" replace />
  // Guardamos a página que o cliente tentou abrir para retomá-la após o login.
  if (!usuario)
    return (
      <Navigate
        to="/login"
        replace
        state={{
          voltar: local.pathname + local.search + local.hash,
          aviso: banco.sessao ? 'Sua sessão expirou. Entre novamente para continuar.' : '',
        }}
      />
    )
  if (usuario.perfil !== perfil)
    return (
      <div className="container pagina pagina-estado">
        <h1>Acesso restrito</h1>
        <p>Esta área é reservada à administração da loja.</p>
        <Link className="botao" to="/">
          Voltar à loja
        </Link>
      </div>
    )
  return <Outlet />
}
