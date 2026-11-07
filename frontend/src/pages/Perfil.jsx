import { useState } from 'react'
import { useLoja } from '../context/LojaContext'
import { editarPerfil, emailValido } from '../services/contas'
import { enderecoVazio, validarEndereco } from '../services/endereco'
import { Campo, Caminho, Erro } from '../components/Interface'
import { EnderecoForm } from '../components/Endereco'
import MenuCliente from '../components/MenuCliente'

export default function Perfil() {
  const { usuario, alterar } = useLoja()
  const [form, setForm] = useState({ nome: usuario.nome, email: usuario.email })
  const [endereco, setEndereco] = useState(usuario.endereco || enderecoVazio)
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  function mudar(campo, valor) {
    if (campo in form) setForm({ ...form, [campo]: valor })
    else setEndereco({ ...endereco, [campo]: valor })
    setErros({ ...erros, [campo]: '' })
    setAviso('')
  }
  function salvar(evento) {
    evento.preventDefault()
    const temEndereco = Object.values(endereco).some((v) => v.trim())
    const novos = {}
    if (form.nome.trim().length < 2) novos.nome = 'Informe seu nome.'
    if (!emailValido(form.email)) novos.email = 'Informe um e-mail válido.'
    if (temEndereco) Object.assign(novos, validarEndereco(endereco))
    setErros(novos)
    if (Object.keys(novos).length) {
      document.getElementById(Object.keys(novos)[0])?.focus()
      return
    }
    try {
      alterar((bancoAtual) =>
        editarPerfil(bancoAtual, form.nome, form.email, temEndereco ? endereco : null),
      )
      setErro('')
      setAviso('Seu perfil foi atualizado.')
    } catch (falha) {
      setErro(falha.message)
    }
  }
  return (
    <div className="container pagina">
      <Caminho atual="Meu perfil" />
      <h1>Meu perfil</h1>
      <MenuCliente />
      <form onSubmit={salvar} noValidate className="perfil-form blocos">
        <fieldset className="bloco-form">
          <legend>Dados da conta</legend>
          <div className="endereco-campos">
            <Campo
              nome="nome"
              rotulo="Nome"
              valor={form.nome}
              mudar={mudar}
              erro={erros.nome}
              autoComplete="name"
              required
            />
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
          </div>
        </fieldset>
        <fieldset className="bloco-form">
          <legend>Endereço de entrega</legend>
          <p className="suave">Opcional. Preencha para usar este endereço na próxima compra.</p>
          <EnderecoForm dados={endereco} mudar={mudar} erros={erros} />
        </fieldset>
        <Erro>{erro}</Erro>
        {aviso && (
          <p role="status" className="sucesso">
            {aviso}
          </p>
        )}
        <div>
          <button className="botao botao-laranja">Salvar alterações</button>
        </div>
      </form>
    </div>
  )
}
