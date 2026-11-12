import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { dataCurta, moeda } from '../services/banco'
import { cancelarPedido } from '../services/pedidos'
import { Caminho, Erro } from '../components/Interface'
import { EnderecoTexto } from '../components/Endereco'
import MenuCliente from '../components/MenuCliente'
import Icone from '../components/Icone'
import NaoEncontrada from './NaoEncontrada'

const etapas = ['Recebido', 'Enviado', 'Entregue']

function Detalhes({ pedido }) {
  const { banco, alterar } = useLoja()
  const { state } = useLocation()
  const [confirmar, setConfirmar] = useState(false)
  const [acompanhar, setAcompanhar] = useState(false)
  const [erro, setErro] = useState('')
  function cancelar() {
    try {
      alterar((bancoAtual) => cancelarPedido(bancoAtual, pedido.id))
      setConfirmar(false)
    } catch (falha) {
      setErro(falha.message)
    }
  }
  return (
    <div className="container pagina">
      <Caminho
        atual={pedido.id}
        anteriores={[{ nome: 'Meus pedidos', para: '/pedidos' }]}
      />
      {state?.confirmado && pedido.status === 'Recebido' && (
        <p className="sucesso" role="status">
          <Icone nome="visto" tamanho={17} />
          Compra simulada concluída.
        </p>
      )}
      <h1>Pedido {pedido.id}</h1>
      <MenuCliente />
      <div className="duas-colunas">
        <section>
          <div className="pedido-status">
            <div className="titulo-linha">
              <h2>Status do pedido</h2>
              <span className={'status ' + pedido.status.toLowerCase()}>
                {pedido.status}
              </span>
            </div>
            <p>Pedido realizado em {dataCurta(pedido.data)}.</p>
            {pedido.status === 'Recebido' && !confirmar && (
              <button className="link" onClick={() => setConfirmar(true)}>
                Cancelar pedido
              </button>
            )}
            {confirmar && (
              <div className="confirmacao">
                <strong>Confirmar o cancelamento deste pedido?</strong>
                <div className="acoes">
                  <button
                    className="botao secundario"
                    onClick={() => setConfirmar(false)}
                  >
                    Manter pedido
                  </button>
                  <button className="botao" onClick={cancelar}>
                    Confirmar cancelamento
                  </button>
                </div>
              </div>
            )}
            {pedido.status === 'Enviado' && (
              <button
                className="link"
                aria-expanded={acompanhar}
                onClick={() => setAcompanhar(!acompanhar)}
              >
                {acompanhar ? 'Fechar acompanhamento' : 'Acompanhar envio'}
              </button>
            )}
            {acompanhar && pedido.status === 'Enviado' && (
              <div className="rastreio">
                <ol>
                  {etapas.map((etapa, i) => (
                    <li
                      key={etapa}
                      className={i <= etapas.indexOf(pedido.status) ? 'concluida' : ''}
                    >
                      {etapa}
                      {etapa === 'Entregue' && ' · pendente'}
                    </li>
                  ))}
                </ol>
                <p>O pedido saiu para entrega no acompanhamento simulado.</p>
              </div>
            )}
            {pedido.status === 'Cancelado' && (
              <p role="status">Pedido cancelado. As unidades voltaram ao estoque.</p>
            )}
            <Erro>{erro}</Erro>
          </div>
          <h2 className="subsecao">Camisas do pedido</h2>
          <div className="lista-itens">
            {pedido.itens.map((i) => (
              <article className="linha-item" key={i.produtoId + i.tamanho}>
                <Link
                  className="mini-foto"
                  to={
                    banco.produtos.some((produto) => produto.id === i.produtoId)
                      ? '/produtos/' + i.produtoId
                      : '/produtos'
                  }
                >
                  <img src={i.imagem} alt={'Camisa ' + i.nome} />
                </Link>
                <div className="item-info">
                  <Link
                    className="item-nome"
                    to={
                      banco.produtos.some((produto) => produto.id === i.produtoId)
                        ? '/produtos/' + i.produtoId
                        : '/produtos'
                    }
                  >
                    {i.nome}
                  </Link>
                  <span>{i.modelo}</span>
                  <small>
                    Tam. {i.tamanho} · {i.quantidade} un.
                  </small>
                  {pedido.status === 'Entregue' &&
                    banco.produtos.some((produto) => produto.id === i.produtoId) && (
                      <Link
                        className="link"
                        to={'/produtos/' + i.produtoId + '#avaliacoes'}
                      >
                        Ver e avaliar camisa
                      </Link>
                    )}
                </div>
                <strong className="item-direita">{moeda(i.preco * i.quantidade)}</strong>
              </article>
            ))}
          </div>
        </section>
        <aside className="resumo">
          <h2>Entrega e pagamento</h2>
          <b>{pedido.destinatario}</b>
          <EnderecoTexto dados={pedido.endereco} />
          <div className="par">
            <span>Pagamento simulado</span>
            <b>{pedido.pagamento}</b>
          </div>
          <div className="par">
            <span>Frete</span>
            <span>Grátis</span>
          </div>
          <div className="par total">
            <span>Total</span>
            <strong>{moeda(pedido.total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function Pedido() {
  const { id } = useParams()
  const { banco, usuario } = useLoja()
  const pedido = banco.pedidos.find((p) => p.id === id && p.clienteId === usuario.id)
  return pedido ? (
    <Detalhes key={id} pedido={pedido} />
  ) : (
    <NaoEncontrada titulo="Pedido não encontrado" />
  )
}
