import { Link } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { moeda } from '../services/banco'
import Icone from './Icone'

export function Ligas({ ativa = '', selecionar }) {
  const { banco } = useLoja()
  return (
    <div className="ligas">
      {banco.categorias.map((liga) => {
        const conteudo = (
          <>
            <img src={'/ligas/' + liga.id + '.png'} alt="" />
            <span>{liga.nome}</span>
            <Icone nome={ativa === liga.id ? 'visto' : 'diagonal'} tamanho={16} />
          </>
        )
        return selecionar ? (
          <button
            key={liga.id}
            onClick={() => selecionar(ativa === liga.id ? '' : liga.id)}
            aria-pressed={ativa === liga.id}
          >
            {conteudo}
          </button>
        ) : (
          <Link key={liga.id} to={'/produtos?liga=' + liga.id}>
            {conteudo}
          </Link>
        )
      })}
    </div>
  )
}

export function ProdutoCard({ produto, liga }) {
  return (
    <Link className="produto-card" to={'/produtos/' + produto.id}>
      <div className="foto-card">
        <img
          src={produto.imagem}
          alt={'Camisa ' + produto.time + ', modelo ' + produto.modelo}
          loading="lazy"
        />
        {produto.modelo === 'Retrô' && <span className="selo-retro">Retrô</span>}
      </div>
      <div className="card-ficha">
        <small>{liga?.nome}</small>
        <h3>{produto.time}</h3>
        <span>
          {produto.modelo} · {produto.temporada}
        </span>
        <strong>{moeda(produto.preco)}</strong>
      </div>
      <span className="card-seta">
        <Icone nome="diagonal" tamanho={16} />
      </span>
    </Link>
  )
}

export function GradeProdutos({ produtos }) {
  const { banco } = useLoja()
  return (
    <div className="grade-produtos">
      {produtos.map((p) => (
        <ProdutoCard
          key={p.id}
          produto={p}
          liga={banco.categorias.find((l) => l.id === p.liga)}
        />
      ))}
    </div>
  )
}
