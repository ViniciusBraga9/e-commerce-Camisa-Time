import { useState } from 'react'
import { useLoja } from '../../context/LojaContext'
import { Campo, Erro } from '../../components/Interface'
import { esperar, normalizar } from '../../services/banco'
import {
  excluirCategoria,
  salvarCategoria,
  validarCategoria,
} from '../../services/administracao'
import Paginacao from '../../components/Paginacao'

const VAZIO = { nome: '', descricao: '' }

export default function CategoriasAdmin() {
  const { banco, alterar } = useLoja()
  const [form, setForm] = useState(VAZIO)
  const [editando, setEditando] = useState(null)
  const [exclusao, setExclusao] = useState(null)
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const filtradas = banco.categorias.filter((item) =>
    normalizar(item.nome).includes(normalizar(busca)),
  )
  const paginas = Math.max(1, Math.ceil(filtradas.length / 6))
  const atual = Math.min(pagina, paginas)

  function mudar(nome, valor) {
    setForm({ ...form, [nome]: valor })
    setErros({ ...erros, [nome]: '' })
    setErro('')
  }

  function limpar() {
    setForm(VAZIO)
    setEditando(null)
    setErros({})
    setErro('')
  }

  function editar(categoria) {
    setEditando(categoria.id)
    setForm({ nome: categoria.nome, descricao: categoria.descricao || '' })
    setErros({})
    setErro('')
    setAviso('')
    setExclusao(null)
    document.getElementById('nome')?.focus()
  }

  function prepararExclusao(categoria) {
    setExclusao(categoria)
    setErro('')
    setAviso('')
    window.scrollTo(0, 0)
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return
    const novos = validarCategoria(form, banco.categorias, editando)
    setErros(novos)
    if (Object.keys(novos).length) {
      document.getElementById(Object.keys(novos)[0])?.focus()
      return
    }
    setSalvando(true)
    setErro('')
    setAviso('')
    try {
      await esperar()
      alterar((dados) => salvarCategoria(dados, form, editando))
      setAviso(editando ? 'Categoria atualizada.' : 'Categoria cadastrada.')
      limpar()
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setSalvando(false)
    }
  }

  async function remover() {
    if (salvando) return
    setSalvando(true)
    setErro('')
    setAviso('')
    try {
      await esperar()
      alterar((dados) => excluirCategoria(dados, exclusao.id))
      if (editando === exclusao.id) limpar()
      setExclusao(null)
      setAviso('Categoria excluída.')
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
          <h1>Categorias</h1>
          <p className="suave">Organize as camisas por liga ou seleção.</p>
        </div>
      </div>
      {aviso && (
        <p className="sucesso" role="status">
          {aviso}
        </p>
      )}
      <Erro>{erro}</Erro>
      {exclusao && (
        <div className="admin-confirmacao" role="region" aria-label="Confirmar exclusão">
          <strong>Excluir a categoria {exclusao.nome}?</strong>
          <p>A exclusão só é permitida quando não há camisas vinculadas.</p>
          <div className="acoes">
            <button
              className="botao secundario"
              disabled={salvando}
              onClick={() => {
                setExclusao(null)
                setErro('')
              }}
            >
              Manter categoria
            </button>
            <button className="botao perigo" disabled={salvando} onClick={remover}>
              {salvando ? 'Excluindo…' : 'Confirmar exclusão'}
            </button>
          </div>
        </div>
      )}
      <div className="admin-categorias">
        <section>
          <div className="campo">
            <label htmlFor="buscar-categoria">Buscar categoria</label>
            <input
              id="buscar-categoria"
              type="search"
              value={busca}
              onChange={(evento) => {
                setBusca(evento.target.value)
                setPagina(1)
              }}
              placeholder="Nome da liga ou categoria"
            />
          </div>
          <p className="admin-contagem" role="status">
            {filtradas.length} categoria(s) encontrada(s).
          </p>
          <div className="admin-lista-categorias">
            {!filtradas.length && (
              <p className="admin-painel suave">Nenhuma categoria encontrada.</p>
            )}
            {filtradas.slice((atual - 1) * 6, atual * 6).map((categoria) => (
              <article key={categoria.id}>
                <div>
                  <h2>{categoria.nome}</h2>
                  <p>{categoria.descricao || 'Sem descrição cadastrada.'}</p>
                  <small>
                    {
                      banco.produtos.filter((produto) => produto.liga === categoria.id)
                        .length
                    }{' '}
                    camisa(s) vinculada(s)
                  </small>
                </div>
                <div className="admin-acoes">
                  <button
                    className="link"
                    disabled={salvando}
                    aria-label={'Editar ' + categoria.nome}
                    onClick={() => editar(categoria)}
                  >
                    Editar
                  </button>
                  <button
                    className="link texto-perigo"
                    disabled={salvando}
                    aria-label={'Excluir ' + categoria.nome}
                    onClick={() => prepararExclusao(categoria)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
          <Paginacao pagina={atual} paginas={paginas} mudar={setPagina} />
        </section>
        <section className="admin-painel">
          <h2>{editando ? 'Editar categoria' : 'Nova categoria'}</h2>
          <form className="formulario" noValidate onSubmit={salvar}>
            <Campo
              nome="nome"
              rotulo="Nome da categoria"
              valor={form.nome}
              mudar={mudar}
              erro={erros.nome}
              maxLength={60}
              disabled={salvando}
              required
            />
            <div className="campo">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={form.descricao}
                onChange={(evento) => mudar('descricao', evento.target.value)}
                rows="4"
                maxLength={300}
                disabled={salvando}
                aria-invalid={Boolean(erros.descricao)}
                aria-describedby={erros.descricao ? 'descricao-erro' : undefined}
                required
              />
              {erros.descricao && (
                <small id="descricao-erro" role="alert">
                  {erros.descricao}
                </small>
              )}
            </div>
            <div className="acoes">
              <button className="botao botao-laranja" disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar categoria'}
              </button>
              {editando && (
                <button
                  className="link"
                  type="button"
                  disabled={salvando}
                  onClick={limpar}
                >
                  Cancelar edição
                </button>
              )}
            </div>
            {salvando && (
              <span role="status" className="suave">
                Salvando alteração…
              </span>
            )}
          </form>
        </section>
      </div>
    </>
  )
}
