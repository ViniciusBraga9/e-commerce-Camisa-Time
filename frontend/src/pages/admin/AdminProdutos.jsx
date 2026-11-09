import { useState } from 'react'
import { useLoja } from '../../context/LojaContext'
import { moeda } from '../../services/banco'
import { criarProduto, editarProduto, excluirProduto } from '../../services/admin'
import { Caminho, Erro } from '../../components/Interface'
import Icone from '../../components/Icone'
import { NavLink } from 'react-router-dom'

const MODELOS = ['Titular', 'Visitante', 'Retrô', 'Casual']
const TAMANHOS = ['P', 'M', 'G', 'GG']

function camposVazios() {
  return { id: '', time: '', modelo: '', temporada: '', liga: '', preco: '', descricao: '', estoqueP: '0', estoqueM: '0', estoqueG: '0', estoqueGG: '0' }
}

function produtoParaCampos(p) {
  return {
    id: p.id,
    time: p.time,
    modelo: p.modelo,
    temporada: p.temporada,
    liga: p.liga,
    preco: (p.preco / 100).toFixed(2),
    descricao: p.descricao,
    estoqueP: String(p.estoque.P),
    estoqueM: String(p.estoque.M),
    estoqueG: String(p.estoque.G),
    estoqueGG: String(p.estoque.GG),
  }
}

function camposParaDados(campos) {
  return {
    id: campos.id,
    time: campos.time,
    modelo: campos.modelo,
    temporada: campos.temporada,
    liga: campos.liga,
    preco: Math.round(parseFloat(campos.preco) * 100),
    descricao: campos.descricao,
    estoque: {
      P: parseInt(campos.estoqueP, 10) || 0,
      M: parseInt(campos.estoqueM, 10) || 0,
      G: parseInt(campos.estoqueG, 10) || 0,
      GG: parseInt(campos.estoqueGG, 10) || 0,
    },
  }
}

