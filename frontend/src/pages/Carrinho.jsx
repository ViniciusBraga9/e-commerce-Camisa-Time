import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { moeda } from '../services/banco'
import { itensDoCarrinho, mudarQuantidade, totalItens } from '../services/pedidos'
import { Caminho, Erro, Estado, Quantidade } from '../components/Interface'
import Icone from '../components/Icone'

export default function Carrinho() {
  const { banco, alterar } = useLoja()
  const { state } = useLocation()
  const navegar = useNavigate()
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState(state?.aviso || '')
  const itens = itensDoCarrinho(banco)
  const total = totalItens(itens)
  const unidades = itens.reduce((soma, i) => soma + i.quantidade, 0)
  function quantidade(item, valor) {
    try {
      alterar((bancoAtual) => mudarQuantidade(bancoAtual, item.produtoId, item.tamanho, valor))
      setAviso(valor ? 'Quantidade atualizada.' : 'Camisa removida.')
      setErro('')
    } catch (falha) {
      setErro(falha.message)
    }
  }
  function limpar() {
    if (!window.confirm('Retirar todas as camisas do carrinho?')) return
    try {
      alterar((bancoAtual) => {
        bancoAtual.carrinho = []
      })
      setAviso('Carrinho esvaziado.')
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <div className="container pagina">
      <Caminho atual="Carrinho" />
      <h1>Seu carrinho</h1>
      {aviso && (
        <p className="sucesso" role="status">
          <Icone nome="visto" tamanho={17} />
          {aviso}
        </p>
      )}
      <Erro>{erro}</Erro>
      {!itens.length ? (
        <Estado
          titulo="Seu carrinho está vazio"
          texto="Escolha uma camisa e o seu tamanho para começar."
        />
      ) : (
        <div className="duas-colunas">
          <section aria-label="Itens no carrinho">
            <div className="lista-itens">
              {itens.map((item) => (
                <article className="linha-item" key={item.produtoId + item.tamanho}>
                  <Link className="mini-foto" to={'/produtos/' + item.produtoId}>
                    {item.imagem && <img src={item.imagem} alt={'Camisa ' + item.nome} />}
                  </Link>
                  <div className="item-info">
                    <Link className="item-nome" to={'/produtos/' + item.produtoId}>
                      {item.nome}
                    </Link>
                    <span>
                      {item.modelo} · Tam. {item.tamanho}
                    </span>
                    <small>{moeda(item.preco)} a unidade</small>
                    <Quantidade
                      nome={'Quantidade de ' + item.nome + ' ' + item.tamanho}
                      valor={item.quantidade}
                      maximo={item.estoque}
                      mudar={(n) => quantidade(item, n)}
                    />
                    {item.quantidade > item.estoque && (
                      <Erro>Estoque insuficiente. Ajuste ou remova o item.</Erro>
                    )}
                  </div>
                  <div className="item-direita">
                    <strong>{moeda(item.preco * item.quantidade)}</strong>
                    <button
                      className="icone-link"
                      aria-label={'Remover ' + item.nome + ' ' + item.tamanho}
                      onClick={() => quantidade(item, 0)}
                    >
                      <Icone nome="lixeira" tamanho={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="titulo-linha baixo">
              <Link to="/produtos" className="link-seta">
                <Icone nome="anterior" tamanho={14} /> Continuar comprando
              </Link>
              <button className="link" onClick={limpar}>
                Limpar carrinho
              </button>
            </div>
          </section>
          <aside className="resumo">
            <h2>Resumo da compra</h2>
            <div className="par">
              <span>
                {unidades} {unidades === 1 ? 'camisa' : 'camisas'}
              </span>
              <span>{moeda(total)}</span>
            </div>
            <div className="par">
              <span>Frete simulado</span>
              <span>Grátis</span>
            </div>
            <div className="par total">
              <b>Total</b>
              <strong>{moeda(total)}</strong>
            </div>
            <button
              className="botao botao-laranja larga"
              disabled={itens.some((i) => i.quantidade > i.estoque)}
              onClick={() => navegar('/checkout')}
            >
              Finalizar compra <Icone nome="seta" />
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
