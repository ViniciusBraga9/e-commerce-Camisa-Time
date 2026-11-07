import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import Icone from './Icone'

export default function Layout() {
  const { banco, usuario } = useLoja()
  const [menu, setMenu] = useState(false)
  const { pathname, search, hash } = useLocation()
  const ultima = useRef(pathname)
  const total = banco.carrinho.reduce((soma, item) => soma + item.quantidade, 0)
  const retro =
    pathname === '/produtos' && new URLSearchParams(search).get('modelo') === 'Retrô'

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else if (ultima.current !== pathname) {
      window.scrollTo(0, 0)
      document.getElementById('conteudo')?.focus({ preventScroll: true })
    }
    ultima.current = pathname
  }, [pathname, hash])

  function fecharMenu() {
    setMenu(false)
  }

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="cabecalho">
        <div className="container topo">
          <Link to="/" className="marca" aria-label="Camisa10, início" onClick={fecharMenu}>
            <img src="/marca/logo.webp" alt="Camisa10" width="157" height="36" />
          </Link>
          <nav
            className={'menu' + (menu ? ' aberto' : '')}
            id="menu-principal"
            aria-label="Principal"
            onClick={fecharMenu}
          >
            <NavLink to="/" end>
              Início
            </NavLink>
            <Link
              className={pathname.startsWith('/produtos') && !retro ? 'active' : ''}
              to="/produtos"
            >
              Catálogo
            </Link>
            <Link className={retro ? 'active' : ''} to="/produtos?modelo=Retr%C3%B4">
              Coleção retrô
            </Link>
          </nav>
          <div className="topo-acoes">
            <Link
              className="icone-link busca-topo"
              to="/produtos?buscar=1"
              aria-label="Buscar camisa"
              onClick={fecharMenu}
            >
              <Icone nome="busca" />
            </Link>
            {usuario && (
              <Link
                className="icone-link"
                to="/perfil"
                aria-label="Meu perfil"
                onClick={fecharMenu}
              >
                <Icone nome="pessoa" />
              </Link>
            )}
            <Link
              to="/carrinho"
              className="carrinho-link"
              onClick={fecharMenu}
              aria-label={'Carrinho, ' + total + ' itens'}
            >
              <Icone nome="sacola" tamanho={19} />
              <span>Carrinho</span>
              <b>{total}</b>
            </Link>
            <button
              type="button"
              className="menu-botao icone-link"
              aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menu}
              aria-controls="menu-principal"
              onClick={() => setMenu(!menu)}
            >
              <Icone nome={menu ? 'fechar' : 'menu'} />
            </button>
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex="-1">
        <Outlet />
      </main>
      <footer className="rodape">
        <div className="container rodape-dentro">
          <div>
            <Link to="/" className="marca-rodape">
              <img src="/marca/logo-claro.webp" alt="Camisa10" />
            </Link>
            <p>Loja acadêmica · Compras simuladas</p>
          </div>
          <nav aria-label="Rodapé">
            <Link to="/produtos">Catálogo</Link>
            <Link to="/pedidos">Meus pedidos</Link>
            <Link to="/perfil">Meu perfil</Link>
            <a href="/creditos.txt">Créditos</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
