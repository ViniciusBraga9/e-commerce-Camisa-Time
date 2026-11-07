import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { esperar, exigirCliente, moeda } from '../services/banco'
import { criarPedido, itensDoCarrinho, totalItens } from '../services/pedidos'
import { enderecoVazio, validarEndereco } from '../services/endereco'
import { Caminho, Erro } from '../components/Interface'
import { EnderecoForm } from '../components/Endereco'
import Icone from '../components/Icone'

export default function Checkout() {
  const { banco, usuario, alterar } = useLoja()
  const navegar = useNavigate()
  const [endereco, setEndereco] = useState(usuario.endereco || enderecoVazio)
  const [pagamento, setPagamento] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const itens = itensDoCarrinho(banco)
  const mudar = (campo, valor) => {
    setEndereco({ ...endereco, [campo]: valor })
    setErros({ ...erros, [campo]: '' })
  }

  async function confirmar(evento) {
    evento.preventDefault()
    if (enviando) return
    const novos = validarEndereco(endereco)
    if (!pagamento) novos.pagamento = 'Escolha uma forma de pagamento.'
    setErros(novos)
    if (Object.keys(novos).length) {
      document.getElementById(Object.keys(novos)[0])?.focus()
      return
    }
    setErro('')
    setEnviando(true)
    try {
      await esperar()
      const id = alterar((bancoAtual) => {
        const cliente = exigirCliente(bancoAtual)
        if (cliente.id !== usuario.id)
          throw new Error('A conta mudou. Confira os dados e tente novamente.')
        if (JSON.stringify(itensDoCarrinho(bancoAtual)) !== JSON.stringify(itens)) {
          throw new Error('Seu carrinho mudou. Confira o resumo antes de confirmar.')
        }
        const novoId = criarPedido(bancoAtual, endereco, pagamento)
        if (lembrar) cliente.endereco = { ...endereco }
        return novoId
      })
      navegar('/pedidos/' + id, { replace: true, state: { confirmado: true } })
    } catch (falha) {
      setErro(falha.message)
      setEnviando(false)
    }
  }

  return (
    <div className="container pagina">
      <Caminho atual="Checkout" anteriores={[{ nome: 'Carrinho', para: '/carrinho' }]} />
      <h1>Finalizar compra</h1>
      <form className="duas-colunas" onSubmit={confirmar} noValidate>
        <div className="blocos">
          <fieldset className="bloco-form">
            <legend>Endereço de entrega</legend>
            <EnderecoForm dados={endereco} mudar={mudar} erros={erros} />
            <label className="check">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(evento) => setLembrar(evento.target.checked)}
              />{' '}
              Salvar este endereço no meu perfil
            </label>
          </fieldset>
          <fieldset className="bloco-form">
            <legend>Pagamento</legend>
            <p className="suave">
              Compra simulada para o projeto da turma. Use dados fictícios.
            </p>
            <div className="opcoes-pagamento">
              {['Pix', 'Cartão'].map((m, i) => (
                <label key={m}>
                  <input
                    type="radio"
                    name="pagamento"
                    id={i === 0 ? 'pagamento' : 'cartao'}
                    checked={pagamento === m}
                    onChange={() => {
                      setPagamento(m)
                      setErros({ ...erros, pagamento: '' })
                    }}
                  />
                  {m}
                </label>
              ))}
            </div>
            <Erro>{erros.pagamento}</Erro>
          </fieldset>
        </div>
        <aside className="resumo">
          <h2>Seu pedido</h2>
          {itens.map((i) => (
            <div className="resumo-item" key={i.produtoId + i.tamanho}>
              <img src={i.imagem} alt="" />
              <div>
                <b>{i.nome}</b>
                <small>
                  Tam. {i.tamanho} · {i.quantidade} un.
                </small>
              </div>
              <span>{moeda(i.preco * i.quantidade)}</span>
            </div>
          ))}
          <div className="par">
            <span>Frete simulado</span>
            <span>Grátis</span>
          </div>
          <div className="par total">
            <b>Total</b>
            <strong>{moeda(totalItens(itens))}</strong>
          </div>
          <Erro>{erro}</Erro>
          <button className="botao botao-laranja larga" disabled={enviando}>
            {enviando ? 'Enviando pedido…' : 'Confirmar pedido'}
            <Icone nome="seta" />
          </button>
          <Link className="link central" to="/carrinho">
            Voltar ao carrinho
          </Link>
        </aside>
      </form>
    </div>
  )
}
