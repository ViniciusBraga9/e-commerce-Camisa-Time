import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { listarProdutos } from '../services/banco'
import { Caminho, Erro } from '../components/Interface'
import { GradeProdutos, Ligas } from '../components/Vitrine'
import Icone from '../components/Icone'

const POR_PAGINA = 4

export default function Catalogo() {
  const { banco } = useLoja()
  const [params, setParams] = useSearchParams()
  const [consulta, setConsulta] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const busca = useRef(null)
  const resultados = useRef(null)
  const query = params.toString()
  const focar = params.get('buscar') === '1'

  useEffect(() => {
    let ativo = true
    listarProdutos(banco.produtos, new URLSearchParams(query))
      .then((itens) => {
        if (ativo) setConsulta({ query, itens, tentativa })
      })
      .catch(() => {
        if (ativo)
          setConsulta({ query, erro: 'Não foi possível carregar as camisas.', tentativa })
      })
    return () => {
      ativo = false
    }
  }, [banco.produtos, query, tentativa])

  useEffect(() => {
    if (focar) busca.current?.focus()
  }, [focar])

  function filtrar(campo, valor) {
    const novos = new URLSearchParams(params)
    novos.delete('buscar')
    if (campo !== 'pagina') novos.delete('pagina')
    if (valor) novos.set(campo, valor)
    else novos.delete(campo)
    setParams(novos, { replace: campo !== 'pagina' })
    if (campo === 'pagina') resultados.current?.scrollIntoView({ block: 'start' })
  }

  const carregando = consulta?.query !== query || consulta?.tentativa !== tentativa
  const itens = consulta?.itens || []
  const paginas = Math.max(1, Math.ceil(itens.length / POR_PAGINA))
  const pagina = Math.max(1, Math.min(Number.parseInt(params.get('pagina'), 10) || 1, paginas))
  const filtrosAtivos = ['q', 'modelo', 'preco', 'liga'].some((k) => params.get(k))
  const modelos = [...new Set(banco.produtos.map((p) => p.modelo))]

  function mostrarResultados() {
    if (carregando)
      return (
        <div className="carregando" aria-hidden="true">
          <span />
        </div>
      )

    if (consulta.erro)
      return (
        <>
          <Erro>{consulta.erro}</Erro>
          <button className="botao" onClick={() => setTentativa(tentativa + 1)}>
            Tentar novamente
          </button>
        </>
      )

    if (itens.length === 0)
      return (
        <div className="estado">
          <Icone nome="busca" tamanho={29} />
          <h2>Nenhuma camisa encontrada</h2>
          <p>Tente outro time ou ajuste os filtros.</p>
          <button className="botao" onClick={() => setParams({})}>
            Ver todas as camisas
          </button>
        </div>
      )

    return (
      <>
        <GradeProdutos produtos={itens.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)} />
        {paginas > 1 && (
          <nav className="paginacao" aria-label="Páginas do catálogo">
            <button
              disabled={pagina === 1}
              onClick={() => filtrar('pagina', pagina - 1)}
              aria-label="Página anterior"
            >
              <Icone nome="anterior" />
            </button>
            <span>
              Página {pagina} de {paginas}
            </span>
            <button
              disabled={pagina === paginas}
              onClick={() => filtrar('pagina', pagina + 1)}
              aria-label="Próxima página"
            >
              <Icone nome="proximo" />
            </button>
          </nav>
        )}
      </>
    )
  }

  return (
    <div className="container pagina catalogo">
      <Caminho atual="Catálogo" />
      <h1>Catálogo de camisas</h1>
      <Ligas ativa={params.get('liga')} selecionar={(valor) => filtrar('liga', valor)} />
      <div className="filtros">
        <div className="campo busca">
          <label htmlFor="busca">Buscar camisa</label>
          <div>
            <Icone nome="busca" />
            <input
              id="busca"
              ref={busca}
              type="search"
              placeholder="Time, seleção ou modelo"
              value={params.get('q') || ''}
              onChange={(evento) => filtrar('q', evento.target.value)}
            />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="modelo">Modelo</label>
          <select
            id="modelo"
            value={params.get('modelo') || ''}
            onChange={(evento) => filtrar('modelo', evento.target.value)}
          >
            <option value="">Todos os modelos</option>
            {modelos.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="faixa-preco">Preço</label>
          <select
            id="faixa-preco"
            value={params.get('preco') || ''}
            onChange={(evento) => filtrar('preco', evento.target.value)}
          >
            <option value="">Qualquer preço</option>
            <option value="ate200">Até R$ 200</option>
            <option value="200a250">Mais de R$ 200 até R$ 250</option>
            <option value="acima250">Acima de R$ 250</option>
          </select>
        </div>
      </div>
      <div className="resultado-linha" ref={resultados}>
        <span role="status">
          {carregando
            ? 'Buscando camisas…'
            : itens.length +
              (itens.length === 1 ? ' camisa encontrada' : ' camisas encontradas')}
        </span>
        {filtrosAtivos && (
          <button className="link" onClick={() => setParams({})}>
            Limpar filtros
          </button>
        )}
      </div>
      {mostrarResultados()}
    </div>
  )
}
