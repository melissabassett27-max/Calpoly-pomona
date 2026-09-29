'use client';

import { CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const STEPPER_STAGES = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Academic' },
  { id: 3, label: 'Supporting' },
  { id: 4, label: 'Program' },
  { id: 5, label: 'Review' },
  { id: 6, label: 'Payment' },
  { id: 7, label: 'Submit' },
];

interface ApplicationStepperProps {
  currentStep: number;
  app: any;
  title?: string;
}

function isStageComplete(stageId: number, app: any): boolean {
  if (!app) return false;
  const submitted = app?.status === 'submitted';
  const allSections =
    app?.section1Complete && app?.section2Complete && app?.section3Complete && app?.section4Complete;
  switch (stageId) {
    case 1:
      return Boolean(app?.section1Complete);
    case 2:
      return Boolean(app?.section2Complete);
    case 3:
      return Boolean(app?.section3Complete);
    case 4:
      return Boolean(app?.section4Complete);
    case 5:
      return Boolean(allSections);
    case 6:
    case 7:
      return Boolean(submitted);
    default:
      return false;
  }
}

export function ApplicationStepper({ currentStep, app, title = 'Cal Poly Pomona Application' }: ApplicationStepperProps) {
  const completedCount = STEPPER_STAGES.filter((s) => isStageComplete(s.id, app)).length;
  const progress = Math.round((completedCount / STEPPER_STAGES.length) * 100);

  return (
    <div className="bg-white border-b">
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-lg md:text-xl font-bold text-[#1E5631]">{title}</h1>
          <span className="text-sm text-muted-foreground shrink-0">{progress}% Complete</span>
        </div>

        <Progress value={progress} className="h-2 [&>div]:bg-[#D4A017] mb-4" />

        {/* Horizontal 7-stage tracker */}
        <ol
          className="flex items-start gap-0 overflow-x-auto pb-2"
          aria-label={`Application progress: step ${currentStep} of ${STEPPER_STAGES.length}`}
        >
          {STEPPER_STAGES.map((stage, idx) => {
            const complete = isStageComplete(stage.id, app);
            const isCurrent = stage.id === currentStep;
            const isLast = idx === STEPPER_STAGES.length - 1;
            return (
              <li
                key={stage.id}
                className="flex-1 min-w-[72px] flex flex-col items-center relative"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      complete ? 'bg-[#1E5631]' : 'bg-muted'
                    }`}
                    aria-hidden="true"
                  />
                )}
                {/* Node */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 ${
                    complete
                      ? 'bg-[#1E5631] border-[#1E5631] text-white'
                      : isCurrent
                      ? 'bg-white border-[#D4A017] text-[#D4A017]'
                      : 'bg-white border-muted text-muted-foreground'
                  }`}
                >
                  {complete ? <CheckCircle2 className="w-5 h-5" /> : stage.id}
                </div>
                <span
                  className={`mt-1.5 text-[11px] md:text-xs text-center leading-tight ${
                    isCurrent ? 'font-semibold text-[#1E5631]' : 'text-muted-foreground'
                  }`}
                >
                  {stage.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
