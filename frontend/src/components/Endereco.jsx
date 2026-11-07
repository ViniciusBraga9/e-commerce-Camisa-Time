import { Campo } from './Interface'
import { estados } from '../services/endereco'

export function EnderecoForm({ dados, mudar, erros }) {
  const campos = [
    ['cep', 'CEP', 'postal-code'],
    ['rua', 'Rua ou avenida', 'address-line1'],
    ['numero', 'Número'],
    ['complemento', 'Complemento (opcional)', 'address-line2'],
    ['bairro', 'Bairro'],
    ['cidade', 'Cidade', 'address-level2'],
  ]
  return (
    <div className="endereco-campos">
      {campos.map(([nome, rotulo, completar]) => (
        <Campo
          key={nome}
          nome={nome}
          rotulo={rotulo}
          valor={dados[nome]}
          mudar={mudar}
          erro={erros[nome]}
          autoComplete={completar}
          inputMode={nome === 'cep' ? 'numeric' : undefined}
          maxLength={nome === 'cep' ? 9 : 100}
        />
      ))}
      <div className="campo">
        <label htmlFor="uf">Estado</label>
        <select
          id="uf"
          value={dados.uf}
          onChange={(evento) => mudar('uf', evento.target.value)}
          aria-invalid={Boolean(erros.uf)}
          aria-describedby={erros.uf ? 'uf-erro' : undefined}
        >
          <option value="">Selecione a UF</option>
          {estados.map((uf) => (
            <option key={uf}>{uf}</option>
          ))}
        </select>
        {erros.uf && (
          <small role="alert" id="uf-erro">
            {erros.uf}
          </small>
        )}
      </div>
    </div>
  )
}

export function EnderecoTexto({ dados }) {
  return (
    <address>
      {dados.rua}, {dados.numero}
      {dados.complemento && ' · ' + dados.complemento}
      <br />
      {dados.bairro} · {dados.cidade}/{dados.uf}
      <br />
      CEP {dados.cep}
    </address>
  )
}
