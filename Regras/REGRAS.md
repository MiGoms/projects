# ITC APP — REGRAS (Fase 1: Cadastro + Calendário + Check-in)

Escopo: cadastro de clientes, calendário de aulas e check-in, no estilo Nexfit.
Fora do escopo agora: desafios relâmpago, pontuação, gamificação, lista de espera, sistema de créditos.

Referência visual: pasta `Design/` (README.md + ITC App v2.dc.html). As telas são referência, não código para copiar.

## 1. Cadastro e acesso
- Cadastro: nome completo, e-mail, WhatsApp, senha.
- Validações: e-mail válido; senha com no mínimo 8 caracteres; WhatsApp no formato BR `(DD) 9 XXXX-XXXX`; nome obrigatório.
- Login por e-mail e senha. Perfil editável: nome, e-mail, WhatsApp, foto.
- Papéis: **aluno** e **administrador** (o ITC).

## 2. Aulas (cadastradas pelo administrador)
Cada aula tem: modalidade, professor, nível, local, início, fim e capacidade (máximo de alunos).
Modalidades iniciais: Surf, Trilha, Jiu-jitsu, Crossfit, Musculação, Yoga, Altinha.

## 3. Calendário (aluno)
- Mostra hoje + próximos 6 dias; lista as aulas do dia selecionado.
- Cada aula exibe vagas restantes: "N vagas", "1 vaga" ou "Lotada".

## 4. Check-in
- **Janela:** abre 24h antes do início da aula e fecha 20 minutos antes do início.
- Fora da janela, o botão de check-in fica indisponível.
- **Capacidade:** nunca aceitar mais alunos que a capacidade. Se dois alunos disputarem a última vaga ao mesmo tempo, só um entra; o outro recebe "Lotada" (erro 409). Validar no servidor, em transação.
- Aula cheia mostra apenas "Lotada". **Não há lista de espera** nesta versão.
- Um aluno só pode ter um check-in ativo por aula.

## 5. Cancelamento
- O aluno pode cancelar o check-in **até o início da aula**.
- Cancelamento libera a vaga imediatamente.
- Check-in cancelado **não consome crédito** do cliente.
- Após o início da aula, não é possível cancelar.

## 6. Tela de Boas-vindas
- Aparece **sempre que o aluno abre o app**.
- Manter o texto do manifesto atual (README, tela 2).
- O manifesto poderá ser trocado mensalmente no futuro (não implementar agora; só deixar o texto fácil de trocar).

## 7. Controle de alunos (administrador)
- Ver, por aula, quem confirmou check-in e quantas vagas restam.

## 8. Pontos em aberto (não implementar até serem definidos)
- Sistema de créditos: a regra "cancelamento não consome crédito" pressupõe que existam créditos/planos. Como o crédito é comprado, consumido e renovado ainda não foi definido.
- Assinaturas por níveis e aulas avulsas.
