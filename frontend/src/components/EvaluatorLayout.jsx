import { Outlet } from 'react-router-dom';
import EvaluatorSidebar from './EvaluatorSidebar';
import './EvaluatorLayout.css';

const EvaluatorLayout = () => {
  return (
    <div className="evaluator-layout">
      <EvaluatorSidebar />
      <div className="evaluator-content">
        <Outlet />
      </div>
    </div>
  );
};

export default EvaluatorLayout;
