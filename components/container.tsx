import { ReactNode, FunctionComponent } from 'react';

type Props = {
  children?: ReactNode
}

const Container: FunctionComponent = ({ children }: Props) => {
  return <div className="container-fluid p-5">{children}</div>
}

export default Container;
