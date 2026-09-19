import { useState } from 'react';

function StepRail({ steps }) {
    const [current, setCurrent] = useState(0);

    return (
        <div className="step-rail">
            {steps.map((step, index) => (
                <a
                    key={step.href}
                    href={step.href}
                    className={`step-chip${index === current ? ' is-current' : ''}`}
                    onClick={() => setCurrent(index)}
                >
                    {step.label}
                </a>
            ))}
        </div>
    );
}

export default StepRail;
