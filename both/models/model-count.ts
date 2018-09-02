export interface Count {
  subscription: string;
  createdBy?: string;
  count: number;
}

export const COUNT_PUBLIC = {
  subscription: 1,
  count: 1
};
