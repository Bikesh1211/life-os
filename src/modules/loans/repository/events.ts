import { connectToDatabase } from "@/lib/mongodb";
import { LoanEventModel } from "@/lib/models/loans";

export type LoanEvent = any;
export type CreateLoanEventInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createLoanEvent(input: CreateLoanEventInput) {
  await connectToDatabase();
  const doc = await LoanEventModel.create(input);
  return toPlain(doc);
}

export async function getEventsByLoanId(loanId: string) {
  await connectToDatabase();
  const docs = await LoanEventModel.find({ loanId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}
