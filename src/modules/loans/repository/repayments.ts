import { connectToDatabase } from "@/lib/mongodb";
import { LoanRepaymentModel } from "@/lib/models/loans";

export type Repayment = any;
export type CreateRepaymentInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createRepayment(input: CreateRepaymentInput) {
  await connectToDatabase();
  const doc = await LoanRepaymentModel.create(input);
  return toPlain(doc);
}

export async function getRepaymentsByLoanId(loanId: string) {
  await connectToDatabase();
  const docs = await LoanRepaymentModel.find({ loanId })
    .sort({ date: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getTotalPaidForLoan(loanId: string): Promise<number> {
  await connectToDatabase();
  const [result] = await LoanRepaymentModel.aggregate([
    { $match: { loanId } },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
  ]);
  return Number(result?.total ?? 0);
}

export async function getRepaymentById(id: string) {
  await connectToDatabase();
  const doc = await LoanRepaymentModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function deleteRepayment(id: string) {
  await connectToDatabase();
  const doc = await LoanRepaymentModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}
