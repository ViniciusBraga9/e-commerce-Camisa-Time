import { Link, useSearchParams } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { dataCurta, moeda, normalizar } from '../../services/banco'
import { STATUS_PEDIDOS } from '../../services/administracao'
import Paginacao from '../../components/Paginacao'

export default function PedidosAdmin() {
  const { banco } = useLoja()
  const [params, setParams] = useSearchParams()
  const busca = params.get('q') || ''
  const status = params.get('status') || ''
  const filtrados = banco.pedidos
    .filter((pedido) => {
      const texto = normalizar(pedido.id + ' ' + pedido.destinatario)
      return texto.includes(normalizar(busca)) && (!status || pedido.status === status)
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
  const paginas = Math.max(1, Math.ceil(filtrados.length / 6))
  const pagina = Math.max(
    1,
    Math.min(Number.parseInt(params.get('pagina'), 10) || 1, paginas),
  )

  function filtrar(nome, valor) {
    const novos = new URLSearchParams(params)
    if (valor) novos.set(nome, valor)
    else novos.delete(nome)
    if (nome !== 'pagina') novos.delete('pagina')
    setParams(novos, { replace: true })
  }

  return (
    <>
      <div className="admin-titulo">
        <div>
          <h1>Pedidos</h1>
          <p className="suave">Consulte as compras e acompanhe cada entrega.</p>
        </div>
      </div>
      <div className="admin-filtros">
        <div className="campo">
          <label htmlFor="buscar-pedido">Buscar pedido</label>
          <input
            id="buscar-pedido"
            type="search"
            placeholder="Número do pedido ou cliente"
            value={busca}
            onChange={(evento) => filtrar('q', evento.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="filtro-status">Status</label>
          <select
            id="filtro-status"
            value={status}
            onChange={(evento) => filtrar('status', evento.target.value)}
          >
            <option value="">Todos os pedidos</option>
            {STATUS_PEDIDOS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="admin-contagem" role="status">
        {filtrados.length} pedido(s) encontrado(s).
      </p>
      {!filtrados.length ? (
        <div className="estado">
          <h2>Nenhum pedido encontrado</h2>
          <p>As compras concluídas na loja aparecerão aqui.</p>
          <button className="botao secundario" onClick={() => setParams({})}>
            Limpar filtros
          </button>
        </div>
      ) : (
        <div
          className="admin-tabela-scroll"
          tabIndex="0"
          role="region"
          aria-label="Lista de pedidos"
        >
          <table className="admin-tabela">
            <caption className="somente-leitor">Pedidos de todos os clientes</caption>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Data</th>
                <th scope="col">Status</th>
                <th scope="col">Total</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice((pagina - 1) * 6, pagina * 6).map((pedido) => (
                <tr key={pedido.id}>
                  <td>
                    <strong>{pedido.id}</strong>
                  </td>
                  <td>{pedido.destinatario}</td>
                  <td>{dataCurta(pedido.data)}</td>
                  <td>
                    <span className={'status ' + pedido.status.toLowerCase()}>
                      {pedido.status}
                    </span>
                  </td>
                  <td className="sem-quebra">{moeda(pedido.total)}</td>
                  <td>
                    <Link
                      className="link"
                      to={'/admin/pedidos/' + pedido.id}
                      aria-label={'Ver pedido ' + pedido.id}
                    >
                      Ver pedido
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginacao
        pagina={pagina}
        paginas={paginas}
        mudar={(valor) => filtrar('pagina', valor)}
      />
    </>
  )
}
