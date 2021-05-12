export interface IUser {
  self: boolean;
  userID: string;
  userName: string;
  hasNewMessages: boolean;
  connected: boolean;
  messages: { content: string; fromSelf: boolean }[];
}
