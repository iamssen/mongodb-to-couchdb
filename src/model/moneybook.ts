import { ObjectID } from 'mongodb';

export type MongoExpense = {
  _id: ObjectID;
  amount: number;
  category: string;
  currency: string;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CouchExpense = {
  amount: number;
  category: string;
  currency: string;
  date: number; // +Date
  description: string;
};

export type MongoIncome = {
  _id: ObjectID;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CouchEarning = {
  amount: number;
  category: string;
  description: string;
  date: number; // +Date
};
