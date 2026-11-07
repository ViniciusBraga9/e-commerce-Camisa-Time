import { Link } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { dataCurta, moeda } from '../services/banco'
import { Caminho, Estado } from '../components/Interface'
import Icone from '../components/Icone'
import MenuCliente from '../components/MenuCliente'

export default function Pedidos() {
  const { banco, usuario } = useLoja()
  const pedidos = banco.pedidos.filter((p) => p.clienteId === usuario.id)
  return (
    <div className="container pagina">
      <Caminho atual="Meus pedidos" />
      <h1>Meus pedidos</h1>
      <MenuCliente />
      {!pedidos.length ? (
        <Estado
          icone="caixa"
          titulo="Ainda sem pedidos"
          texto="Depois de finalizar uma compra, você pode acompanhá-la aqui."
        />
      ) : (
        <div className="lista-pedidos">
          {pedidos.map((p) => (
            <Link className="pedido-linha" key={p.id} to={'/pedidos/' + p.id}>
              <img src={p.itens[0].imagem} alt="" />
              <div>
                <strong>{p.id}</strong>
                <small>{dataCurta(p.data)}</small>
              </div>
              <span className={'status ' + p.status.toLowerCase()}>{p.status}</span>
              <b>{moeda(p.total)}</b>
              <Icone nome="proximo" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
