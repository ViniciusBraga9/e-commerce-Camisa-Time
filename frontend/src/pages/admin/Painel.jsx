import { Link } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { dataCurta, moeda } from '../../services/banco'
import Icone from '../../components/Icone'

export default function Painel() {
  const { banco } = useLoja()
  const recebidos = banco.pedidos.filter((pedido) => pedido.status === 'Recebido')
  const enviados = banco.pedidos.filter((pedido) => pedido.status === 'Enviado')
  const ultimos = [...banco.pedidos]
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 5)

  return (
    <>
      <div className="admin-titulo">
        <div>
          <h1>Painel da loja</h1>
          <p className="suave">Organize o catálogo e acompanhe os pedidos.</p>
        </div>
        <Link className="botao botao-laranja" to="/admin/produtos/novo">
          <Icone nome="mais" /> Nova camisa
        </Link>
      </div>
      <div className="admin-indicadores">
        <Link to="/admin/produtos">
          <span>Camisas no catálogo</span>
          <strong>{banco.produtos.length}</strong>
          <small>
            Gerenciar produtos <Icone nome="seta" tamanho={15} />
          </small>
        </Link>
        <Link to="/admin/categorias">
          <span>Categorias</span>
          <strong>{banco.categorias.length}</strong>
          <small>
            Organizar ligas <Icone nome="seta" tamanho={15} />
          </small>
        </Link>
        <Link to="/admin/pedidos?status=Recebido">
          <span>Aguardando envio</span>
          <strong>{recebidos.length}</strong>
          <small>
            Ver recebidos <Icone nome="seta" tamanho={15} />
          </small>
        </Link>
        <Link to="/admin/pedidos?status=Enviado">
          <span>Em entrega</span>
          <strong>{enviados.length}</strong>
          <small>
            Ver enviados <Icone nome="seta" tamanho={15} />
          </small>
        </Link>
      </div>
      <section className="admin-painel">
        <div className="titulo-linha">
          <h2>Últimos pedidos</h2>
          <Link className="link" to="/admin/pedidos">
            Ver todos
          </Link>
        </div>
        {ultimos.length === 0 && (
          <p className="suave">
            Nenhum pedido recebido. As compras concluídas na loja aparecerão aqui.
          </p>
        )}
        <div className="admin-recentes">
          {ultimos.map((pedido) => (
            <Link key={pedido.id} to={'/admin/pedidos/' + pedido.id}>
              <div>
                <strong>{pedido.id}</strong>
                <small>
                  {pedido.destinatario} · {dataCurta(pedido.data)}
                </small>
              </div>
              <span className={'status ' + pedido.status.toLowerCase()}>
                {pedido.status}
              </span>
              <b>{moeda(pedido.total)}</b>
              <Icone nome="proximo" tamanho={17} />
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
