import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LojaProvider from './context/LojaProvider'
import Layout from './components/Layout'
import RotaPrivada from './routes/RotaPrivada'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Produto from './pages/Produto'
import Carrinho from './pages/Carrinho'
import Conta from './pages/Conta'
import Checkout from './pages/Checkout'
import Perfil from './pages/Perfil'
import Pedidos from './pages/Pedidos'
import Pedido from './pages/Pedido'
import NaoEncontrada from './pages/NaoEncontrada'
import Administracao from './pages/admin/Administracao'

export default function App() {
  return (
    <LojaProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* O visitante pode montar o carrinho antes de entrar. */}
            <Route index element={<Home />} />
            <Route path="produtos" element={<Catalogo />} />
            <Route path="produtos/:id" element={<Produto />} />
            <Route path="carrinho" element={<Carrinho />} />
            <Route path="login" element={<Conta key="login" />} />
            <Route path="cadastro" element={<Conta key="cadastro" cadastro />} />
            {/* Depois de fechar o carrinho, o checkout exige login. */}
            <Route element={<RotaPrivada />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="pedidos/:id" element={<Pedido />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
            {/* O colega pode acrescentar as rotas de produtos, categorias e pedidos neste bloco. */}
            <Route element={<RotaPrivada perfil="admin" />}>
              <Route path="admin/*" element={<Administracao />} />
            </Route>
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LojaProvider>
  )
}
