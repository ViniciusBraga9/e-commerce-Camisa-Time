import { Link } from 'react-router-dom'
import Icone from './Icone'

export function Erro({ children }) {
  return children ? (
    <p className="alerta" role="alert">
      {children}
    </p>
  ) : null
}

export function Estado({
  titulo,
  texto,
  para = '/produtos',
  acao = 'Explorar catálogo',
  icone = 'sacola',
}) {
  return (
    <div className="estado">
      <span className="estado-icone">
        <Icone nome={icone} tamanho={28} />
      </span>
      <h2>{titulo}</h2>
      <p>{texto}</p>
      <Link className="botao" to={para}>
        {acao}
        <Icone nome="seta" />
      </Link>
    </div>
  )
}

export function Caminho({ atual, anteriores = [] }) {
  return (
    <nav className="caminho" aria-label="Caminho da página">
      <Link to="/">Início</Link>
      {anteriores.map((a) => (
        <span key={a.para}>
          <i aria-hidden="true">/</i>
          <Link to={a.para}>{a.nome}</Link>
        </span>
      ))}
      <i aria-hidden="true">/</i>
      <span aria-current="page">{atual}</span>
    </nav>
  )
}

export function Campo({ nome, rotulo, valor, mudar, erro, tipo = 'text', ...opcoes }) {
  return (
    <div className="campo">
      <label htmlFor={nome}>{rotulo}</label>
      <input
        id={nome}
        name={nome}
        type={tipo}
        value={valor}
        onChange={(evento) => mudar(nome, evento.target.value)}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? nome + '-erro' : undefined}
        {...opcoes}
      />
      {erro && (
        <small id={nome + '-erro'} role="alert">
          {erro}
        </small>
      )}
    </div>
  )
}

export function Quantidade({ valor, maximo, mudar, nome = 'Quantidade' }) {
  return (
    <div className="contador" role="group" aria-label={nome}>
      <button
        type="button"
        aria-label={'Diminuir ' + nome.toLowerCase()}
        disabled={valor <= 1}
        onClick={() => mudar(valor - 1)}
      >
        <Icone nome="menos" tamanho={14} />
      </button>
      <span aria-live="polite">{valor}</span>
      <button
        type="button"
        aria-label={'Aumentar ' + nome.toLowerCase()}
        disabled={valor >= maximo}
        onClick={() => mudar(valor + 1)}
      >
        <Icone nome="mais" tamanho={14} />
      </button>
    </div>
  )
}
