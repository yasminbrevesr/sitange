// Contas de cliente. O site é estático (GitHub Pages) e ainda não tem onde guardar contas:
// quando a plataforma de e-commerce for escolhida (Shopify, Nuvemshop, etc.), ligue aqui a API dela.
// Nunca guardar senha no navegador (localStorage/cookies legíveis).

export type SignInInput = { email: string; password: string };
export type SignUpInput = { name: string; email: string; password: string; marketingConsent: boolean };

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Contas de cliente ainda não estão ativas.");
  }
}

export const AUTH_ENABLED = false; // [COLOCAR AQUI] true quando houver integração de contas

export async function signIn(_input: SignInInput): Promise<void> {
  throw new AuthNotConfiguredError();
}

export async function signUp(_input: SignUpInput): Promise<void> {
  throw new AuthNotConfiguredError();
}
