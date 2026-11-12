import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLoja } from '../../context/LojaContext'
import { esperar, moeda, normalizar } from '../../services/banco'
import { excluirProduto } from '../../services/administracao'
import { Erro } from '../../components/Interface'
import Paginacao from '../../components/Paginacao'
import Icone from '../../components/Icone'

const POR_PAGINA = 6

export default function ProdutosAdmin() {
  const { banco, alterar } = useLoja()
  const { state } = useLocation()
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(1)
  const [exclusao, setExclusao] = useState(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState(state?.aviso || '')
  const [salvando, setSalvando] = useState(false)
  const filtrados = banco.produtos.filter((produto) => {
    const texto = normalizar(
      produto.time + ' ' + produto.modelo + ' ' + produto.temporada,
    )
    return texto.includes(normalizar(busca)) && (!categoria || produto.liga === categoria)
  })
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const atual = Math.min(pagina, paginas)
  const visiveis = filtrados.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA)

  function prepararExclusao(produto) {
    setExclusao(produto)
    setErro('')
    setAviso('')
    window.scrollTo(0, 0)
  }

  function limparFiltros() {
    setBusca('')
    setCategoria('')
    setPagina(1)
  }

  async function remover() {
    if (salvando) return
    setSalvando(true)
    setErro('')
    setAviso('')
    try {
      await esperar()
      alterar((dados) => excluirProduto(dados, exclusao.id))
      setExclusao(null)
      setAviso('Camisa excluída. O catálogo foi atualizado.')
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
          <h1>Produtos</h1>
          <p className="suave">Camisas, preços e estoque por tamanho.</p>
        </div>
        <Link className="botao botao-laranja" to="/admin/produtos/novo">
          <Icone nome="mais" /> Nova camisa
        </Link>
      </div>
      {aviso && (
        <p className="sucesso" role="status">
          {aviso}
        </p>
      )}
      <Erro>{erro}</Erro>
      {exclusao && (
        <div className="admin-confirmacao" role="region" aria-label="Confirmar exclusão">
          <strong>
            Excluir {exclusao.time} · {exclusao.modelo}?
          </strong>
          <p>
            A camisa sairá do catálogo e do carrinho. O histórico dos pedidos será
            mantido.
          </p>
          <div className="acoes">
            <button
              className="botao secundario"
              disabled={salvando}
              onClick={() => {
                setExclusao(null)
                setErro('')
              }}
            >
              Manter camisa
            </button>
            <button className="botao perigo" disabled={salvando} onClick={remover}>
              {salvando ? 'Excluindo…' : 'Confirmar exclusão'}
            </button>
          </div>
        </div>
      )}
      <div className="admin-filtros">
        <div className="campo">
          <label htmlFor="buscar-produto">Buscar camisa</label>
          <input
            id="buscar-produto"
            type="search"
            placeholder="Time, modelo ou temporada"
            value={busca}
            onChange={(evento) => {
              setBusca(evento.target.value)
              setPagina(1)
            }}
          />
        </div>
        <div className="campo">
          <label htmlFor="filtro-categoria">Categoria</label>
          <select
            id="filtro-categoria"
            value={categoria}
            onChange={(evento) => {
              setCategoria(evento.target.value)
              setPagina(1)
            }}
          >
            <option value="">Todas as categorias</option>
            {banco.categorias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="admin-contagem" role="status">
        {filtrados.length} camisa(s) encontrada(s).
      </p>
      {filtrados.length === 0 ? (
        <div className="estado">
          <h2>Nenhuma camisa encontrada</h2>
          <p>Cadastre uma camisa ou ajuste os filtros.</p>
          <button className="botao secundario" onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>
      ) : (
        <div
          className="admin-tabela-scroll"
          tabIndex="0"
          role="region"
          aria-label="Lista de produtos"
        >
          <table className="admin-tabela">
            <caption className="somente-leitor">
              Camisas cadastradas e ações disponíveis
            </caption>
            <thead>
              <tr>
                <th scope="col">Camisa</th>
                <th scope="col">Categoria</th>
                <th scope="col">Preço</th>
                <th scope="col">Estoque</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((produto) => (
                <tr key={produto.id}>
                  <td>
                    <div className="admin-produto">
                      <img src={produto.imagem} alt="" />
                      <div>
                        <strong>{produto.time}</strong>
                        <small>
                          {produto.modelo} · {produto.temporada}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {banco.categorias.find((item) => item.id === produto.liga)?.nome}
                  </td>
                  <td className="sem-quebra">{moeda(produto.preco)}</td>
                  <td>
                    <strong>
                      {Object.values(produto.estoque).reduce(
                        (soma, valor) => soma + valor,
                        0,
                      )}{' '}
                      un.
                    </strong>
                    <small>
                      {Object.entries(produto.estoque)
                        .map(([tamanho, valor]) => tamanho + ': ' + valor)
                        .join(' · ')}
                    </small>
                  </td>
                  <td>
                    <div className="admin-acoes">
                      <Link
                        className="link"
                        to={'/produtos/' + produto.id}
                        aria-label={'Ver ' + produto.time}
                      >
                        Ver
                      </Link>
                      <Link
                        className="link"
                        to={'/admin/produtos/' + produto.id + '/editar'}
                        aria-label={'Editar ' + produto.time}
                      >
                        Editar
                      </Link>
                      <button
                        className="link texto-perigo"
                        disabled={salvando}
                        aria-label={'Excluir ' + produto.time}
                        onClick={() => prepararExclusao(produto)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginacao pagina={atual} paginas={paginas} mudar={setPagina} />
    </>
  )
}
