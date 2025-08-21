import {
  ProducerRepository,
  WellnessRepository,
  ProducerServiceRepository,
  ServiceTypeRepository,
} from '../../repositories';
import { BadRequestError } from '../../errors/badRequest.error';
import { NotFoundError } from '../../errors/notFound.error';
import { CreateServiceInput } from '../../validators/producer/service.validation';

export const getServiceTypes = async () => {
  const serviceTypes = await ServiceTypeRepository.find({
    order: { name: "ASC" },
  });
  return serviceTypes;
};

export const createService = async (userId: number, data: CreateServiceInput) => {

  const producer = await ProducerRepository.findOne({ where: { userId } });
  if (!producer) throw new NotFoundError("Producer not found");

  if (producer.type !== "wellness") {
    throw new BadRequestError("Only wellness producers can create services");
  }

  const wellness = await WellnessRepository.findOne({
    where: { producerId: producer.id },
  });
  if (!wellness) throw new NotFoundError("Wellness record not found for this producer");

  if (!data.serviceTypeId) throw new BadRequestError("Service type is required");

  const serviceType = await ServiceTypeRepository.findOne({
    where: { id: data.serviceTypeId },
  });
  if (!serviceType) throw new NotFoundError("Invalid Service Type provided");

  const newService = await ProducerServiceRepository.save({
    ...data,
    producerId: producer.id,
    wellnessId: wellness.id,
    serviceTypeId: serviceType.id,
    isActive: true,
    isDeleted: false,
  });

  return {
    message: "Service created successfully.",
    service: newService,
  };
};

export const getAllServices = async (userId: number, isActive?: boolean) => {
  const producer = await ProducerRepository.findOne({ where: { userId } });
  if (!producer) throw new NotFoundError("Producer not found");

  const wellness = await WellnessRepository.findOne({
    where: { producerId: producer.id },
  });
  if (!wellness) throw new NotFoundError("Wellness profile not found for this producer");

  const services = await ProducerServiceRepository.find({
    where: {
      wellnessId: wellness.id,
      isDeleted: false,
      ...(isActive !== undefined ? { isActive } : {}),
    },
    relations: ["serviceType", "wellness"],
  });

  return services;
};

export const getServiceById = async (userId: number, serviceId: number) => {
  const producer = await ProducerRepository.findOne({ where: { userId } });
  if (!producer) throw new NotFoundError("Producer not found");

  const wellness = await WellnessRepository.findOne({ where: { producerId: producer.id } });
  if (!wellness) throw new NotFoundError("Wellness profile not found for this producer");

  const service = await ProducerServiceRepository.findOne({
    where: { id: serviceId, wellnessId: wellness.id, isDeleted: false },
    relations: ["serviceType", "wellness"],
  });

  if (!service) throw new NotFoundError("Service not found");

  return service;
};

export const updateService = async (userId: number, serviceId: number, data: Partial<CreateServiceInput>) => {
  const producer = await ProducerRepository.findOne({ where: { userId } });
  if (!producer) throw new NotFoundError("Producer not found");

  const wellness = await WellnessRepository.findOne({ where: { producerId: producer.id } });
  if (!wellness) throw new NotFoundError("Wellness profile not found for this producer");

  const service = await ProducerServiceRepository.findOne({
    where: { id: serviceId, wellnessId: wellness.id, isDeleted: false },
  });
  if (!service) throw new NotFoundError("Service not found");

  Object.assign(service, data);
  await ProducerServiceRepository.save(service);

  return {
    message: "Service updated successfully.",
    service,
  };
};

export const deleteService = async (userId: number, serviceId: number) => {
  const producer = await ProducerRepository.findOne({ where: { userId } });
  if (!producer) throw new NotFoundError("Producer not found");

  const wellness = await WellnessRepository.findOne({ where: { producerId: producer.id } });
  if (!wellness) throw new NotFoundError("Wellness profile not found for this producer");

  const service = await ProducerServiceRepository.findOne({
    where: { id: serviceId, wellnessId: wellness.id, isDeleted: false },
  });
  if (!service) throw new NotFoundError("Service not found");

  service.isDeleted = true;
  await ProducerServiceRepository.save(service);

  return {
    message: "Service deleted successfully.",
  };
};

export * as ServiceService from "./services.service";
