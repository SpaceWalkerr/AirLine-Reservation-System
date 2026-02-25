import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';

interface Step {
  label: string;
  icon: LucideIcon;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`step-circle ${
                  isActive ? 'step-active' : isCompleted ? 'step-completed' : 'step-inactive'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? 'text-brand-500' : isCompleted ? 'text-emerald-500' : ''
                }`}
                style={{ color: !isActive && !isCompleted ? 'var(--color-text-4)' : undefined }}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="step-line mx-2 mb-5">
                <div
                  className="step-line-fill"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}