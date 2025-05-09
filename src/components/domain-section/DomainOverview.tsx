import React from 'react';
import { Domain } from 'types/domain';
import {
  selectTotalServicesByDomainId,
  selectCriticalServicesByDomainId
} from 'store/selectors/domainSelectors';
import { useAppSelector } from 'store';
import { Icon } from '../common/Icon';

interface DomainOverviewProps {
  domain: Domain;
}

export const DomainOverview: React.FC<DomainOverviewProps> = ({ domain }) => {
  const totalServices = useAppSelector(selectTotalServicesByDomainId(domain.id));
  const criticalServices = useAppSelector(selectCriticalServicesByDomainId(domain.id));

  return (
    <div className="flex items-center align-middle py-2 px-4 gap-1 bg-[#2E2F34] border-b border-gray-700">
      <Icon border={true} domain={domain} />
      <div className='flex-row'>
        <h2 className="text-lg font-semibold text-white mb-2">{domain.name}</h2>
        <div className="flex items-center text-gray-300">
          <span className="text-2xl font-bold mr-1">{totalServices}</span>
          <span className="text-sm mr-4">Services</span>

          <span className="inline-block w-2 h-2 bg-red-500 mr-1"></span>

          <span className="text-2xl font-bold mr-1">{criticalServices}</span>
          <span className="text-sm">Critical</span>
        </div>
      </div>

    </div>
  );
};

export default DomainOverview;
