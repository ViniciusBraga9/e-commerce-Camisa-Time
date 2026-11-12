import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { adicionarItem } from '../services/pedidos'
import { moeda } from '../services/banco'
import { Caminho, Erro, Quantidade } from '../components/Interface'
import Icone from '../components/Icone'
import Avaliacoes from '../components/Avaliacoes'
import NaoEncontrada from './NaoEncontrada'

function Ficha({ produto }) {
  const { banco, alterar } = useLoja()
  const navegar = useNavigate()
  const [tamanho, setTamanho] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [erro, setErro] = useState('')
  const liga = banco.categorias.find((l) => l.id === produto.liga)
  const jaNoCarrinho =
    banco.carrinho.find((i) => i.produtoId === produto.id && i.tamanho === tamanho)
      ?.quantidade || 0
  const disponivel = (produto.estoque[tamanho] || 0) - jaNoCarrinho
  const esgotada = Object.values(produto.estoque).every((n) => n < 1)

  function adicionar(evento) {
    evento.preventDefault()
    if (!tamanho) {
      setErro('Escolha o tamanho da camisa.')
      return
    }
    try {
      alterar((bancoAtual) => adicionarItem(bancoAtual, produto.id, tamanho, quantidade))
      navegar('/carrinho', {
        state: { aviso: produto.time + ' · ' + tamanho + ' adicionada ao carrinho.' },
      })
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <div className="container pagina">
      <Caminho
        atual={produto.time}
        anteriores={[{ nome: 'Catálogo', para: '/produtos' }]}
      />
      <div className="detalhe-produto">
        <div className="foto-detalhe">
          <img
            src={produto.imagem}
            alt={
              'Camisa ' + produto.time + ' ' + produto.modelo + ' ' + produto.temporada
            }
          />
        </div>
        <div className="ficha-produto">
          <span className="rotulo">{liga?.nome}</span>
          <h1>{produto.time}</h1>
          <p className="modelo">
            {produto.modelo} · {produto.temporada}
          </p>
          <strong className="preco-grande">{moeda(produto.preco)}</strong>
          <p className="descricao">{produto.descricao}</p>
          <form onSubmit={adicionar}>
            <fieldset className="tamanhos">
              <legend>Escolha o tamanho</legend>
              <div>
                {Object.entries(produto.estoque).map(([tam, estoque]) => (
                  <label key={tam}>
                    <input
                      type="radio"
                      name="tamanho"
                      value={tam}
                      checked={tamanho === tam}
                      disabled={estoque <= 0}
                      onChange={() => {
                        setTamanho(tam)
                        setQuantidade(1)
                        setErro('')
                      }}
                    />
                    <span>{tam}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="escolha-quantidade">
              <strong>Quantidade</strong>
              <Quantidade
                valor={quantidade}
                maximo={Math.max(1, disponivel)}
                mudar={setQuantidade}
              />
            </div>
            <Erro>{erro}</Erro>
            {tamanho && disponivel <= 0 && (
              <p role="status" className="suave">
                Todas as unidades deste tamanho já estão no carrinho.
              </p>
            )}
            <button
              className="botao botao-laranja larga"
              disabled={esgotada || (tamanho && disponivel <= 0)}
            >
              <Icone nome="sacola" />
              {esgotada ? 'Camisa esgotada' : 'Adicionar ao carrinho'}
            </button>
          </form>
        </div>
      </div>
      <Avaliacoes produtoId={produto.id} />
    </div>
  )
}

export default function Produto() {
  const { id } = useParams()
  const { banco } = useLoja()
  const produto = banco.produtos.find((p) => p.id === id)
  return produto ? (
    <Ficha key={id} produto={produto} />
  ) : (
    <NaoEncontrada titulo="Camisa não encontrada" />
  )
}
