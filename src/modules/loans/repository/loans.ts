import { connectToDatabase } from "@/lib/mongodb";
import { LoanModel } from "@/lib/models/loans";

export type Loan = any;
export type CreateLoanInput = any;
export type UpdateLoanInput = Partial<Omit<CreateLoanInput, "id" | "userId">>;

export type LoanFilters = {
  userId: string;
  direction?: "lent" | "borrowed";
  status?: string;
  connectionId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  includeArchived?: boolean;
};

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createLoan(input: CreateLoanInput) {
  await connectToDatabase();
  const doc = await LoanModel.create(input);
  return toPlain(doc);
}

export async function getLoans(filters: LoanFilters) {
  await connectToDatabase();
  const filter: any = { userId: filters.userId, deletedAt: null };

  if (!filters.includeArchived) {
    filter.archivedAt = null;
  }
  if (filters.direction) filter.direction = filters.direction;
  if (filters.status) filter.status = filters.status;
  if (filters.connectionId) filter.connectionId = filters.connectionId;
  if (filters.startDate || filters.endDate) {
    filter.loanDate = {};
    if (filters.startDate) filter.loanDate.$gte = filters.startDate;
    if (filters.endDate) filter.loanDate.$lte = filters.endDate;
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filter.$or = [
      { purpose: { $regex: term, $options: "i" } },
      { notes: { $regex: term, $options: "i" } },
    ];
  }

  let sort: any = { createdAt: -1 };
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "amount":
      case "amount_high":
        sort = { principalAmount: -1 };
        break;
      case "amount_low":
        sort = { principalAmount: 1 };
        break;
      case "due_date":
      case "due_soon":
        sort = { dueDate: 1 };
        break;
      case "loan_date":
      case "newest":
        sort = { loanDate: -1 };
        break;
      case "oldest":
        sort = { loanDate: 1 };
        break;
    }
  }

  const docs = await LoanModel.find(filter)
    .sort({ isPinned: -1, ...sort })
    .skip(filters.offset ?? 0)
    .limit(filters.limit ?? 50)
    .lean();
  return toPlainArray(docs);
}

export async function getLoanById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await LoanModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function updateLoan(id: string, userId: string, input: UpdateLoanInput) {
  await connectToDatabase();
  const doc = await LoanModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteLoan(id: string, userId: string) {
  await connectToDatabase();
  const doc = await LoanModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getLoansByConnectionId(connectionId: string, userId: string) {
  await connectToDatabase();
  const docs = await LoanModel.find({
    userId,
    connectionId,
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}
