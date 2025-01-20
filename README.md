# ContaPlus 💰

Uma aplicação web elegante para gerenciar e receber lembretes de contas a pagar, desenvolvida com Node.js e design inspirado na Apple.

![ContaPlus](https://github.com/patriciobrito/contaplus/raw/main/preview.png)

## 🌟 Funcionalidades

- 📝 Cadastro e gerenciamento de contas
- ⏰ Alertas de vencimento automáticos
- 💶 Resumo total das contas em euros
- 🌓 Tema claro/escuro
- 🔒 Sistema de autenticação
- 📱 Design responsivo

## 🚀 Tecnologias

- **Frontend:**
  - HTML5
  - CSS3 (com variáveis CSS)
  - JavaScript (Vanilla)
  - Lucide Icons
  - SF Pro Display (Apple Font)

- **Backend:**
  - Node.js
  - Express.js
  - JSON Web Tokens (JWT)
  - Nodemailer

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/contaplus.git
cd contaplus
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
npm run dev
```

5. Acesse a aplicação em `http://localhost:3000`

## 💡 Como Usar

1. **Criar uma Conta:**
   - Faça o registro com email e senha
   - Faça login no sistema

2. **Adicionar Contas:**
   - Clique no formulário de nova conta
   - Preencha nome, valor, data de vencimento e descrição
   - Clique em "Adicionar"

3. **Gerenciar Contas:**
   - Edite usando o botão de lápis
   - Exclua usando o botão de lixeira
   - Veja alertas de vencimento próximo (5 dias)

4. **Recursos Adicionais:**
   - Alterne entre tema claro/escuro
   - Veja o resumo total das contas
   - Consulte a ajuda para mais informações

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas
- Proteção contra XSS
- Validação de dados
- Sessões seguras

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Créditos

Desenvolvido por Patrício Brito © 2025

---

**Nota:** Este é um projeto em constante evolução. Sugestões e contribuições são sempre bem-vindas!
