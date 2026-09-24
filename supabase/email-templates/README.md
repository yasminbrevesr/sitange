# Modelos de e-mail (Supabase Auth)

Onde colar: Supabase → **Authentication → Emails → Templates**.

| Modelo no Supabase | Assunto (Subject) | Corpo (Message body) |
|---|---|---|
| Confirm signup | `Confirme seu e-mail · TANGÈ` | `confirmar-cadastro.html` |
| Reset password | `Crie uma nova senha · TANGÈ` | `nova-senha.html` |

O remetente ("Supabase Auth") e o rodapé do Supabase só mudam com SMTP próprio:
**Authentication → Emails → SMTP Settings** (Sender name: `TANGÈ`).
