import { Types, FilterQuery } from 'mongoose';
import { Expense, IExpense, ExpenseStatus } from '../models/expense.model';
import { EmployeeModel } from '../models/employee.model';
import { ApiError } from '../utils/apiResponse';
import { ExpensesQueryParams } from '../validations/expense.validation';
import { UserRole } from '../constants/enums';

export class ExpenseService {
  async createExpense(data: Partial<IExpense>, employeeId: string): Promise<IExpense> {
    const expense = new Expense({
      ...data,
      employee: employeeId,
      status: ExpenseStatus.PENDING_MANAGER
    });
    return await expense.save();
  }

  async getExpenses(baseFilter: FilterQuery<IExpense>, query: ExpensesQueryParams, role?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    
    const filter: FilterQuery<IExpense> = { ...baseFilter };
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      let matchedEmployeeIds: Types.ObjectId[] = [];
      
      if (role && role !== UserRole.EMPLOYEE) {
        const matchedEmployees = await EmployeeModel.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { empId: searchRegex }
          ],
          isDeleted: false
        }).lean();
        matchedEmployeeIds = matchedEmployees.map(e => e._id as Types.ObjectId);
      }

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        ...(matchedEmployeeIds.length > 0 ? [{ employee: { $in: matchedEmployeeIds } as any }] : [])
      ];
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('employee', 'empId firstName lastName email department')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Expense.countDocuments(filter)
    ]);

    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getExpenseById(id: string): Promise<IExpense> {
    const expense = await Expense.findById(id)
      .populate('employee', 'empId firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');
    
    if (!expense) {
      throw ApiError.notFound('Expense claim not found');
    }
    return expense;
  }

  async updateExpense(id: string, data: Partial<IExpense>, employeeId: string): Promise<IExpense> {
    const expense = await Expense.findOne({ _id: id, employee: employeeId });
    if (!expense) {
      throw ApiError.notFound('Expense claim not found or unauthorized');
    }
    if (expense.status !== ExpenseStatus.PENDING_MANAGER && expense.status !== ExpenseStatus.PENDING_FINANCE) {
      throw ApiError.badRequest('Only pending expenses can be updated');
    }
    
    Object.assign(expense, data);
    return await expense.save();
  }

  async updateExpenseStatus(id: string, status: ExpenseStatus, approverId: string, rejectionReason?: string): Promise<IExpense> {
    const expense = await Expense.findById(id);
    if (!expense) {
      throw ApiError.notFound('Expense claim not found');
    }
    
    if (status === ExpenseStatus.PENDING_FINANCE) {
      expense.managerApprovedBy = approverId as any;
    } else if (status === ExpenseStatus.APPROVED) {
      expense.financeApprovedBy = approverId as any;
      expense.approvedBy = approverId as any; // Legacy field
    } else if (status === ExpenseStatus.REJECTED) {
      // Could be rejected by manager or finance
      expense.approvedBy = approverId as any;
      if (rejectionReason) {
        expense.rejectionReason = rejectionReason;
      }
    }
    
    expense.status = status;
    return await expense.save();
  }

  async deleteExpense(id: string, employeeId: string): Promise<void> {
    const expense = await Expense.findOne({ _id: id, employee: employeeId });
    if (!expense) {
      throw ApiError.notFound('Expense claim not found or unauthorized');
    }
    if (expense.status !== ExpenseStatus.PENDING_MANAGER) {
      throw ApiError.badRequest('Only unapproved (Manager pending) expenses can be deleted');
    }
    await Expense.deleteOne({ _id: id });
  }
}

export const expenseService = new ExpenseService();