function FormProduto({ inicial, categorias, onSalvar, onCancelar, novo }) {
  const [campos, setCampos] = useState(inicial)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function mudar(e) {
    setCampos((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function submeter(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      await onSalvar(camposParaDados(campos))
    } catch (falha) {
      setErro(falha.message)
      setSalvando(false)
    }
  }

  return (
    <form className="form-admin" onSubmit={submeter} noValidate>
      <div className="form-linha">
        <div className="campo">
          <label htmlFor="prod-id">Identificador (slug)</label>
          <input id="prod-id" name="id" value={campos.id} onChange={mudar} disabled={!novo} placeholder="ex: flamengo-2" />
        </div>
        <div className="campo">
          <label htmlFor="prod-time">Time</label>
          <input id="prod-time" name="time" value={campos.time} onChange={mudar} placeholder="ex: Flamengo" />
        </div>
        <div className="campo">
          <label htmlFor="prod-modelo">Modelo</label>
          <input id="prod-modelo" name="modelo" list="modelos-lista" value={campos.modelo} onChange={mudar} placeholder="ex: Titular" />
          <datalist id="modelos-lista">
            {MODELOS.map((m) => <option key={m} value={m} />)}
          </datalist>
        </div>
        <div className="campo">
          <label htmlFor="prod-temporada">Temporada</label>
          <input id="prod-temporada" name="temporada" value={campos.temporada} onChange={mudar} placeholder="ex: 2026" />
        </div>
      </div>
      <div className="form-linha">
        <div className="campo">
          <label htmlFor="prod-liga">Categoria</label>
          <select id="prod-liga" name="liga" value={campos.liga} onChange={mudar}>
            <option value="">— selecione —</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="prod-preco">Preço (R$)</label>
          <input id="prod-preco" name="preco" type="number" min="0" step="0.01" value={campos.preco} onChange={mudar} placeholder="249.90" />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="prod-descricao">Descrição</label>
        <textarea id="prod-descricao" name="descricao" rows={2} value={campos.descricao} onChange={mudar} />
      </div>
      <div className="form-estoque">
        <span className="rotulo">Estoque por tamanho</span>
        {TAMANHOS.map((tam) => (
          <div key={tam} className="campo campo-tam">
            <label htmlFor={`prod-est-${tam}`}>{tam}</label>
            <input id={`prod-est-${tam}`} name={`estoque${tam}`} type="number" min="0" step="1" value={campos[`estoque${tam}`]} onChange={mudar} />
          </div>
        ))}
      </div>
      <Erro>{erro}</Erro>
      <div className="acoes">
        <button type="submit" className="botao" disabled={salvando}>
          {novo ? 'Criar produto' : 'Salvar alterações'}
        </button>
        <button type="button" className="botao secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function AdminProdutos() {
  const { banco, alterar } = useLoja()
  const [formAberto, setFormAberto] = useState(null)
  const [confirmar, setConfirmar] = useState(null)
  const [erroExcluir, setErroExcluir] = useState('')

  function abrirNovo() {
    setFormAberto('novo')
    setConfirmar(null)
  }

  function abrirEditar(produto) {
    setFormAberto(produto.id)
    setConfirmar(null)
  }

  function fechar() {
    setFormAberto(null)
  }

  function salvarNovo(dados) {
    alterar((b) => criarProduto(b, dados))
    setFormAberto(null)
  }

  function salvarEdicao(id, dados) {
    alterar((b) => editarProduto(b, id, dados))
    setFormAberto(null)
  }

  function excluir(id) {
    setErroExcluir('')
    try {
      alterar((b) => excluirProduto(b, id))
      setConfirmar(null)
    } catch (falha) {
      setErroExcluir(falha.message)
    }
  }

  return (
    <div className="container pagina">
      <Caminho atual="Produtos" anteriores={[{ nome: 'Administração', para: '/admin' }]} />
      <div className="admin-topo">
        <h1>Produtos</h1>
        <nav className="admin-nav" aria-label="Áreas do painel">
          <NavLink to="/admin/produtos">Produtos</NavLink>
          <NavLink to="/admin/categorias">Categorias</NavLink>
          <NavLink to="/admin/pedidos">Pedidos</NavLink>
        </nav>
        {formAberto !== 'novo' && (
          <button className="botao" onClick={abrirNovo}>
            <Icone nome="mais" tamanho={16} />
            Novo produto
          </button>
        )}
      </div>

      {formAberto === 'novo' && (
        <div className="form-admin-bloco">
          <h2 className="form-admin-titulo">Novo produto</h2>
          <FormProduto
            inicial={camposVazios()}
            categorias={banco.categorias}
            onSalvar={salvarNovo}
            onCancelar={fechar}
            novo
          />
        </div>
      )}

      <div className="admin-tabela">
        <div className="admin-tabela-cabecalho">
          <span>Produto</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Estoque total</span>
          <span />
        </div>
        {banco.produtos.map((produto) => {
          const estoqueTotal = Object.values(produto.estoque).reduce((s, v) => s + v, 0)
          const cat = banco.categorias.find((c) => c.id === produto.liga)
          return (
            <div key={produto.id}>
              <div className="admin-linha">
                <div className="admin-produto-info">
                  <img src={produto.imagem} alt="" className="admin-thumb" />
                  <div>
                    <strong>{produto.time}</strong>
                    <small>{produto.modelo} · {produto.temporada}</small>
                  </div>
                </div>
                <span>{cat?.nome || produto.liga}</span>
                <span>{moeda(produto.preco)}</span>
                <span className={estoqueTotal === 0 ? 'admin-sem-estoque' : ''}>{estoqueTotal} un.</span>
                <div className="admin-acoes">
                  <button
                    className="icone-link"
                    title="Editar produto"
                    onClick={() => formAberto === produto.id ? fechar() : abrirEditar(produto)}
                  >
                    <Icone nome="lapis" tamanho={17} />
                  </button>
                  <button
                    className="icone-link"
                    title="Excluir produto"
                    onClick={() => { setConfirmar(produto.id); setFormAberto(null) }}
                  >
                    <Icone nome="lixeira" tamanho={17} />
                  </button>
                </div>
              </div>

              {formAberto === produto.id && (
                <div className="form-admin-bloco">
                  <h2 className="form-admin-titulo">Editar produto</h2>
                  <FormProduto
                    inicial={produtoParaCampos(produto)}
                    categorias={banco.categorias}
                    onSalvar={(dados) => salvarEdicao(produto.id, dados)}
                    onCancelar={fechar}
                    novo={false}
                  />
                </div>
              )}

              {confirmar === produto.id && (
                <div className="confirmacao-exclusao">
                  <strong>Excluir &ldquo;{produto.time} — {produto.modelo}&rdquo;?</strong>
                  <p className="suave">Esta ação não pode ser desfeita.</p>
                  <Erro>{erroExcluir}</Erro>
                  <div className="acoes">
                    <button className="botao" onClick={() => excluir(produto.id)}>
                      Confirmar exclusão
                    </button>
                    <button className="botao secundario" onClick={() => setConfirmar(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {!banco.produtos.length && (
          <p className="admin-vazio">Nenhum produto cadastrado.</p>
        )}
      </div>
    </div>
  )
}
