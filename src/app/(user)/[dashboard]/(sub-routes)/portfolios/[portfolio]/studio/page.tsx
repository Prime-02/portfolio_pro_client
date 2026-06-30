"use client"
import PortfolioMain from '@/portfolio-builder/components/PortfolioMain'
import { useParams } from 'next/navigation';
import React from 'react'

const PortfolioStudio = () => {
  const params = useParams();
  const portfolioId = params.portfolio as string;

  return (
    <PortfolioMain portfolioId={portfolioId} viewOnly={false} />
  )
}

export default PortfolioStudio