import { useState } from 'react'
import { useLoja } from '../context/LojaContext'
import { dataCurta } from '../services/banco'
import { excluirAvaliacao, podeAvaliar, salvarAvaliacao } from '../services/pedidos'
import { Erro } from './Interface'

function FormAvaliacao({ produtoId, anterior, fechar }) {
  const { alterar } = useLoja()
  const [nota, setNota] = useState(anterior?.nota || '')
  const [mensagem, setMensagem] = useState(anterior?.mensagem || '')
  const [erro, setErro] = useState('')

  function salvar(evento) {
    evento.preventDefault()
    try {
      alterar((bancoAtual) => salvarAvaliacao(bancoAtual, produtoId, Number(nota), mensagem))
      fechar('Avaliação salva.')
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <form className="form-avaliacao" onSubmit={salvar}>
      <div className="campo">
        <label htmlFor="nota">Sua nota</label>
        <select
          id="nota"
          value={nota}
          onChange={(evento) => setNota(evento.target.value)}
          required
        >
          <option value="">Selecione</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} de 5
            </option>
          ))}
        </select>
      </div>
      <div className="campo">
        <label htmlFor="comentario">Seu comentário</label>
        <textarea
          id="comentario"
          rows="3"
          maxLength="500"
          value={mensagem}
          onChange={(evento) => setMensagem(evento.target.value)}
          required
        />
      </div>
      <Erro>{erro}</Erro>
      <div className="acoes">
        <button className="botao">Salvar avaliação</button>
        <button className="link" type="button" onClick={() => fechar('')}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function Avaliacoes({ produtoId }) {
  const { banco, usuario, alterar } = useLoja()
  const [editando, setEditando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')
  const lista = banco.avaliacoes.filter((a) => a.produtoId === produtoId)
  const propria = lista.find((a) => a.clienteId === usuario?.id)
  const liberada = usuario && podeAvaliar(banco, usuario.id, produtoId)

  function excluir(id) {
    if (!window.confirm('Excluir sua avaliação desta camisa?')) return
    try {
      alterar((bancoAtual) => excluirAvaliacao(bancoAtual, id))
      setAviso('Avaliação excluída.')
      setEditando(false)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <section className="avaliacoes" id="avaliacoes">
      <div className="titulo-linha">
        <h2>
          Avaliações <small>({lista.length})</small>
        </h2>
        {liberada && !editando && !propria && (
          <button className="botao secundario" onClick={() => setEditando(true)}>
            Avaliar camisa
          </button>
        )}
      </div>
      {aviso && (
        <p className="sucesso" role="status">
          {aviso}
        </p>
      )}
      <Erro>{erro}</Erro>
      {lista.length === 0 && !editando && (
        <p className="suave">Esta camisa ainda não recebeu avaliações.</p>
      )}
      {lista.map((a) => (
        <article key={a.id} className="avaliacao">
          <div>
            <strong>
              {banco.usuarios.find((u) => u.id === a.clienteId)?.nome || 'Cliente'}
            </strong>{' '}
            <small>{dataCurta(a.data)}</small>
          </div>
          <span className="estrelas" aria-label={a.nota + ' de 5 estrelas'}>
            {'★'.repeat(a.nota)}
            {'☆'.repeat(5 - a.nota)}
          </span>
          <p>{a.mensagem}</p>
          {a.clienteId === usuario?.id && !editando && (
            <div className="acoes">
              <button className="link" onClick={() => setEditando(true)}>
                Editar avaliação
              </button>
              <button className="link" onClick={() => excluir(a.id)}>
                Excluir avaliação
              </button>
            </div>
          )}
        </article>
      ))}
      {editando && liberada && (
        <FormAvaliacao
          produtoId={produtoId}
          anterior={propria}
          fechar={(msg) => {
            setEditando(false)
            setAviso(msg)
          }}
        />
      )}
    </section>
  )
}
