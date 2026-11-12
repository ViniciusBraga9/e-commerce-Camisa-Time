import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLoja } from '../context/LojaContext'
import { Campo, Erro } from '../components/Interface'
import Icone from '../components/Icone'
import { esperar, lerBanco } from '../services/banco'
import {
  conferirLogin,
  emailValido,
  prepararCadastro,
  salvarCadastro,
} from '../services/contas'

export default function Conta({ cadastro = false }) {
  const { state } = useLocation()
  const navegar = useNavigate()
  const { usuario, alterar } = useLoja()
  const [form, setForm] = useState({
    nome: '',
    email: state?.email || '',
    senha: '',
    confirmacao: '',
  })
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const voltar =
    state?.voltar?.startsWith('/') && !state.voltar.startsWith('//') ? state.voltar : ''
  const acessoAdmin = voltar.startsWith('/admin')

  // O administrador abre o painel. O cliente retoma a compra ou o perfil.
  function destinoDoUsuario(conta) {
    if (conta.perfil === 'admin') return acessoAdmin ? voltar : '/admin'
    return voltar || '/perfil'
  }

  if (usuario) return <Navigate to={destinoDoUsuario(usuario)} replace />

  function mudar(nome, valor) {
    setForm({ ...form, [nome]: valor })
    setErros({ ...erros, [nome]: '' })
    setErro('')
  }
  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return
    const novos = {}
    if (cadastro && form.nome.trim().length < 2)
      novos.nome = 'Digite seu nome, com pelo menos 2 letras.'
    if (!emailValido(form.email)) novos.email = 'Digite um e-mail válido.'
    if (!form.senha) novos.senha = 'Digite sua senha.'
    if (cadastro && form.senha.length < 6) novos.senha = 'Use pelo menos 6 caracteres.'
    if (cadastro && form.confirmacao !== form.senha)
      novos.confirmacao = 'As senhas precisam ser iguais.'
    setErros(novos)
    if (Object.keys(novos).length) {
      document.getElementById(Object.keys(novos)[0])?.focus()
      return
    }
    setErro('')
    setEnviando(true)
    try {
      await esperar()
      if (cadastro) {
        const novo = await prepararCadastro(form.nome, form.email, form.senha)
        alterar((bancoAtual) => salvarCadastro(bancoAtual, novo))
        navegar('/login', {
          replace: true,
          state: {
            voltar,
            email: novo.email,
            aviso: 'Conta criada. Entre para continuar.',
          },
        })
      } else {
        const id = await conferirLogin(lerBanco(), form.email, form.senha)
        alterar((bancoAtual) => {
          bancoAtual.sessao = { id, expiraEm: Date.now() + 8 * 60 * 60 * 1000 }
        })
        const conta = lerBanco().usuarios.find((item) => item.id === id)
        navegar(destinoDoUsuario(conta), { replace: true })
      }
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="container pagina conta-pagina">
      <div className="conta-arte" aria-hidden="true">
        <img src="/marca/embalagem.webp" alt="" />
      </div>
      <section className="conta-form">
        <span className="rotulo">
          {acessoAdmin ? 'Administração' : 'Área do cliente'}
        </span>
        <h1>{cadastro ? 'Criar conta' : 'Entrar'}</h1>
        <p className="suave">
          {cadastro
            ? 'Use dados fictícios para testar a loja.'
            : voltar === '/checkout'
              ? 'Seu carrinho está salvo. Entre para finalizar a compra.'
              : acessoAdmin
                ? 'Entre para gerenciar os produtos, categorias e pedidos.'
                : 'Acesse seus pedidos e os dados do seu perfil.'}
        </p>
        {state?.aviso && (
          <p role="status" className="sucesso">
            {state.aviso}
          </p>
        )}
        <form onSubmit={enviar} noValidate className="formulario">
          {cadastro && (
            <Campo
              nome="nome"
              rotulo="Nome"
              valor={form.nome}
              mudar={mudar}
              erro={erros.nome}
              autoComplete="name"
              maxLength={80}
              required
            />
          )}
          <Campo
            nome="email"
            rotulo="E-mail"
            tipo="email"
            valor={form.email}
            mudar={mudar}
            erro={erros.email}
            autoComplete="email"
            required
          />
          <Campo
            nome="senha"
            rotulo="Senha"
            tipo="password"
            valor={form.senha}
            mudar={mudar}
            erro={erros.senha}
            autoComplete={cadastro ? 'new-password' : 'current-password'}
            maxLength={150}
            required
          />
          {cadastro && (
            <Campo
              nome="confirmacao"
              rotulo="Confirme a senha"
              tipo="password"
              valor={form.confirmacao}
              mudar={mudar}
              erro={erros.confirmacao}
              autoComplete="new-password"
              required
            />
          )}
          <Erro>{erro}</Erro>
          <button className="botao botao-laranja larga" disabled={enviando}>
            {enviando ? 'Aguarde…' : cadastro ? 'Criar minha conta' : 'Entrar'}{' '}
            <Icone nome="seta" />
          </button>
        </form>
        {!acessoAdmin && (
          <p>
            {cadastro ? 'Já tem uma conta? ' : 'Primeira compra? '}
            <Link
              className="link"
              to={cadastro ? '/login' : '/cadastro'}
              state={{ voltar }}
            >
              {cadastro ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
        )}
        {!cadastro && (
          <button
            className="link teste"
            onClick={() => {
              setForm({
                ...form,
                email: acessoAdmin ? 'admin@camisa10.test' : 'cliente@camisa10.test',
                senha: acessoAdmin ? 'admin123' : 'camisa10',
              })
              setErro('')
              setErros({})
            }}
          >
            {acessoAdmin
              ? 'Preencher com o administrador de teste'
              : 'Preencher com a conta de teste'}
          </button>
        )}
      </section>
    </div>
  )
}
