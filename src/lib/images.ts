/**
 * Константы путей к изображениям
 * Все изображения хранятся локально в папке public/images/
 */

export const IMAGE_PATHS = {
  onboarding: {
    step1: '/images/onboarding/step-1.png',
    step2: '/images/onboarding/step-2.png',
    step3: '/images/onboarding/step-3.png',
    step4: '/images/onboarding/step-4.png',
  },
} as const;

/**
 * Получить путь к изображению шага онбординга
 */
export function getOnboardingImage(step: number): string {
  const images = [
    IMAGE_PATHS.onboarding.step1,
    IMAGE_PATHS.onboarding.step2,
    IMAGE_PATHS.onboarding.step3,
    IMAGE_PATHS.onboarding.step4,
  ];
  
  return images[step - 1] || images[0];
}
