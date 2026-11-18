import { describe, it, expect, vi, beforeEach } from 'vitest';

const redirectMock = vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
});
const notFoundMock = vi.fn(() => {
    throw new Error('NOT_FOUND');
});

vi.mock('next/navigation', () => ({
    redirect: (path: string) => redirectMock(path),
    notFound: () => notFoundMock(),
}));

vi.mock('../(admin)/admin/rentals/[id]/rental-detail-content', () => ({ RentalDetailContent: () => null }));
vi.mock('../(admin)/admin/users/[id]/customer-detail-content', () => ({ CustomerDetailContent: () => null }));
vi.mock('../(admin)/admin/fleet/[id]/vehicle-detail-content', () => ({ VehicleDetailContent: () => null }));
vi.mock('../(admin)/admin/fleet/[id]/edit/edit-car-content', () => ({ EditCarContent: () => null }));
vi.mock('../(admin)/admin/damages/[id]/damage-detail-content', () => ({ DamageDetailContent: () => null }));
vi.mock('../(protected)/rentals/[id]/rental-detail-content', () => ({ RentalDetailContent: () => null }));
vi.mock('../(protected)/damages/[id]/my-damage-detail-content', () => ({ MyDamageDetailContent: () => null }));

import AdminRentalPage from '../(admin)/admin/rentals/[id]/page';
import AdminUserPage from '../(admin)/admin/users/[id]/page';
import AdminVehiclePage from '../(admin)/admin/fleet/[id]/page';
import AdminEditCarPage from '../(admin)/admin/fleet/[id]/edit/page';
import AdminDamagePage from '../(admin)/admin/damages/[id]/page';
import MyRentalPage from '../(protected)/rentals/[id]/page';
import MyDamagePage from '../(protected)/damages/[id]/page';

type IdPage = (props: { params: Promise<{ id: string }> }) => Promise<unknown>;

const pages: Array<[string, IdPage]> = [
    ['admin rental', AdminRentalPage as IdPage],
    ['admin user', AdminUserPage as IdPage],
    ['admin vehicle', AdminVehiclePage as IdPage],
    ['admin edit car', AdminEditCarPage as IdPage],
    ['admin damage', AdminDamagePage as IdPage],
    ['my rental', MyRentalPage as IdPage],
    ['my damage', MyDamagePage as IdPage],
];

describe('id route pages validate on the server', () => {
    beforeEach(() => {
        redirectMock.mockClear();
        notFoundMock.mockClear();
    });

    it.each(pages)('%s page renders for a numeric id', async (_name, Page) => {
        await expect(Page({ params: Promise.resolve({ id: '42' }) })).resolves.toBeTruthy();
        expect(redirectMock).not.toHaveBeenCalled();
        expect(notFoundMock).not.toHaveBeenCalled();
    });

    it.each(pages)('%s page leaves for an invalid id instead of navigating during render', async (_name, Page) => {
        for (const id of ['abc', '1x', '-1', '1.5', '99999999999999999999']) {
            await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow(/REDIRECT|NOT_FOUND/);
        }
    });

    it('sends invalid admin rental ids back to the rentals list', async () => {
        await expect(AdminRentalPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow('REDIRECT:/admin/rentals');
    });
});
