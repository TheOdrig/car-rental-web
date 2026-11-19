import { API, parseIdParam, proxy } from '@/shared/server';

export const PUT = proxy<{ id: string }>({
    target: ({ id }) => API.admin.damages.updateAssessment.resolve({ id: parseIdParam(id, 'damage ID') }),
    errorMessage: 'Failed to update the assessment',
});

export const POST = proxy<{ id: string }>({
    target: ({ id }) => API.admin.damages.assess.resolve({ id: parseIdParam(id, 'damage ID') }),
    errorMessage: 'Failed to assess damage',
});
