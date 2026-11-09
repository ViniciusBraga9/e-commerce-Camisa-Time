import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { criarCategoria, editarCategoria, excluirCategoria } from '../../services/admin'
import { Caminho, Erro } from '../../components/Interface'
import Icone from '../../components/Icone'

export default function AdminCategorias() {
  const { banco, alterar } = useLoja()
  const [formAberto, setFormAberto] = useState(null)
  const [confirmar, setConfirmar] = useState(null)
  const [campos, setCampos] = useState({ id: '', nome: '' })
  const [erro, setErro] = useState('')

  function abrirNovo() {
    setCampos({ id: '', nome: '' })
    setFormAberto('novo')
    setConfirmar(null)
    setErro('')
  }

  function abrirEditar(cat) {
    setCampos({ id: cat.id, nome: cat.nome })
    setFormAberto(cat.id)
    setConfirmar(null)
    setErro('')
  }

  function fechar() {
    setFormAberto(null)
    setErro('')
  }

  function mudar(e) {
    setCampos((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function salvarNovo(e) {
    e.preventDefault()
    setErro('')
    try {
      alterar((b) => criarCategoria(b, campos))
      setFormAberto(null)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  function salvarEdicao(id, e) {
    e.preventDefault()
    setErro('')
    try {
      alterar((b) => editarCategoria(b, id, { nome: campos.nome }))
      setFormAberto(null)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  function excluir(id) {
    setErro('')
    try {
      alterar((b) => excluirCategoria(b, id))
      setConfirmar(null)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  const usoPorCategoria = (id) => banco.produtos.filter((p) => p.liga === id).length

  return (
    <div className="container pagina">
      <Caminho atual="Categorias" anteriores={[{ nome: 'Administração', para: '/admin' }]} />
      <div className="admin-topo">
        <h1>Categorias</h1>
        <nav className="admin-nav" aria-label="Áreas do painel">
          <NavLink to="/admin/produtos">Produtos</NavLink>
          <NavLink to="/admin/categorias">Categorias</NavLink>
          <NavLink to="/admin/pedidos">Pedidos</NavLink>
        </nav>
        {formAberto !== 'novo' && (
          <button className="botao" onClick={abrirNovo}>
            <Icone nome="mais" tamanho={16} />
            Nova categoria
          </button>
        )}
      </div>

      {formAberto === 'novo' && (
        <form className="form-admin form-admin-bloco" onSubmit={salvarNovo} noValidate>
          <h2 className="form-admin-titulo">Nova categoria</h2>
          <div className="form-linha">
            <div className="campo">
              <label htmlFor="cat-id-novo">Identificador (slug)</label>
              <input id="cat-id-novo" name="id" value={campos.id} onChange={mudar} placeholder="ex: copa-do-mundo" />
            </div>
            <div className="campo">
              <label htmlFor="cat-nome-novo">Nome</label>
              <input id="cat-nome-novo" name="nome" value={campos.nome} onChange={mudar} placeholder="ex: Copa do Mundo" />
            </div>
          </div>
          <Erro>{erro}</Erro>
          <div className="acoes">
            <button type="submit" className="botao">Criar categoria</button>
            <button type="button" className="botao secundario" onClick={fechar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="admin-tabela">
        <div className="admin-tabela-cabecalho admin-tabela-cab-cat">
          <span>Identificador</span>
          <span>Nome</span>
          <span>Produtos</span>
          <span />
        </div>

        {banco.categorias.map((cat) => {
          const nProdutos = usoPorCategoria(cat.id)
          return (
            <div key={cat.id}>
              <div className="admin-linha admin-linha-cat">
                <code className="admin-id">{cat.id}</code>
                <span>{cat.nome}</span>
                <span>{nProdutos} produto{nProdutos !== 1 ? 's' : ''}</span>
                <div className="admin-acoes">
                  <button
                    className="icone-link"
                    title="Editar categoria"
                    onClick={() => formAberto === cat.id ? fechar() : abrirEditar(cat)}
                  >
                    <Icone nome="lapis" tamanho={17} />
                  </button>
                  <button
                    className="icone-link"
                    title="Excluir categoria"
                    onClick={() => { setConfirmar(cat.id); setFormAberto(null); setErro('') }}
                  >
                    <Icone nome="lixeira" tamanho={17} />
                  </button>
                </div>
              </div>

              {formAberto === cat.id && (
                <form className="form-admin form-admin-bloco" onSubmit={(e) => salvarEdicao(cat.id, e)} noValidate>
                  <h2 className="form-admin-titulo">Editar categoria</h2>
                  <div className="form-linha">
                    <div className="campo">
                      <label>Identificador</label>
                      <input value={cat.id} disabled />
                    </div>
                    <div className="campo">
                      <label htmlFor={`cat-nome-${cat.id}`}>Nome</label>
                      <input id={`cat-nome-${cat.id}`} name="nome" value={campos.nome} onChange={mudar} />
                    </div>
                  </div>
                  <Erro>{erro}</Erro>
                  <div className="acoes">
                    <button type="submit" className="botao">Salvar</button>
                    <button type="button" className="botao secundario" onClick={fechar}>Cancelar</button>
                  </div>
                </form>
              )}

              {confirmar === cat.id && (
                <div className="confirmacao-exclusao">
                  <strong>Excluir a categoria &ldquo;{cat.nome}&rdquo;?</strong>
                  {nProdutos > 0 && (
                    <p className="suave">
                      Há {nProdutos} produto{nProdutos !== 1 ? 's' : ''} nesta categoria. Reclassifique-{nProdutos !== 1 ? 'os' : 'o'} antes de excluir.
                    </p>
                  )}
                  <Erro>{erro}</Erro>
                  <div className="acoes">
                    <button className="botao" onClick={() => excluir(cat.id)} disabled={nProdutos > 0}>
                      Confirmar exclusão
                    </button>
                    <button className="botao secundario" onClick={() => { setConfirmar(null); setErro('') }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {!banco.categorias.length && (
          <p className="admin-vazio">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  )
}
