import { hash, compare } from 'bcryptjs'
import { exigirCliente, novoId } from './banco'

export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

// Só a assinatura da senha de teste é salva no navegador.
export async function prepararCadastro(nome, email, senha) {
  return {
    id: novoId(),
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    perfil: 'cliente',
    assinatura: await hash(senha, 10),
    endereco: null,
  }
}

export function salvarCadastro(banco, novo) {
  if (banco.usuarios.some((conta) => conta.email === novo.email)) {
    throw new Error('Já existe uma conta com esse e-mail.')
  }
  banco.usuarios.push(novo)
}

export async function conferirLogin(banco, email, senha) {
  const usuario = banco.usuarios.find((conta) => conta.email === email.trim().toLowerCase())
  if (!usuario || !(await compare(senha, usuario.assinatura))) {
    throw new Error('E-mail ou senha incorretos.')
  }
  return usuario.id
}

export function editarPerfil(banco, nome, email, endereco) {
  const cliente = exigirCliente(banco)
  const novoEmail = email.trim().toLowerCase()
  if (banco.usuarios.some((conta) => conta.email === novoEmail && conta.id !== cliente.id)) {
    throw new Error('Esse e-mail já pertence a outra conta.')
  }
  cliente.nome = nome.trim()
  cliente.email = novoEmail
  cliente.endereco = endereco
}
