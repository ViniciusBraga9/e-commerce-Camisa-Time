import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { dataCurta, moeda } from '../../services/banco'
import { alterarStatusPedido, statusDisponiveis } from '../../services/admin'
import { Caminho, Erro } from '../../components/Interface'
import Icone from '../../components/Icone'

const FILTROS = ['Todos', 'Recebido', 'Enviado', 'Entregue', 'Cancelado']

export default function AdminPedidos() {
  const { banco, alterar } = useLoja()
  const [filtro, setFiltro] = useState('Todos')
  const [aberto, setAberto] = useState(null)
  const [erro, setErro] = useState('')

  const pedidos = filtro === 'Todos'
    ? banco.pedidos
    : banco.pedidos.filter((p) => p.status === filtro)

  function clienteNome(clienteId) {
    return banco.usuarios.find((u) => u.id === clienteId)?.nome || '—'
  }

  function mudarStatus(pedidoId, novoStatus) {
    setErro('')
    try {
      alterar((b) => alterarStatusPedido(b, pedidoId, novoStatus))
      setAberto(null)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <div className="container pagina">
      <Caminho atual="Pedidos" anteriores={[{ nome: 'Administração', para: '/admin' }]} />
      <div className="admin-topo">
        <h1>Pedidos</h1>
        <nav className="admin-nav" aria-label="Áreas do painel">
          <NavLink to="/admin/produtos">Produtos</NavLink>
          <NavLink to="/admin/categorias">Categorias</NavLink>
          <NavLink to="/admin/pedidos">Pedidos</NavLink>
        </nav>
      </div>

      <div className="admin-filtros" role="group" aria-label="Filtrar por status">
        {FILTROS.map((f) => (
          <button
            key={f}
            className={`admin-filtro-btn ${filtro === f ? 'ativo' : ''}`}
            onClick={() => { setFiltro(f); setAberto(null); setErro('') }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="admin-tabela">
        <div className="admin-tabela-cabecalho admin-tabela-cab-pedido">
          <span>Pedido</span>
          <span>Cliente</span>
          <span>Data</span>
          <span>Status</span>
          <span>Total</span>
          <span />
        </div>

        {pedidos.map((p) => {
          const proximos = statusDisponiveis(p.status)
          return (
            <div key={p.id}>
              <div className="admin-linha admin-linha-pedido">
                <strong className="admin-pedido-id">{p.id}</strong>
                <span>{clienteNome(p.clienteId)}</span>
                <span>{dataCurta(p.data)}</span>
                <span className={'status ' + p.status.toLowerCase()}>{p.status}</span>
                <span>{moeda(p.total)}</span>
                <button
                  className="icone-link"
                  title={proximos.length ? 'Alterar status' : 'Status final'}
                  disabled={!proximos.length}
                  onClick={() => { setAberto(aberto === p.id ? null : p.id); setErro('') }}
                >
                  <Icone nome={proximos.length ? 'lapis' : 'visto'} tamanho={17} />
                </button>
              </div>

              {aberto === p.id && (
                <div className="admin-status-painel">
                  <div className="admin-itens-pedido">
                    {p.itens.map((item) => (
                      <div key={item.produtoId + item.tamanho} className="admin-item-mini">
                        <img src={item.imagem} alt="" />
                        <span>{item.nome} · {item.tamanho} · {item.quantidade}×</span>
                      </div>
                    ))}
                  </div>
                  <div className="admin-status-acoes">
                    <span className="suave">Alterar para:</span>
                    {proximos.map((s) => (
                      <button
                        key={s}
                        className={`botao ${s === 'Cancelado' ? 'secundario' : ''}`}
                        onClick={() => mudarStatus(p.id, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <Erro>{erro}</Erro>
                </div>
              )}
            </div>
          )
        })}

        {!pedidos.length && (
          <p className="admin-vazio">Nenhum pedido {filtro !== 'Todos' ? 'com status "' + filtro + '"' : ''}.</p>
        )}
      </div>
    </div>
  )
}
