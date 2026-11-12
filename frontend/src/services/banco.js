import { administradorDemo, dadosIniciais } from '../data/demonstracao'

export const CHAVE = 'camisa10.loja.v1'

export function lerBanco() {
  const texto = localStorage.getItem(CHAVE)
  const banco = texto ? JSON.parse(texto) : structuredClone(dadosIniciais())
  // Acrescenta o administrador sem apagar os dados da versão anterior.
  const existeAdmin = banco.usuarios.some(
    (usuario) =>
      usuario.id === administradorDemo.id || usuario.email === administradorDemo.email,
  )
  if (!existeAdmin) banco.usuarios.push({ ...administradorDemo })
  return banco
}

export function gravarBanco(banco) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco))
  } catch {
    throw new Error('O navegador não conseguiu salvar. Libere espaço e tente novamente.')
  }
}

export function novoId() {
  return crypto.getRandomValues(new Uint32Array(3)).join('-')
}

export function esperar() {
  return new Promise((resolver) => setTimeout(resolver, 220))
}

export function usuarioAtual(banco) {
  const sessao = banco.sessao
  if (!sessao || sessao.expiraEm <= Date.now()) return null
  return banco.usuarios.find((usuario) => usuario.id === sessao.id) || null
}

export function exigirCliente(banco) {
  const cliente = usuarioAtual(banco)
  if (!cliente || cliente.perfil !== 'cliente')
    throw new Error('Entre novamente para continuar.')
  return cliente
}

export const moeda = (centavos) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dataCurta = (valor) => new Date(valor).toLocaleDateString('pt-BR')

export function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export async function listarProdutos(produtos, filtros) {
  await esperar()
  const busca = normalizar(filtros.get('q') || '')
  const liga = filtros.get('liga')
  const modelo = filtros.get('modelo')
  const preco = filtros.get('preco')

  return produtos.filter((produto) => {
    const termos = normalizar([produto.time, produto.modelo, produto.temporada].join(' '))
    if (busca && !termos.includes(busca)) return false
    if (liga && produto.liga !== liga) return false
    if (modelo && produto.modelo !== modelo) return false
    if (preco === 'ate200' && produto.preco > 20000) return false
    if (preco === '200a250' && (produto.preco <= 20000 || produto.preco > 25000))
      return false
    if (preco === 'acima250' && produto.preco <= 25000) return false
    return true
  })
}
