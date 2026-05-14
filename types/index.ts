export type MailStatus =
  | "draft"
  | "ready_to_send"
  | "sent"
  | "answered"
  | "scheduled";

export type HistoryItem = {
  id: string;

  institutionName?: string;
  institutionEmail?: string;
  institutionCategory?: string;

  keywords: string;

  content: string;

  subject?: string;

  answer?: string;

  createdAt: string;

  updatedAt?: string;

  status: MailStatus;
};
