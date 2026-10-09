import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FragmentBar } from '@/shared/components/fragment-bar/fragment-bar';

/** A bar 400 px wide starting at x = 100, so each of 4 fragments is 100 px. */
const RECT = { left: 100, width: 400, top: 0, height: 24, right: 500, bottom: 24, x: 100, y: 0 };

describe('FragmentBar', () => {
  const seek = vi.fn();
  let fillRect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    seek.mockReset();
    fillRect = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      fillRect,
      set fillStyle(_value: string) {},
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT as DOMRect);
    HTMLElement.prototype.setPointerCapture = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  const setup = (inputs: Record<string, unknown>) =>
    render(FragmentBar, { inputs: { total: 4, ...inputs }, on: { seek } });

  const pointer = (type: 'pointerDown' | 'pointerMove' | 'pointerUp', x: number) =>
    fireEvent[type](screen.getByRole('slider'), { clientX: x, pointerId: 1 });

  describe('as the position indicator of the sender', () => {
    it('is a slider with its value as a position in the sequence', async () => {
      await setup({ current: 1, interactive: true });

      const slider = screen.getByRole('slider', { name: 'Posición en la secuencia de QR' });
      expect(slider.getAttribute('aria-valuemin')).toBe('1');
      expect(slider.getAttribute('aria-valuemax')).toBe('4');
      expect(slider.getAttribute('aria-valuenow')).toBe('2');
      expect(slider.getAttribute('aria-valuetext')).toBe('QR 2 de 4');
      expect(slider.getAttribute('tabindex')).toBe('0');
    });

    it('puts the marker in the middle of the slice of the current fragment', async () => {
      const { container } = await setup({ current: 1, interactive: true });

      const marker = container.querySelector<HTMLElement>('[style*="left"]');
      expect(marker?.style.left).toBe('37.5%');
    });

    it('chooses the fragment pressed on the bar', async () => {
      await setup({ current: 0, interactive: true });

      await pointer('pointerDown', 350);
      await pointer('pointerUp', 350);

      expect(seek).toHaveBeenCalledTimes(1);
      expect(seek).toHaveBeenCalledWith(2);
    });

    it('follows a drag with the marker and chooses the fragment where it is released', async () => {
      const { container } = await setup({ current: 0, interactive: true });

      await pointer('pointerDown', 120);
      await pointer('pointerMove', 480);

      expect(container.querySelector<HTMLElement>('[style*="left"]')?.style.left).toBe('87.5%');
      expect(seek).not.toHaveBeenCalled();
      await pointer('pointerUp', 480);
      expect(seek).toHaveBeenCalledWith(3);
    });

    it('keeps the position inside the sequence when the pointer goes beyond the bar', async () => {
      await setup({ current: 0, interactive: true });

      await pointer('pointerDown', 9999);
      await pointer('pointerUp', 9999);
      await pointer('pointerDown', -50);
      await pointer('pointerUp', -50);

      expect(seek).toHaveBeenNthCalledWith(1, 3);
      expect(seek).toHaveBeenNthCalledWith(2, 0);
    });

    it('can be driven with the keyboard', async () => {
      await setup({ current: 1, interactive: true });
      const slider = screen.getByRole('slider');

      await fireEvent.keyDown(slider, { key: 'ArrowRight' });
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      await fireEvent.keyDown(slider, { key: 'Home' });
      await fireEvent.keyDown(slider, { key: 'End' });
      await fireEvent.keyDown(slider, { key: 'PageUp' });
      await fireEvent.keyDown(slider, { key: 'PageDown' });
      await fireEvent.keyDown(slider, { key: 'a' });

      expect(seek.mock.calls.map(([index]) => index)).toEqual([2, 0, 0, 3, 3, 0]);
    });
  });

  describe('as the received-fragments indicator of the receiver', () => {
    it('is an image described by its label, not a slider, and does not react to the pointer', async () => {
      await setup({ received: new Set([0, 2]), label: 'Fragmentos recibidos' });

      const bar = screen.getByRole('img', { name: 'Fragmentos recibidos' });
      expect(screen.queryByRole('slider')).toBeNull();
      await fireEvent.pointerDown(bar, { clientX: 350, pointerId: 1 });
      await fireEvent.pointerUp(bar, { clientX: 350, pointerId: 1 });
      await fireEvent.keyDown(bar, { key: 'ArrowRight' });
      expect(seek).not.toHaveBeenCalled();
    });

    it('paints a slice for each received fragment and has no marker', async () => {
      const { container } = await setup({ total: 10, received: new Set([0, 4]) });

      expect(fillRect).toHaveBeenCalledTimes(2);
      expect(fillRect).toHaveBeenCalledWith(0, 0, 100, 1);
      expect(fillRect).toHaveBeenCalledWith(400, 0, 100, 1);
      expect(container.querySelector('[style*="left"]')).toBeNull();
    });

    it('repaints when more fragments arrive', async () => {
      const { fixture } = await setup({ total: 10, received: new Set([0]) });
      fillRect.mockClear();

      fixture.componentRef.setInput('received', new Set([0, 1, 2]));
      await fixture.whenStable();

      expect(fillRect).toHaveBeenCalledTimes(3);
    });
  });
});
