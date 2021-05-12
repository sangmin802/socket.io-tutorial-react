export interface IUser {
  self: boolean;
  userID: string;
  userName: string;
  hasNewMessages: number;
  connected: boolean;
  messages: { content: string; fromSelf: boolean }[];
}
