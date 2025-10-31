import { BadRequestError } from "../../errors/badRequest.error";
import { NotFoundError } from "../../errors/notFound.error";
import { OwnerType } from "../../enums/OwnerType.enum";
import { SubscriptionPlan } from "../../enums/SubscriptionPlan.enum";
import { SubscriptionStatus } from "../../enums/SubscriptionStatus.enum";
import { TransactionStatus, TransactionType } from "../../enums/Transaction.enums";
import { SubscriptionInput } from "../../validators/app/subscription.validation";
import { SubscriptionRepository, TransactionRepository } from "../../repositories";

/**
 * Create or upgrade a subscription (works for both User and Producer)
 */
export const createOrUpgrade = async (ownerId: number, input: SubscriptionInput) => {
    const { ownerType, plan, amount, providerData } = input;

    if (!ownerId) throw new BadRequestError("ownerId is required");
    if (!ownerType) throw new BadRequestError("ownerType is required");
    if (!plan) throw new BadRequestError("Subscription plan is required");

    // Step 1: Find existing subscription (if any)
    let subscription = await SubscriptionRepository.findOne({ where: { ownerId, ownerType } });

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    // Step 2: Create or update
    if (!subscription) {
        subscription = SubscriptionRepository.create({
            ownerId,
            ownerType,
            plan,
            startDate: now,
            endDate,
            status: SubscriptionStatus.ACTIVE,
            autoRenew: true,
            provider: providerData?.provider || null,
            providerSubscriptionId: providerData?.subscriptionId || null,
        });
    } else {
        subscription.plan = plan;
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.startDate = now;
        subscription.endDate = endDate;
        subscription.provider = providerData?.provider || null;
        subscription.providerSubscriptionId = providerData?.subscriptionId || null;
    }

    await SubscriptionRepository.save(subscription);

    // Step 3: Log transaction
    const transaction = TransactionRepository.create({
        subscription,
        type: TransactionType.PURCHASE,
        status: TransactionStatus.SUCCESS,
        plan,
        amount,
        currency: "USD",
        providerTransactionId: providerData?.transactionId || null,
        message: "Subscription activated successfully.",
    });

    await TransactionRepository.save(transaction);

    return subscription;
};

/**
 * Fetch active subscription (auto-create free if not found)
 */
export const getActiveSubscription = async (ownerId: number, ownerType: OwnerType) => {
    if (!ownerId) throw new BadRequestError("ownerId is required");

    const subscription = await SubscriptionRepository.findOne({
        where: { ownerId, ownerType, status: SubscriptionStatus.ACTIVE },
        relations: ["transactions"],
    });

    if (!subscription) {
        // Create default FREE plan
        const newSub = SubscriptionRepository.create({
            ownerId,
            ownerType,
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.ACTIVE,
        });
        return await SubscriptionRepository.save(newSub);
    }

    return subscription;
};

/**
 * Cancel subscription manually
 */
export const cancelSubscription = async (ownerId: number, ownerType: OwnerType) => {
    const subscription = await SubscriptionRepository.findOne({
        where: { ownerId, ownerType, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription) throw new NotFoundError("Active subscription not found");

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.autoRenew = false;

    await SubscriptionRepository.save(subscription);

    // Record cancel transaction
    const transaction = TransactionRepository.create({
        subscription,
        type: TransactionType.DOWNGRADE,
        status: TransactionStatus.SUCCESS,
        plan: subscription.plan,
        amount: 0,
        currency: "USD",
        message: "Subscription canceled.",
    });
    await TransactionRepository.save(transaction);

    return subscription;
};

/**
 * Get all transactions for an owner (user or producer)
 */
export const getMyTransactions = async (ownerId: number, ownerType: OwnerType) => {
    const subscription = await SubscriptionRepository.findOne({
        where: { ownerId, ownerType },
        relations: ["transactions"],
    });

    if (!subscription) throw new NotFoundError("Subscription not found for this owner");
    return subscription.transactions;
};

export * as SubscriptionService from "./subscription.service";
