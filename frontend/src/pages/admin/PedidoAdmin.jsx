import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { dataCurta, esperar, moeda } from '../../services/banco'
import { alterarStatusPedido, proximosStatus } from '../../services/administracao'
import { EnderecoTexto } from '../../components/Endereco'
import { Erro } from '../../components/Interface'
import NaoEncontrada from '../NaoEncontrada'

function Detalhes({ pedido }) {
  const { banco, alterar } = useLoja()
  const [status, setStatus] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const opcoes = proximosStatus(pedido.status)
  const cliente = banco.usuarios.find((item) => item.id === pedido.clienteId)

  function preparar(evento) {
    evento.preventDefault()
    setErro('')
    setAviso('')
    if (!opcoes.includes(status)) {
      setErro('Selecione o novo status do pedido.')
      document.getElementById('novo-status')?.focus()
      return
    }
    setConfirmando(true)
  }

  async function salvar() {
    if (salvando) return
    setSalvando(true)
    setErro('')
    try {
      await esperar()
      alterar((dados) => alterarStatusPedido(dados, pedido.id, status))
      setAviso('Status atualizado para ' + status + '.')
      setStatus('')
      setConfirmando(false)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="admin-titulo">
        <div>
          <h1>Pedido {pedido.id}</h1>
          <p className="suave">Realizado em {dataCurta(pedido.data)}.</p>
        </div>
        <Link className="link" to="/admin/pedidos">
          Voltar aos pedidos
        </Link>
      </div>
      {aviso && (
        <p role="status" className="sucesso">
          {aviso}
        </p>
      )}
      <div className="duas-colunas">
        <section>
          <div className="pedido-status">
            <div className="titulo-linha">
              <h2>Status do pedido</h2>
              <span className={'status ' + pedido.status.toLowerCase()}>
                {pedido.status}
              </span>
            </div>
            {opcoes.length > 0 ? (
              <form className="admin-status-form" onSubmit={preparar}>
                <div className="campo">
                  <label htmlFor="novo-status">Novo status</label>
                  <select
                    id="novo-status"
                    value={status}
                    disabled={salvando || confirmando}
                    onChange={(evento) => {
                      setStatus(evento.target.value)
                      setErro('')
                    }}
                  >
                    <option value="">Selecione</option>
                    {opcoes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <button className="botao" disabled={salvando || confirmando}>
                  Atualizar status
                </button>
              </form>
            ) : (
              <p>Este pedido foi encerrado e não permite novas mudanças de status.</p>
            )}
            {confirmando && (
              <div
                className="admin-confirmacao"
                role="region"
                aria-label="Confirmar novo status"
              >
                <strong>Alterar o status para {status}?</strong>
                <p>
                  {status === 'Cancelado'
                    ? 'As unidades serão devolvidas ao estoque. O cancelamento encerra o pedido.'
                    : 'A alteração aparecerá no acompanhamento do cliente.'}
                </p>
                <div className="acoes">
                  <button
                    className="botao secundario"
                    disabled={salvando}
                    onClick={() => setConfirmando(false)}
                  >
                    Voltar
                  </button>
                  <button className="botao" disabled={salvando} onClick={salvar}>
                    {salvando ? 'Salvando…' : 'Confirmar alteração'}
                  </button>
                </div>
              </div>
            )}
            {salvando && <p role="status">Atualizando pedido…</p>}
            <Erro>{erro}</Erro>
          </div>
          <h2 className="subsecao">Camisas do pedido</h2>
          <div className="lista-itens">
            {pedido.itens.map((item) => (
              <article className="linha-item" key={item.produtoId + item.tamanho}>
                <div className="mini-foto">
                  <img src={item.imagem} alt={'Camisa ' + item.nome} />
                </div>
                <div className="item-info">
                  <strong className="item-nome">{item.nome}</strong>
                  <span>{item.modelo}</span>
                  <small>
                    Tam. {item.tamanho} · {item.quantidade} un.
                  </small>
                  <small>{moeda(item.preco)} por unidade</small>
                </div>
                <strong className="item-direita">
                  {moeda(item.preco * item.quantidade)}
                </strong>
              </article>
            ))}
          </div>
        </section>
        <aside className="resumo">
          <h2>Cliente e entrega</h2>
          <strong>{pedido.destinatario}</strong>
          <p className="admin-email">{cliente?.email}</p>
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
    </>
  )
}

export default function PedidoAdmin() {
  const { id } = useParams()
  const { banco } = useLoja()
  const pedido = banco.pedidos.find((item) => item.id === id)
  return pedido ? (
    <Detalhes key={id} pedido={pedido} />
  ) : (
    <NaoEncontrada titulo="Pedido não encontrado" />
  )
}
