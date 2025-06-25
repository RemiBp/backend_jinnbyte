export const businessRoles = ['restaurant', 'leisure', 'wellness'] as const;

export type BusinessRole = typeof businessRoles[number];
