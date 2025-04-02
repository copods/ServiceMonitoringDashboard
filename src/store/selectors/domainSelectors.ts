import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { Service } from 'types/service';
import { Domain } from 'types/domain';

const selectAllServices = (state: RootState): Service[] => state.services.items;

export const selectServicesByDomainId = (domainId: string) =>
  createSelector(selectAllServices, (services: Service[]) =>
    services.filter((service) => service.domainId === domainId)
  );

export const selectTotalServicesByDomainId = (domainId: string) =>
  createSelector(
    selectServicesByDomainId(domainId),
    (domainServices) => domainServices.length
  );

export const selectCriticalServicesByDomainId = (domainId: string) =>
  createSelector(
    selectServicesByDomainId(domainId),
    (domainServices) =>
      domainServices.filter((service) => service.status === 'critical').length
  );

// Selector to get all domains
export const selectAllDomains = (state: RootState): Domain[] => state.domains;
