import PostgresDataSource from "../data-source";
import { User } from "../models/User";
import { OTP } from "../models/OTP";
import { Customer } from "../models/Customer";
import { Plan } from "../models/Plan";
import { LastActionAt } from "../models/LastActionAt";

export const UserRepository = PostgresDataSource.getRepository(User);
export const OTPRepository = PostgresDataSource.getRepository(OTP);
export const CustomerRepository = PostgresDataSource.getRepository(Customer);
export const PlanRepository = PostgresDataSource.getRepository(Plan);
export const LastActionAtRepository = PostgresDataSource.getRepository(LastActionAt);
