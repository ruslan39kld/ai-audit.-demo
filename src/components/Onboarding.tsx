import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Rocket, Sparkles, Layout, FolderOpen, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemo: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose, onLoadDemo }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Добро пожаловать в AI Audit!",
      description: "Профессиональная система для проведения глубокого AI-аудита бизнес-проектов. Мы поможем оценить готовность компании к внедрению AI и рассчитать юнит-экономику.",
      icon: <Rocket className="w-12 h-12 text-accent" />,
    },
    {
      title: "AI-аналитик всегда рядом",
      description: "Нажмите на иконку искры в углу в любом разделе. Аналитик видит контекст вашего экрана и поможет подготовиться к встрече или найти противоречия в документах.",
      icon: <Sparkles className="w-12 h-12 text-accent" />,
    },
    {
      title: "Начните с документов",
      description: "Загрузите финмодель или описание процесса. Система автоматически извлечет цифры и заполнит анкету аудита, экономя ваше время.",
      icon: <FolderOpen className="w-12 h-12 text-accent" />,
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Начало работы"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${step === i + 1 ? 'bg-accent w-4' : 'bg-[var(--border)]'}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary">Далее</button>
            ) : (
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary">Начать с нуля</button>
                <button 
                  onClick={() => {
                    onLoadDemo();
                    onClose();
                  }} 
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Загрузить демо
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col items-center text-center py-6"
        >
          <div className="mb-6 p-4 bg-accent/10 rounded-3xl">
            {currentStepData.icon}
          </div>
          <h2 className="text-xl font-bold mb-3">{currentStepData.title}</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {currentStepData.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};
