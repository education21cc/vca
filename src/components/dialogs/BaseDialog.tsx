import React, { PropsWithChildren } from 'react';
import './styles/baseDialog.scss';

interface Props {
  className: string;
}

const BaseDialog = (props: PropsWithChildren<any>) => {
  return (
    <div className={`basedialog ${props.className}`}>
        {props.children}
    </div>
  );
}

export default BaseDialog;