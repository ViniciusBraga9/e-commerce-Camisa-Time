export const enderecoVazio = {
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
}

export const estados = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

export function validarEndereco(dados) {
  const erros = {}
  if (!/^\d{5}-?\d{3}$/.test(dados.cep.trim())) erros.cep = 'Informe os 8 dígitos do CEP.'
  if (!dados.rua.trim()) erros.rua = 'Informe a rua ou avenida.'
  if (!dados.numero.trim()) erros.numero = 'Informe o número ou use S/N.'
  if (!dados.bairro.trim()) erros.bairro = 'Informe o bairro.'
  if (!dados.cidade.trim()) erros.cidade = 'Informe a cidade.'
  if (!estados.includes(dados.uf)) erros.uf = 'Selecione o estado.'
  return erros
}
