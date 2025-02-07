export interface IToken {
  token: string
}

export interface IUser {
  name: string | null;
  email: string;
  password: string;
  tokens: IToken[];
}
