// @ts-nocheck
import express from "express";
import { Request, Response, Router } from "express";
import stripe from "stripe";
import { UserRepository, CustomerRepository } from "../repositories";
import { PlanRepository } from "../repositories";
import AuthService from "../services/auth.service";

const subscriptionRouter = Router();

const endpointSecret = "whsec_uC58ewmY2ZwFwrcilo0WBG4ecSNWtbII";

const stripeObject = new stripe(process.env.STRIPE_SECRET_KEY);

const mapStripeProductToInternalPlanId = async (stripeProductId: string) => {
  try {
    const product = await stripeObject.products.retrieve(stripeProductId);
    return await PlanRepository.findOne({ where: { stripeProductId: product.id } });
  } catch (error) {
    console.error("Error in mapStripeProductToInternalPlanId", { error: error.toString(), stripeProductId });
    throw error;
  }
};

subscriptionRouter.post(
  "/onSubscription",
  express.raw({ type: "application/json" }),
  async (request: Request, response: Response) => {
    const sig = request.headers["stripe-signature"] as string | undefined;

    let event;

    try {
      event = stripeObject.webhooks.constructEvent(request.body, sig, endpointSecret);

      if (event.type === "checkout.session.completed") {
        console.log(`🔔  Payment received!`);

        const session = event.data.object;
        // Retrieve the subscription details
        const subscription = await stripeObject.subscriptions.retrieve(session.subscription as string);
        // Assuming the first item's plan/product ID represents the subscription's plan/product

        const planIdOnStripe = subscription.items.data[0].price.product;

        // get plan id from stripe product id

        const customer_database_id = session.client_reference_id;
        const customer = await stripeObject.customers.retrieve(session.customer as string);
        const customer_email = customer.email;

        // search user by either email or id
        let user = await UserRepository.findOne({
          where: [{ email: customer_email }, { id: customer_database_id }],
          relations: ["customer"],
        });

        if (!user) {
          console.log(`🔔  User not found in database`);

          // create a user
          user = await AuthService.createUser(customer_email);

          console.log(`🔔  User added to database`, user);
        }

        console.log(`🔔  Customer: ${customer.id} ${customer.email} ${customer.name}`);

        // Retrieve or determine your internal plan ID based on Stripe's product/plan ID
        const plan = await mapStripeProductToInternalPlanId(planIdOnStripe);

        if (!plan) {
          return response.status(400).send(`Plan not found`);
        }

        if (user.customer) {
          console.log(`🔔  Customer already exists in database`);
          // Update the existing customer with the new planId
          await CustomerRepository.update(user.customer.id, {
            planId: yourInternalPlanId,
            // Update other fields as necessary
          });
          console.log(`🔔  Customer plan updated in database`);
          return response.send({ received: true });
        } else {
          // If the customer does not exist, create a new customer entry
          const newCustomer = await CustomerRepository.save({
            stripeCustomerId: customer.id,
            stripeSubscriptionId: session.subscription,
            customerEmail: customer.email,
            user: user,
            isActive: false,
            isTrial: true,
            plan: plan,
          });

          console.log(`🔔  Customer added to database with plan ID`, newCustomer);
          return response.status(201).send({ received: true });
        }
      } else {
        return response.status(400).send(`Event not handled: ${event.type}`);
      }
    } catch (error) {
      console.error("Error in onSubscription webhook handler", { error: error.toString(), body: request.body });
      response.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default subscriptionRouter;
