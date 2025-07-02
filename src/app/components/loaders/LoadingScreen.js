import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Loader, LoaderStyle4Component, LoaderStyle5Component, LoaderStyle6Component, LoaderStyle7Component, LoaderStyle8Component, LoaderThree, LoaderTwo } from './Loader';

const Wrapper = styled.div`
  text-align: center;
  font-family: "Gill sans", sans-serif;
  width: 80%;
`;

const LoaderContainer = styled.div`
  height: 100px;
  width: 20%;
  text-align: center;
  padding: 1em;
  display: inline-block;
  vertical-align: top;
`;

const fillColor = '#1e293b';

const scaleAnimation = keyframes`
  0% { transform: scale(1, 1); }
  50% { transform: scale(1, 3); }
  100% { transform: scale(1, 1); }
`;

const Bar = styled.rect`
  fill: ${fillColor};
  animation: ${scaleAnimation} 0.6s ease-in-out infinite;
`;

const FirstBar = styled(Bar)`
  animation-delay: 0s;
`;

const SecondBar = styled(Bar)`
  animation-delay: 0.2s;
`;

const ThirdBar = styled(Bar)`
  animation-delay: 0.4s;
`;
const ForthBar = styled(Bar)`
  animation-delay: 0.6s;
`;
const FifthBar = styled(Bar)`
  animation-delay: 0.8s;
`;

export default function LoadingScreen() {
  return (
    <Wrapper className='flex w-full justify-between'>
     <Loader/>
    </Wrapper>
  );
}
