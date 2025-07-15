export const PLAN_NAMES = {
    FREE: "Free",
    ESSAY_HACK: "essay_hack",
    ESSAY_HACK_PLUS: "essay_hack_plus",
    ESSAY_HACK_PRO: "essay_hack_pro", // Unified from hack_pro
};

export const PLAN_LIMITS = {
    [PLAN_NAMES.FREE]: {
        MONTHLY: { maxEssays: 1, isMonthly: false },
    },
    [PLAN_NAMES.ESSAY_HACK]: {
        MONTHLY: { maxEssays: 5, isMonthly: true },
        YEARLY: { maxEssays: 60, isMonthly: false },
    },
    [PLAN_NAMES.ESSAY_HACK_PLUS]: {
        MONTHLY: { maxEssays: 10, isMonthly: true },
        YEARLY: { maxEssays: 120, isMonthly: false },
    },
    [PLAN_NAMES.ESSAY_HACK_PRO]: {
        MONTHLY: { maxEssays: Infinity, isMonthly: true },
        YEARLY: { maxEssays: Infinity, isMonthly: false },
    },
};
