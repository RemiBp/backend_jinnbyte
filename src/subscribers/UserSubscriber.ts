import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from "typeorm";
import { User } from "../models/User";
import { LastActionAtRepository, UserRepository } from "../repositories";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  @AfterInsert()
  async afterInsert(event: InsertEvent<User>) {
    try {
      const entity = event.entity;
      if (!entity) return;
      const lastActionAt = await LastActionAtRepository.findOne({ where: { user: { id: entity.id } } });
      if (!lastActionAt) {
        await LastActionAtRepository.save({ user: entity, timestamp: new Date() });
        return;
      }
      lastActionAt.timestamp = new Date();
      await LastActionAtRepository.save(lastActionAt);
    } catch (error) {
      console.error("Error in afterInsert UserSubscriber", error);
    }
  }

  @AfterUpdate()
  async afterUpdate(event: UpdateEvent<User>) {
    try {
      const entity = event.entity;
      if (!entity) return;
      const lastActionAt = await LastActionAtRepository.findOne({ where: { user: { id: entity.id } } });
      if (!lastActionAt) {
        await LastActionAtRepository.save({ user: entity, timestamp: new Date() });
        return;
      }
      lastActionAt.timestamp = new Date();
      await LastActionAtRepository.save(lastActionAt);
    } catch (error) {
      console.error("Error in afterUpdate UserSubscriber", error);
    }
  }

  @AfterRemove()
  async afterRemove(event: RemoveEvent<User>) {
    try {
      const entity = event.entity;
      if (!entity) return;
      const lastActionAt = await LastActionAtRepository.findOne({ where: { user: { id: entity.id } } });
      if (!lastActionAt) {
        await LastActionAtRepository.save({ user: entity, timestamp: new Date() });
        return;
      }
      lastActionAt.timestamp = new Date();
      await LastActionAtRepository.save(lastActionAt);
    } catch (error) {
      console.error("Error in afterRemove UserSubscriber", error);
    }
  }
}
